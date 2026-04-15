import { useState } from 'react';
import { X, Send, Loader2, AlertCircle, CheckCircle, User, Mail, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Contact } from '../../types';

interface Props {
  contact: Contact | null;
  contacts?: Contact[];
  onClose: () => void;
  templateSubject?: string;
  templateBody?: string;
}

const TEMPLATES = [
  {
    name: 'B2B Website + Automation Intro',
    subject: 'Quick question about {{company_name}}',
    body: `Hi {{first_name}},

I came across {{company_name}} and was impressed by what you've built over the years.

I work with {{industry}} businesses to modernise their operations — from professional websites to automation tools that eliminate repetitive admin work. Most clients see a 40%+ reduction in manual tasks within the first month.

Would you be open to a quick 15-minute call to explore if this could help {{company_name}}?

Best,
Steve Pillon`,
  },
  {
    name: 'Accounting & AI Tools Pitch',
    subject: 'Cutting admin time at {{company_name}}',
    body: `Hi {{first_name}},

Running a {{industry}} business means dealing with a lot of operational overhead — invoicing, bookkeeping, client follow-ups, reporting.

We've helped companies like yours automate these with AI-powered tools that integrate with your existing systems. One recent client went from 15 hours/week of admin to under 3.

I'd love to show you what that could look like for {{company_name}}. Free to chat this week?

Steve Pillon`,
  },
  {
    name: 'Follow-Up (No Reply)',
    subject: 'Re: Quick question about {{company_name}}',
    body: `Hi {{first_name}},

Just bumping this up briefly. We recently helped a {{industry}} firm automate their invoicing and client onboarding — saved them roughly £2,000/month in admin costs.

Happy to show you what that would look like for {{company_name}}. No pressure either way.

Steve`,
  },
  {
    name: 'Final Breakup Email',
    subject: 'Last one from me, {{first_name}}',
    body: `Hi {{first_name}},

No worries if the timing isn't right — I know things are busy.

I'll leave you with this: we've helped 50+ UK businesses cut operational overhead by 30-50% with modern websites, accounting automation, and AI tools.

If things change, I'm always here: steve@pillon.com

Best,
Steve`,
  },
  {
    name: 'Construction-Specific',
    subject: 'Quoting & invoicing for {{company_name}}',
    body: `Hi {{first_name}},

I noticed {{company_name}} has been in the construction space for a while — congrats on the growth.

A lot of construction firms we work with were stuck with manual quoting, paper invoices, and spreadsheet project tracking. We built them custom digital systems that:

• Generate professional quotes in minutes (not hours)
• Auto-send invoices when milestones are hit
• Track projects and subcontractors in one dashboard
• Give clients a portal to view progress

Would it be worth a 15-min chat to see if this fits {{company_name}}?

Steve Pillon`,
  },
  {
    name: 'Recruitment-Specific',
    subject: 'Candidate management for {{company_name}}',
    body: `Hi {{first_name}},

Recruitment is one of those industries where the difference between a good placement and a missed one often comes down to speed and organisation.

We help staffing firms like {{company_name}} build:

• Custom candidate portals with automated screening
• Job board integrations that pull listings into one dashboard
• AI-powered matching that ranks candidates by fit
• Automated follow-up sequences for candidates and clients

If you're open to a quick chat about how this could help, I'm free this week.

Steve Pillon`,
  },
];

function replaceVars(text: string, contact: Contact): string {
  return text
    .replace(/{{first_name}}/g, contact.firstName || 'there')
    .replace(/{{last_name}}/g, contact.lastName || '')
    .replace(/{{company_name}}/g, contact.accountName || 'your company')
    .replace(/{{title}}/g, contact.title || 'Director')
    .replace(/{{industry}}/g, contact.personaType || 'B2B');
}

