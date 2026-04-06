import { useState } from 'react';
import { Search, Inbox, Mail, CheckCircle, XCircle, Eye, Reply, MinusCircle, AlertCircle, Filter } from 'lucide-react';
import { contacts, campaigns } from '../data/sampleData';

const outreachContacts = contacts.filter(c => c.outreachStatus !== 'not_contacted');

const msgStatus = [
  { id:'m1', contactId:'con-001', contactName:'Sarah Chen', company:'Stripe', subject:'Quick question about Stripe', status:'replied', date:'2026-03-24', preview:'Thanks for reaching out! We are actually evaluating tools like yours…', campaign:'Q1 Fintech Outreach' },
  { id:'m2', contactId:'con-005', contactName:'Jordan Kim', company:'Rippling', subject:'Re: RevOps automation', status:'replied', date:'2026-03-25', preview:'Happy to chat. Can we do Thursday at 2pm PST?', campaign:'RevOps Leaders Q1' },
  { id:'m3', contactId:'con-008', contactName:'Natasha Brooks', company:'Intercom', subject:'Customer success workflows', status:'replied', date:'2026-03-23', preview:'Interesting — tell me more about how this works for CS teams.', campaign:'SaaS Scale-Up Campaign' },
  { id:'m4', contactId:'con-002', contactName:'Marcus Johnson', company:'Notion', subject:'Growth at Notion', status:'opened', date:'2026-03-22', preview:'Quick question about Notion...', campaign:'SaaS Scale-Up Campaign' },
  { id:'m5', contactId:'con-010', contactName:'Michelle Torres', company:'Segment', subject:'Data ops for Segment', status:'opened', date:'2026-03-20', preview:'Hi Michelle, I noticed Segment recently…', campaign:'Q1 Fintech Outreach' },
  { id:'m6', contactId:'con-011', contactName:'Kevin Zhang', company:'Calendly', subject:'Sales automation — quick question', status:'opened', date:'2026-03-20', preview:'Hi Kevin, saw you\'re scaling the sales team…', campaign:'SaaS Scale-Up Campaign' },
  { id:'m7', contactId:'con-004', contactName:'Alex Rivera', company:'Linear', subject:'Linear + sales tooling', status:'delivered', date:'2026-03-19', preview:'Hi Alex, quick question about your sales ops setup…', campaign:'SaaS Scale-Up Campaign' },
  { id:'m8', contactId:'con-003', contactName:'Priya Patel', company:'Figma', subject:'Revenue ops at Figma', status:'delivered', date:'2026-03-21', preview:'Hi Priya, I\'ve been following Figma\'s growth…', campaign:'Q1 Fintech Outreach' },
  { id:'m9', contactId:'con-006', contactName:'Taylor Washington', company:'Brex', subject:'SDR efficiency at Brex', status:'bounced', date:'2026-03-18', preview:'Hi Taylor, saw that Brex\'s SDR team…', campaign:'RevOps Leaders Q1' },
  { id:'m10', contactId:'con-014', contactName:'Amanda Scott', company:'Drift', subject:'Pipeline generation', status:'unsubscribed', date:'2026-03-10', preview:'Hi Amanda…', campaign:'Q1 Fintech Outreach' },
];

const statusConfig: Record<string, {icon: any, style: string, label: string}> = {
  replied: { icon: Reply, style: 'bg-indigo-50 text-indigo-700', label: 'Replied' },
  opened: { icon: Eye, style: 'bg-amber-50 text-amber-700', label: 'Opened' },
  delivered: { icon: CheckCircle, style: 'bg-blue-50 text-blue-600', label: 'Delivered' },
  sent: { icon: Mail, style: 'bg-gray-100 text-gray-600', label: 'Sent' },
  bounced: { icon: AlertCircle, style: 'bg-red-50 text-red-600', label: 'Bounced' },
  unsubscribed: { icon: MinusCircle, style: 'bg-gray-100 text-gray-400', label: 'Unsubscribed' },
  interested: { icon: CheckCircle, style: 'bg-emerald-50 text-emerald-700', label: 'Interested' },
  not_interested: { icon: XCircle, style: 'bg-gray-100 text-gray-400', label: 'Not Interested' },
};

