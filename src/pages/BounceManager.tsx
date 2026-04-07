import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Trash2, AlertCircle, UserX, Shield, ToggleLeft, ToggleRight, Brain } from 'lucide-react';

type Tab = 'bounces' | 'unsubscribes';
type BounceFilter = 'all' | 'hard' | 'soft';

const BOUNCES = [
  { id:'b1', email:'john.smith@oldcorp.com',   name:'John Smith',   company:'OldCorp',    type:'hard', reason:'Mailbox does not exist',    date:'2026-04-05', campaign:'Q2 SaaS Outreach' },
  { id:'b2', email:'sarah@fullmail.net',        name:'Sarah Blake',  company:'FullMail',   type:'soft', reason:'Mailbox full',               date:'2026-04-04', campaign:'FinTech Leaders' },
  { id:'b3', email:'ceo@shutdown.io',           name:'Alex Moore',   company:'Shutdown IO',type:'hard', reason:'Domain does not exist',      date:'2026-04-03', campaign:'Enterprise Push' },
  { id:'b4', email:'bounce@spamtrap.net',       name:'Unknown',      company:'—',          type:'hard', reason:'Spam trap detected',         date:'2026-04-02', campaign:'RevOps Campaign' },
  { id:'b5', email:'temp@mailinator.com',       name:'Test User',    company:'—',          type:'soft', reason:'Temporary delivery failure', date:'2026-04-01', campaign:'SaaS Scale-Up' },
];

const UNSUBS = [
  { id:'u1', email:'opt.out@example.com',   name:'Marcus Chen',   reason:'Unsubscribed via link',date:'2026-04-05', campaign:'Q2 Outreach',      sentiment:'Neutral',  sentColor:'#f59e0b' },
  { id:'u2', email:'spam.report@gmail.com', name:'Lisa Park',     reason:'Spam complaint',       date:'2026-04-04', campaign:'FinTech Leaders',   sentiment:'Negative', sentColor:'#ef4444' },
  { id:'u3', email:'noemail@company.com',   name:'Robert Davis',  reason:'Manual unsubscribe',   date:'2026-04-03', campaign:'Enterprise Push',   sentiment:'Timing',   sentColor:'#10b981' },
  { id:'u4', email:'remove@business.co',    name:'Amy Wilson',    reason:'Unsubscribed via link',date:'2026-04-02', campaign:'SaaS Campaign',     sentiment:'Neutral',  sentColor:'#f59e0b' },
];

