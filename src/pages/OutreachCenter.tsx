import { useState } from 'react';
import { Mail, Reply, Star, Archive, ChevronRight, Search, Circle } from 'lucide-react';

const threads = [
  { id:'t1', name:'Jordan Lee', company:'Stripe', title:'Head of Growth', email:'jordan@stripe.com', subject:'Re: Quick question about growth', preview:'Thanks for reaching out! I\'d love to learn more about your platform...', time:'2m ago', status:'replied', unread:true, avatar:'JL', starred:true },
  { id:'t2', name:'Emily Chen', company:'Notion', title:'VP Engineering', email:'emily@notion.so', subject:'Re: ProspectIQ demo request', preview:'Hi Sarah, thanks for the follow-up. Could we schedule a 30-minute call...', time:'1h ago', status:'interested', unread:true, avatar:'EC', starred:false },
  { id:'t3', name:'Marcus Davis', company:'Figma', title:'Director of Sales', email:'marcus@figma.com', subject:'Quick question about Figma', preview:'Hey Marcus, I noticed that Figma has been expanding its sales team...', time:'3h ago', status:'sent', unread:false, avatar:'MD', starred:false },
  { id:'t4', name:'Priya Patel', company:'Linear', title:'CEO', email:'priya@linear.app', subject:'Following up', preview:'Hi Priya, just circling back on my previous email about...', time:'Yesterday', status:'opened', unread:false, avatar:'PP', starred:true },
  { id:'t5', name:'Alex Thompson', company:'Vercel', title:'CTO', email:'alex@vercel.com', subject:'Q2 SaaS Outreach', preview:'Hi Alex, I\'d love to discuss how ProspectIQ can help Vercel...', time:'2 days ago', status:'sent', unread:false, avatar:'AT', starred:false },
  { id:'t6', name:'Sophie Wang', company:'Loom', title:'VP Product', email:'sophie@loom.com', subject:'Meeting request', preview:'Sophie, I noticed you recently launched a new feature...', time:'2 days ago', status:'bounced', unread:false, avatar:'SW', starred:false },
];

const statusBadge: Record<string,{label:string,color:string,bg:string}> = {
  replied:  { label:'Replied',   color:'#10b981', bg:'rgba(16,185,129,0.12)' },
  interested:{ label:'Interested', color:'#5b6ef9', bg:'rgba(91,110,249,0.12)' },
  sent:     { label:'Sent',      color:'rgba(255,255,255,0.4)', bg:'rgba(255,255,255,0.07)' },
  opened:   { label:'Opened',    color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
  bounced:  { label:'Bounced',   color:'#ef4444', bg:'rgba(239,68,68,0.12)' },
};

export default function OutreachCenter() {
  const [selectedId, setSelectedId] = useState<string|null>('t1');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [starred, setStarred] = useState<Set<string>>(new Set(threads.filter(t=>t.starred).map(t=>t.id)));

  const filters = ['all','replied','interested','opened','sent','bounced'];

  const filtered = threads.filter(t => {
    const matchFilter = filter==='all' || t.status===filter;
    const q = search.toLowerCase();
    const matchSearch = !search || t.name.toLowerCase().includes(q) || t.company.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const selected = threads.find(t => t.id === selectedId);

  return (
    <div className="flex h-full animate-fade-in" style={{ height:'calc(100vh - 56px)' }}>
      {/* Thread list */}
      <div className="flex flex-col border-r" style={{ width:320, borderColor:'rgba(255,255,255,0.07)', background:'#0d0d0d' }}>
        <div className="p-3 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search threads..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }} />
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className="text-[10px] px-2 py-1 rounded capitalize whitespace-nowrap flex-shrink-0"
              style={{ background:filter===f?'rgba(91,110,249,0.2)':'transparent', color:filter===f?'#5b6ef9':'rgba(255,255,255,0.4)' }}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(t => {
            const s = statusBadge[t.status];
            return (
              <div key={t.id}
                onClick={()=>setSelectedId(t.id)}
                className="flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors"
                style={{
                  background: selectedId===t.id?'rgba(91,110,249,0.08)':'transparent',
                  borderBottom:'1px solid rgba(255,255,255,0.04)'
                }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>{t.avatar}</div>
                  {t.unread && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background:'#5b6ef9' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-semibold truncate ${t.unread?'text-white':'text-white/60'}`}>{t.name}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color:'rgba(255,255,255,0.3)' }}>{t.time}</span>
                  </div>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color:'rgba(255,255,255,0.4)' }}>{t.subject}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color:'rgba(255,255,255,0.3)' }}>{t.preview}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thread detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>{selected.avatar}</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{selected.name}</p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background:statusBadge[selected.status].bg, color:statusBadge[selected.status].color }}>
                    {statusBadge[selected.status].label}
                  </span>
                </div>
                <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{selected.title} · {selected.company} · {selected.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setStarred(s=>{const n=new Set(s);n.has(selected.id)?n.delete(selected.id):n.add(selected.id);return n;})}
                style={{ color:starred.has(selected.id)?'#f59e0b':'rgba(255,255,255,0.3)' }}>
                <Star size={16} fill={starred.has(selected.id)?'#f59e0b':'none'}/>
              </button>
              <button style={{ color:'rgba(255,255,255,0.3)' }}><Archive size={15}/></button>
            </div>
          </div>

          {/* Email thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-white">Sarah Miller → {selected.email}</p>
                  <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>Subject: {selected.subject}</p>
                </div>
                <span className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>{selected.time}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.7)' }}>
                Hi {selected.name.split(' ')[0]},<br/><br/>
                I noticed that {selected.company} has been growing its team significantly. I wanted to reach out about ProspectIQ — 
                a platform that helps sales teams like yours find, enrich, and reach out to prospects at scale.<br/><br/>
                Would you be open to a quick 15-minute call this week?<br/><br/>
                Best,<br/>Sarah
              </p>
            </div>

            {(selected.status==='replied'||selected.status==='interested') && (
              <div className="rounded-xl p-4 ml-8" style={{ background:'rgba(91,110,249,0.06)', border:'1px solid rgba(91,110,249,0.15)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold" style={{ color:'#5b6ef9' }}>{selected.name} → you</p>
                  </div>
                  <span className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>{selected.time}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.8)' }}>{selected.preview}</p>
              </div>
            )}
          </div>

          {/* Reply composer */}
          <div className="p-4" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className="px-4 py-2 flex items-center gap-2 text-xs" style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }}>
                <Reply size={11}/>
                <span>Replying to {selected.name}</span>
              </div>
              <textarea rows={3} value={reply} onChange={e=>setReply(e.target.value)}
                placeholder="Type your reply..."
                className="w-full px-4 py-3 text-sm outline-none resize-none"
                style={{ background:'transparent', color:'#fff' }} />
              <div className="flex items-center justify-between px-4 py-2" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)' }}>
                    AI Draft
                  </button>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg"
                  style={{ background:'#5b6ef9', color:'#fff' }}
                  onClick={()=>{ if(reply.trim()){setReply('');} }}>
                  <Mail size={12}/>Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Mail size={36} className="mx-auto mb-3" style={{ color:'rgba(255,255,255,0.1)' }} />
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.3)' }}>Select a thread to read</p>
          </div>
        </div>
      )}
    </div>
  );
}