const stats = [
  { label:'Total Sent', value:'4,810', color:'text-gray-900' },
  { label:'Delivered', value:'4,723', pct:'98.2%', color:'text-blue-600' },
  { label:'Opened', value:'1,790', pct:'37.2%', color:'text-amber-600' },
  { label:'Replied', value:'471', pct:'9.8%', color:'text-indigo-600' },
  { label:'Interested', value:'87', pct:'1.8%', color:'text-emerald-600' },
  { label:'Bounced', value:'87', pct:'1.8%', color:'text-red-500' },
];

export default function OutreachCenter() {
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<typeof msgStatus[0] | null>(msgStatus[0]);

  const filtered = msgStatus.filter(m => {
    const match = !q || m.contactName.toLowerCase().includes(q.toLowerCase()) || m.company.toLowerCase().includes(q.toLowerCase()) || m.subject.toLowerCase().includes(q.toLowerCase());
    const st = filterStatus === 'all' || m.status === filterStatus;
    return match && st;
  });

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="px-4 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Inbox size={16} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Outreach Center</h2>
          </div>
          <div className="relative mb-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search messages…" className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex flex-wrap gap-1">
            {['all','replied','opened','delivered','bounced','unsubscribed'].map(s => (
              <button key={s} onClick={()=>setFilterStatus(s)} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors capitalize ${filterStatus===s?'bg-indigo-600 text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(m => {
            const cfg = statusConfig[m.status];
            const Icon = cfg?.icon ?? Mail;
            return (
              <div key={m.id} onClick={()=>setSelected(m)} className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id===m.id?'bg-indigo-50/50':''}`}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {m.contactName.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{m.contactName}</p>
                      <p className="text-xs text-gray-400">{m.company}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${cfg?.style}`}>
                    <Icon size={10} />{cfg?.label}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-700 truncate mb-0.5">{m.subject}</p>
                <p className="text-xs text-gray-400 truncate">{m.preview}</p>
                <p className="text-xs text-gray-300 mt-1">{m.date}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Stats bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-sm font-bold ${s.color}`}>{s.value}{s.pct ? <span className="text-xs font-normal text-gray-400 ml-1">({s.pct})</span> : ''}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Message view */}
        {selected ? (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{selected.subject}</h3>
                  {(() => { const cfg = statusConfig[selected.status]; const Icon = cfg?.icon ?? Mail; return <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg?.style}`}><Icon size={12}/>{cfg?.label}</span>; })()}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span><span className="font-medium text-gray-700">From:</span> Sarah Miller &lt;sarah@company.com&gt;</span>
                  <span><span className="font-medium text-gray-700">To:</span> {selected.contactName} &lt;{contacts.find(c=>c.id===selected.contactId)?.email}&gt;</span>
                  <span>{selected.date}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">Campaign: <span className="text-indigo-600 font-medium">{selected.campaign}</span></div>
              </div>
              <div className="px-6 py-5">
                <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
                  <p>Hi {selected.contactName.split(' ')[0]},</p>
                  <br />
                  <p>{selected.preview}</p>
                  <br />
                  <p>I've been following {selected.company}'s growth and think there could be a strong fit for what we're building at ProspectIQ. We help sales teams like yours go from ICP to booked meetings in days, not weeks.</p>
                  <br />
                  <p>Worth a 15-min call to show you how teams similar to {selected.company} are using this?</p>
                  <br />
                  <p>Best,<br />Sarah Miller<br />ProspectIQ</p>
                </div>
              </div>

              {selected.status === 'replied' && (
                <div className="px-6 py-5 bg-indigo-50/50 border-t border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Reply size={14} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Reply from {selected.contactName}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.preview}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Reply</button>
                    <button className="flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50">Mark Interested</button>
                    <button className="flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50">Book Meeting</button>
                    <button className="flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50">Pause Sequence</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Inbox size={40} className="mx-auto mb-3 opacity-30" />
              <p>Select a message to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
