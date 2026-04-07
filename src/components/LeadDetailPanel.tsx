import { useState } from 'react';
import { X, Mail, Phone, Building2, User, Calendar, Tag, Star, TrendingUp, Send, ListPlus, MessageSquare } from 'lucide-react';
import type { Contact } from '../types';

interface LeadDetailPanelProps {
  contact: Contact | null;
  onClose: () => void;
}

export default function LeadDetailPanel({ contact, onClose }: LeadDetailPanelProps) {
  const [tab, setTab] = useState<'overview' | 'activity' | 'emails' | 'notes'>('overview');
  const [localStatus, setLocalStatus] = useState(contact?.outreachStatus ?? 'not_contacted');
  const [notes, setNotes] = useState(contact?.notes || '');
  const [savedNotes, setSavedNotes] = useState<string[]>(contact?.notes ? [contact.notes] : []);

  if (!contact) return null;

  const fields = [
    { label: 'Email', value: contact.email, icon: Mail },
    { label: 'Phone', value: contact.phone || '—', icon: Phone },
    { label: 'Company', value: contact.accountName || '—', icon: Building2 },
    { label: 'Title', value: contact.title || '—', icon: User },
    { label: 'Source', value: contact.source || '—', icon: Tag },
    { label: 'Enriched', value: contact.enrichmentStatus?.replace('_', ' ') || '—', icon: Star },
    { label: 'Created', value: new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: Calendar },
    { label: 'Lead Score', value: String(contact.leadScore || 0), icon: TrendingUp },
  ];

  const activities = [
    { type: 'sent', icon: Send, color: '#5b6ef9', label: 'Email sent — "Quick question about {{company}}"', time: '3 days ago' },
    { type: 'opened', icon: Mail, color: '#f59e0b', label: 'Email opened (×3)', time: '2 days ago' },
    { type: 'replied', icon: MessageSquare, color: '#10b981', label: 'Contact replied — interested in a demo', time: '1 day ago' },
    { type: 'note', icon: Tag, color: '#8b5cf6', label: 'Note added — "Seems very interested, follow up with ROI"', time: '12 hours ago' },
    { type: 'call', icon: Phone, color: '#ec4899', label: 'Call attempted — no answer', time: '6 hours ago' },
  ];

  const emails = [
    { subject: 'Quick question about {{company}}', date: '3 days ago', status: 'Opened ×3', statusColor: '#f59e0b' },
    { subject: 'Following up on my last email', date: '6 days ago', status: 'Opened ×1', statusColor: '#f59e0b' },
    { subject: 'Thoughts on your Q2 goals', date: '10 days ago', status: 'Sent', statusColor: 'var(--text-3)' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 39 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: 480, zIndex: 40, background: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', transform: 'translateX(0)', transition: 'transform 300ms ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)', flexShrink: 0 }}>
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{contact.firstName} {contact.lastName}</p>
            <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{contact.title} · {contact.accountName}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {(['overview', 'activity', 'emails', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 14px', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? '#5b6ef9' : 'var(--text-2)', borderBottom: tab === t ? '2px solid #5b6ef9' : '2px solid transparent', background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Overview Tab */}
          {tab === 'overview' && (
            <>
              {/* Status */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 6 }}>Status</label>
                <select value={localStatus} onChange={e => setLocalStatus(e.target.value as typeof localStatus)}
                  style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', outline: 'none' }}>
                  {['not_contacted', 'in_sequence', 'replied', 'interested', 'not_interested', 'unsubscribed', 'bounced'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
                {fields.map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <Icon size={11} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{f.label}</span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: 'Send Email', icon: Send, color: '#5b6ef9' },
                  { label: 'Add to Sequence', icon: MessageSquare, color: '#8b5cf6' },
                  { label: 'Add to List', icon: ListPlus, color: '#10b981' },
                  { label: 'Schedule Meeting', icon: Calendar, color: '#f59e0b' },
                ].map(a => {
                  const Icon = a.icon;
                  return (
                    <button key={a.label}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: 12, fontWeight: 500, borderRadius: 8, border: `1px solid ${a.color}30`, background: `${a.color}10`, color: a.color, cursor: 'pointer' }}>
                      <Icon size={12} />{a.label}
                    </button>
                  );
                })}
              </div>

              {/* AI Insight */}
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(91,110,249,0.06)', border: '1px solid rgba(91,110,249,0.15)', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  💡 <strong style={{ color: 'var(--text)' }}>AI Insight:</strong> {contact.firstName} has opened 3 emails. Suggested next step: Follow up with a case study tailored to {contact.accountName}.
                </p>
              </div>
            </>
          )}

          {/* Activity Tab */}
          {tab === 'activity' && (
            <div style={{ position: 'relative' }}>
              {activities.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} style={{ color: a.color }} />
                    </div>
                    <div style={{ flex: 1, paddingTop: 3 }}>
                      <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Emails Tab */}
          {tab === 'emails' && (
            <>
              {emails.map((e, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{e.subject}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.date}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: e.statusColor }}>{e.status}</span>
                </div>
              ))}
            </>
          )}

          {/* Notes Tab */}
          {tab === 'notes' && (
            <>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add a note..."
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', resize: 'vertical', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
              <button onClick={() => { if (notes.trim()) { setSavedNotes(n => [notes, ...n]); setNotes(''); } }}
                style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, background: '#5b6ef9', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
                Save Note
              </button>
              {savedNotes.map((n, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 8, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {n}
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </>
  );
}