export default function BounceManager() {
  const { toast } = useApp();
  const [tab, setTab] = useState<Tab>('bounces');
  const [filter, setFilter] = useState<BounceFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [autoSuppress, setAutoSuppress] = useState(true);
  const [globalUnsub, setGlobalUnsub] = useState(true);

  const filteredBounces = BOUNCES.filter(b => filter === 'all' || b.type === filter);

  const toggle = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const hardCount = BOUNCES.filter(b => b.type === 'hard').length;
  const softCount = BOUNCES.filter(b => b.type === 'soft').length;
  const hardRate = ((hardCount / (hardCount + softCount + 200)) * 100).toFixed(1);
  const softRate = ((softCount / (hardCount + softCount + 200)) * 100).toFixed(1);

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Bounce & Unsubscribe Manager</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Manage delivery failures and opt-outs for CAN-SPAM compliance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Bounces',     value:BOUNCES.length,  color:'#ef4444', icon:AlertCircle },
          { label:'Hard Bounce Rate',  value:`${hardRate}%`,  color:'#ef4444', icon:AlertCircle },
          { label:'Soft Bounce Rate',  value:`${softRate}%`,  color:'#f59e0b', icon:AlertCircle },
          { label:'Unsubscribes',      value:UNSUBS.length,   color:'#8b5cf6', icon:UserX },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background:`${s.color}15` }}>
                <Icon size={15} style={{ color:s.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color:'var(--text)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background:'var(--surface-2)' }}>
        {(['bounces','unsubscribes'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 text-sm rounded-lg capitalize font-medium transition-all"
            style={{ background:tab===t?'var(--accent)':'transparent', color:tab===t?'#fff':'var(--text-3)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'bounces' ? (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['all','hard','soft'] as BounceFilter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
                  style={{ background:filter===f?'var(--accent-dim)':'var(--surface-2)', color:filter===f?'#5b6ef9':'var(--text-3)', border:filter===f?'1px solid rgba(91,110,249,0.3)':'1px solid var(--border)' }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAutoSuppress(!autoSuppress)}
                className="flex items-center gap-2 text-xs" style={{ color:'var(--text-2)' }}>
                {autoSuppress ? <ToggleRight size={20} style={{ color:'#10b981' }}/> : <ToggleLeft size={20} style={{ color:'var(--text-3)' }}/>}
                Auto-suppress hard bounces
              </button>
              {selected.size > 0 && (
                <button className="btn-danger text-xs" onClick={() => { setSelected(new Set()); toast('success', `Removed ${selected.size} from all lists`); }}>
                  <Trash2 size={12}/>Remove {selected.size} from lists
                </button>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>{['','Email','Name','Company','Type','Reason','Date','Campaign'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredBounces.map(b => (
                  <tr key={b.id} className="tr">
                    <td className="td w-10"><input type="checkbox" checked={selected.has(b.id)} onChange={()=>toggle(b.id)} className="w-3.5 h-3.5 rounded" /></td>
                    <td className="td text-xs font-mono">{b.email}</td>
                    <td className="td">{b.name}</td>
                    <td className="td" style={{ color:'var(--text-2)' }}>{b.company}</td>
                    <td className="td">
                      <span className={`badge text-[10px] ${b.type==='hard'?'badge-red':'badge-amber'}`}>{b.type}</span>
                    </td>
                    <td className="td text-xs" style={{ color:'var(--text-2)' }}>{b.reason}</td>
                    <td className="td text-xs" style={{ color:'var(--text-3)' }}>{b.date}</td>
                    <td className="td text-xs" style={{ color:'var(--text-3)' }}>{b.campaign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setGlobalUnsub(!globalUnsub)}
                className="flex items-center gap-2 text-xs" style={{ color:'var(--text-2)' }}>
                {globalUnsub ? <ToggleRight size={20} style={{ color:'#10b981' }}/> : <ToggleLeft size={20} style={{ color:'var(--text-3)' }}/>}
                Global unsubscribe list active
              </button>
            </div>
            <button className="btn-secondary text-xs" onClick={() => toast('success', 'Unsubscribe list exported')}>
              <Download size={12}/>Export List
            </button>
          </div>

          <div className="p-4 rounded-xl flex items-start gap-3" style={{ background:'rgba(91,110,249,0.06)', border:'1px solid rgba(91,110,249,0.15)' }}>
            <Shield size={14} style={{ color:'#5b6ef9', marginTop:1, flexShrink:0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>CAN-SPAM Compliance</p>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-2)' }}>All opt-out requests are honored within 10 business days as required by CAN-SPAM. Unsubscribed contacts are automatically suppressed from all future campaigns.</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  {['Email','Name','Reason','AI Sentiment','Date','Campaign'].map(h => <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {UNSUBS.map(u => (
                  <tr key={u.id} className="tr">
                    <td className="td text-xs font-mono">{u.email}</td>
                    <td className="td">{u.name}</td>
                    <td className="td">
                      <span className={`badge text-[10px] ${u.reason==='Spam complaint'?'badge-red':'badge-gray'}`}>{u.reason}</span>
                    </td>
                    <td className="td">
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit"
                        style={{ background:`${u.sentColor}15`, color:u.sentColor }}>
                        <Brain size={9}/>{u.sentiment}
                      </span>
                    </td>
                    <td className="td text-xs" style={{ color:'var(--text-3)' }}>{u.date}</td>
                    <td className="td text-xs" style={{ color:'var(--text-3)' }}>{u.campaign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