export default function SendEmailModal({ contact, contacts, onClose, templateSubject, templateBody }: Props) {
  const { toast, contactOps } = useApp();
  const isBulk = contacts && contacts.length > 0;
  const targetCount = isBulk ? contacts!.length : 1;

  const [fromEmail, setFromEmail] = useState('steve@pillon.com');
  const [fromName, setFromName] = useState('Steve Pillon');
  const [subject, setSubject] = useState(templateSubject || TEMPLATES[0].subject);
  const [body, setBody] = useState(templateBody || TEMPLATES[0].body);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [useApiKey, setUseApiKey] = useState('');

  const applyTemplate = (idx: number) => {
    setSelectedTemplate(idx);
    setSubject(TEMPLATES[idx].subject);
    setBody(TEMPLATES[idx].body);
  };

  const preview = contact ? replaceVars(body, contact) : body;
  const previewSubject = contact ? replaceVars(subject, contact) : subject;

  const sendToContact = async (c: Contact) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (useApiKey) headers['x-resend-key'] = useApiKey;

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: c.email,
        from: fromEmail,
        fromName,
        subject: replaceVars(subject, c),
        html: `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#333">${replaceVars(body, c).replace(/\n/g, '<br>')}</div>`,
        text: replaceVars(body, c),
        replyTo: fromEmail,
      }),
    });
    return res.ok;
  };

  const send = async () => {
    setSending(true);
    const targets = isBulk ? contacts! : (contact ? [contact] : []);
    let ok = 0, fail = 0;

    for (const c of targets) {
      try {
        const success = await sendToContact(c);
        if (success) {
          ok++;
          contactOps.update(c.id, { outreachStatus: 'in_sequence', lastActivity: new Date().toISOString() });
        } else fail++;
      } catch { fail++; }
      setSent(ok); setFailed(fail);
      // Rate limit: 100ms between sends
      await new Promise(r => setTimeout(r, 100));
    }

    setSending(false);
    if (ok > 0) toast('success', `Sent ${ok} email${ok > 1 ? 's' : ''} successfully`);
    if (fail > 0) toast('warning', `${fail} email${fail > 1 ? 's' : ''} failed — check API key`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-3xl bg-[var(--bg)] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Send size={14} style={{ color: 'var(--primary)' }} />
            {isBulk ? `Send to ${targetCount} contacts` : `Send email to ${contact?.firstName} ${contact?.lastName}`}
          </h2>
          <button onClick={onClose}><X size={16} style={{ color: 'var(--text-3)' }} /></button>
        </div>

        <div className="flex">
          {/* Templates sidebar */}
          <div className="w-48 border-r p-3 flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: 'var(--text-3)' }}>TEMPLATES</p>
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => applyTemplate(i)}
                className="block w-full text-left text-[11px] py-1.5 px-2 rounded mb-1 transition-colors"
                style={{ background: selectedTemplate === i ? 'var(--primary)' : 'transparent', color: selectedTemplate === i ? 'white' : 'var(--text-2)' }}>
                {t.name}
              </button>
            ))}
          </div>

          {/* Compose area */}
          <div className="flex-1 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>From Name</label>
                <input value={fromName} onChange={e => setFromName(e.target.value)} className="input text-xs w-full mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>From Email</label>
                <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} className="input text-xs w-full mt-1" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="input text-xs w-full mt-1" />
            </div>

            <div>
              <label className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={10}
                className="input text-xs w-full mt-1 font-mono" style={{ lineHeight: 1.6 }} />
              <p className="text-[9px] mt-1" style={{ color: 'var(--text-3)' }}>
                Variables: {'{{first_name}} {{last_name}} {{company_name}} {{title}} {{industry}}'}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>Resend API Key (optional — or set RESEND_API_KEY in Vercel)</label>
              <input value={useApiKey} onChange={e => setUseApiKey(e.target.value)} className="input text-xs w-full mt-1" placeholder="re_..." type="password" />
            </div>

            {/* Preview */}
            {contact && (
              <div className="rounded-lg p-3" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-3)' }}>PREVIEW</p>
                <p className="text-xs font-semibold mb-1">{previewSubject}</p>
                <p className="text-[11px] whitespace-pre-wrap" style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{preview}</p>
              </div>
            )}

            {/* Send progress */}
            {sending && (
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(91,110,249,0.08)' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p className="text-xs">Sending... {sent}/{targetCount} sent{failed > 0 ? `, ${failed} failed` : ''}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">Cancel</button>
              <button onClick={send} disabled={sending} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {isBulk ? `Send ${targetCount} emails` : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
