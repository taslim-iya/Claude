import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, Mail, Play, Pause, BarChart2, Calendar, ChevronLeft, ChevronRight, Brain } from 'lucide-react';

function healthScore(openRate: number, replyRate: number, emailsSent: number): number {
  if (emailsSent === 0) return 0;
  const base = Math.min(openRate * 1.5 + replyRate * 4, 85);
  const bonus = emailsSent > 100 ? 10 : emailsSent > 20 ? 5 : 0;
  return Math.round(Math.min(base + bonus + 5, 100));
}
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SendingSchedule from '../components/ui/SendingSchedule';
import type { CampaignStatus } from '../types';

function statusBadge(status: string) {
  const map: Record<string,string> = {
    active:'bg-emerald-500/15 text-emerald-400',
    paused:'bg-amber-500/15 text-amber-400',
    draft:'bg-gray-500/15 text-gray-400',
    completed:'bg-blue-500/15 text-blue-400',
    scheduled:'bg-indigo-500/15 text-indigo-400',
  };
  return map[status] ?? 'bg-gray-500/15 text-gray-400';
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CampaignCalendar({ campaigns }: { campaigns: ReturnType<typeof useApp>['campaigns'] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = Array.from({length: Math.ceil((firstDay + daysInMonth)/7)*7}, (_,i) => {
    const d = i - firstDay + 1;
    return (d >= 1 && d <= daysInMonth) ? d : null;
  });

  const prev = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const colors = ['#5b6ef9','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color:"var(--text)" }}>{MONTH_NAMES[month]} {year}</h2>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ background:'var(--surface-2)', color:'var(--text-2)' }}><ChevronLeft size={14}/></button>
          <button onClick={next} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ background:'var(--surface-2)', color:'var(--text-2)' }}><ChevronRight size={14}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider py-1"
            style={{ color:'var(--text-3)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const isToday = day===today.getDate() && month===today.getMonth() && year===today.getFullYear();
          const dayCampaigns = day ? campaigns.filter((_,ci)=>(ci+day)%7===0 && (ci%daysInMonth)+1===day).slice(0,2) : [];
          return (
            <div key={i} className="rounded-lg p-1.5 min-h-[70px]"
              style={{ background: day?'var(--surface)':'transparent', border: day?'1px solid var(--border)':'none' }}>
              {day && (
                <>
                  <span className="text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1"
                    style={{ background:isToday?'#5b6ef9':'transparent', color:isToday?'#fff':'var(--text-3)' }}>{day}</span>
                  {campaigns.slice(0, Math.max(0, (day % 3))).map((c,ci)=>(
                    <div key={c.id} className="text-[9px] px-1 py-0.5 rounded truncate mb-0.5"
                      style={{ background:`${colors[ci%colors.length]}20`, color:colors[ci%colors.length] }}>
                      {c.name}
                    </div>
                  )).slice(0,2)}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Campaigns() {
  const { campaigns, campaignOps, toast } = useApp();
  const [tab, setTab] = useState<'list'|'calendar'>('list');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', channel:'email', status:'draft' as CampaignStatus, goal:'', targetList:'' });

  const filtered = campaigns.filter(c => {
    const q = search.toLowerCase();
    return !search || c.name.toLowerCase().includes(q);
  });

  const handleAdd = () => {
    if (!form.name) { toast('error','Campaign name required'); return; }
    campaignOps.add({
      id: crypto.randomUUID(),
      name: form.name,
      channel: form.channel,
      status: form.status,
      goal: form.goal,
      targetList: form.targetList,
      owner: 'Sarah Miller',
      contactCount: 0,
      emailsSent: 0,
      openRate: 0,
      replyRate: 0,
      meetingsBooked: 0,
      createdAt: new Date().toISOString(),
    });
    setShowAdd(false);
    setForm({ name:'', channel:'email', status:'draft', goal:'', targetList:'' });
  };

  const toggleStatus = (id: string, current: string) => {
    const next: CampaignStatus = current === 'active' ? 'paused' : 'active';
    campaignOps.update(id, { status: next });
  };

  const stats = {
    active: campaigns.filter(c=>c.status==='active').length,
    totalSent: campaigns.reduce((a,c)=>a+(c.emailsSent||0),0),
    avgReply: campaigns.length ? Math.round(campaigns.reduce((a,c)=>a+(c.replyRate||0),0) / campaigns.length) : 0,
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>Campaigns</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>{campaigns.length} campaigns · {stats.active} active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg outline-none w-52"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
          </div>
          <div className="flex items-center gap-1 rounded-lg p-0.5"
            style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
            <button onClick={()=>setTab('list')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ background:tab==='list'?'rgba(91,110,249,0.2)':'transparent', color:tab==='list'?'#5b6ef9':'var(--text-2)' }}>
              <BarChart2 size={11}/>List
            </button>
            <button onClick={()=>setTab('calendar')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ background:tab==='calendar'?'rgba(91,110,249,0.2)':'transparent', color:tab==='calendar'?'#5b6ef9':'var(--text-2)' }}>
              <Calendar size={11}/>Calendar
            </button>
          </div>
          <button onClick={()=>setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background:'#5b6ef9', color:'var(--text)' }}>
            <Plus size={13}/>New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Active Campaigns', value:stats.active, icon:Play, color:'#10b981' },
          { label:'Emails Sent', value:stats.totalSent.toLocaleString(), icon:Mail, color:'#5b6ef9' },
          { label:'Avg Reply Rate', value:`${stats.avgReply}%`, icon:BarChart2, color:'#f59e0b' },
        ].map(s=>{
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4 flex items-center gap-4"
              style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:`${s.color}15` }}>
                <Icon size={16} style={{ color:s.color }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color:"var(--text)" }}>{s.value}</p>
                <p className="text-xs" style={{ color:'var(--text-2)' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {tab === 'calendar' ? (
        <div className="rounded-xl p-5"
          style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
          <CampaignCalendar campaigns={campaigns} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Mail size={36} className="mx-auto mb-3" style={{ color:'var(--border-2)' }} />
          <p className="text-sm" style={{ color:'var(--text-3)' }}>No campaigns yet</p>
          <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
            style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Create your first campaign</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl p-5 group transition-all hover:shadow-glass"
              style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:'rgba(91,110,249,0.12)' }}>
                    <Mail size={15} style={{ color:'#5b6ef9' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>{c.name}</h3>
                      {c.status !== 'draft' && (() => {
                        const hs = healthScore(c.openRate||0, c.replyRate||0, c.emailsSent||0);
                        const hsColor = hs >= 70 ? '#10b981' : hs >= 50 ? '#f59e0b' : hs > 0 ? '#ef4444' : 'var(--text-3)';
                        return hs > 0 ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                            title={`AI Health Score: ${hs}/100`}
                            style={{ background:`${hsColor}15`, color:hsColor }}>
                            <Brain size={9}/>AI {hs}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                      <span className="text-[11px]" style={{ color:'var(--text-3)' }}>{c.channel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(c.status === 'active' || c.status === 'paused') && (
                    <button onClick={()=>toggleStatus(c.id, c.status)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>
                      {c.status === 'active' ? <><Pause size={11}/>Pause</> : <><Play size={11}/>Resume</>}
                    </button>
                  )}
                  <button onClick={()=>setDeleteId(c.id)}
                    className="w-7 h-7 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color:'var(--text-3)' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  {label:'Contacts',value:c.contactCount||0},
                  {label:'Sent',value:c.emailsSent||0},
                  {label:'Open Rate',value:`${c.openRate||0}%`},
                  {label:'Reply Rate',value:`${c.replyRate||0}%`},
                ].map(m=>(
                  <div key={m.label}>
                    <p className="text-xs mb-0.5" style={{ color:'var(--text-3)' }}>{m.label}</p>
                    <p className="text-base font-bold" style={{ color:"var(--text)" }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="New Campaign" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Campaign Name *</label>
            <input placeholder="Q2 SaaS Outreach" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Channel</label>
              <select value={form.channel} onChange={e=>setForm(x=>({...x,channel:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {['email','linkedin','phone','multi-channel'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Status</label>
              <select value={form.status} onChange={e=>setForm(x=>({...x,status:e.target.value as CampaignStatus}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {['draft','active','paused'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Goal</label>
            <input placeholder="Book meetings with VP Sales at SaaS companies" value={form.goal} onChange={e=>setForm(x=>({...x,goal:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color:'var(--text-2)' }}>Sending Schedule</p>
            <SendingSchedule />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'var(--text)' }}>Create Campaign</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={()=>setDeleteId(null)}
        onConfirm={()=>{ campaignOps.del(deleteId!); setDeleteId(null); }}
        title="Delete Campaign"
        message="This will permanently delete this campaign and all its data."
        confirmLabel="Delete Campaign"
        variant="danger"
      />
    </div>
  );
}
