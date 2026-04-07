import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, CheckCircle, XCircle, AlertTriangle, Play, Pause, RefreshCw, Shield, Zap, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const domains = [
  { id:'d1', domain:'sarah@prospectiq.io',    spf:'pass', dkim:'pass', dmarc:'pass', score:94, blacklisted:false, limit:500, sent:312 },
  { id:'d2', domain:'outreach@acmecorp.com',  spf:'pass', dkim:'pass', dmarc:'fail', score:72, blacklisted:false, limit:300, sent:298 },
  { id:'d3', domain:'sales@prospectiq.io',    spf:'fail', dkim:'pass', dmarc:'fail', score:41, blacklisted:true,  limit:200, sent:45  },
];

const warmupAccounts = [
  { id:'w1', email:'warmup1@prospectiq.io', day:14, total:30, status:'active',    engagement:86, volume:[2,4,6,8,10,12,14,16,18,20] },
  { id:'w2', email:'warmup2@acmecorp.com',  day:8,  total:30, status:'active',    engagement:91, volume:[2,4,6,8,10,12,14,16] },
  { id:'w3', email:'old@company.com',       day:30, total:30, status:'completed', engagement:88, volume:[2,4,6,8,10,12,14,16,18,20,22,25,28,30,32,35,38,40,42,45,47,50,50,50,50,50,50,50,50,50] },
];

const alerts = [
  { id:'a1', campaign:'Q1 Fintech Campaign',  level:'error',   msg:'Spam rate 2.3% — above 2% threshold. Recommend pausing.', metric:'2.3% spam' },
  { id:'a2', campaign:'SaaS Scale-Up',        level:'warning', msg:'Open rate dropped 40% in 3 days. Possible spam folder placement.', metric:'-40% opens' },
  { id:'a3', campaign:'RevOps Leaders',       level:'success', msg:'Healthy — spam rate 0.4%, open rate stable at 31%.', metric:'0.4% spam' },
];

const staleEmails = [
  { id:'s1', subject:'Quick question about {{company}}', sequence:'SaaS Founders v2', days:18, opens:0, recs:['Refresh subject line','Change sending time'] },
  { id:'s2', subject:'Following up on my last note',    sequence:'FinTech Outreach',  days:12, opens:3, recs:['Reduce send frequency'] },
  { id:'s3', subject:'One more thought...',            sequence:'Enterprise Push',    days:24, opens:0, recs:['Rewrite email body','Change sending time','Pause sequence'] },
];

const placementResults = [
  { provider:'Gmail',   inbox:89, promo:8,  spam:3  },
  { provider:'Outlook', inbox:94, promo:3,  spam:3  },
  { provider:'Yahoo',   inbox:79, promo:12, spam:9  },
  { provider:'iCloud',  inbox:92, promo:5,  spam:3  },
];

function StatusDot({ v }: { v: string }) {
  const ok = v === 'pass';
  return (
    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ok ? 'badge-green' : 'badge-red'}`}>
      {ok ? <CheckCircle size={9}/> : <XCircle size={9}/>} {v.toUpperCase()}
    </span>
  );
}

export default function EmailHealth() {
  const { toast } = useApp();
  const [warmupStatus, setWarmupStatus] = useState<Record<string,string>>(
    Object.fromEntries(warmupAccounts.map(w => [w.id, w.status]))
  );
  const [placementRan, setPlacementRan] = useState(false);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const runPlacement = async () => {
    setPlacementLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setPlacementRan(true);
    setPlacementLoading(false);
    toast('success', 'Inbox placement test complete');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Email Health Monitor</h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Monitor domain health, warmup progress, and spam signals</p>
      </div>

      {/* Domain health */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom:'1px solid var(--border)' }}>
          <Shield size={15} style={{ color:'#5b6ef9' }} />
          <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>Sending Domain Health</h3>
        </div>
        <div className="divide-y" style={{ '--tw-divide-color':'var(--border)' } as any}>
          {domains.map(d => (
            <div key={d.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{d.domain}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {[['SPF',d.spf],['DKIM',d.dkim],['DMARC',d.dmarc]].map(([k,v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <span className="text-[10px]" style={{ color:'var(--text-3)' }}>{k}</span>
                      <StatusDot v={v} />
                    </div>
                  ))}
                  {d.blacklisted && <span className="badge badge-red text-[10px]">Blacklisted</span>}
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-xs" style={{ color:'var(--text-3)' }}>Reputation</p>
                  <p className="text-sm font-bold" style={{ color: d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444' }}>{d.score}/100</p>
                  <div className="w-20 h-1 rounded-full mt-1" style={{ background:'var(--border-2)' }}>
                    <div className="h-full rounded-full" style={{ width:`${d.score}%`, background: d.score>=80?'#10b981':d.score>=60?'#f59e0b':'#ef4444' }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs" style={{ color:'var(--text-3)' }}>Sent today</p>
                  <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{d.sent} / {d.limit}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs" onClick={() => toast('info', `Checking ${d.domain}...`)}>
                  <RefreshCw size={12}/>Check
                </button>
                {d.score < 80 && (
                  <button className="btn-danger text-xs" onClick={() => toast('info', 'Opening DNS fix guide...')}>
                    Fix Issues
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warmup tracker */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom:'1px solid var(--border)' }}>
          <Zap size={15} style={{ color:'#f59e0b' }} />
          <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>Email Warmup Tracker</h3>
        </div>
        <div className="divide-y" style={{ '--tw-divide-color':'var(--border)' } as any}>
          {warmupAccounts.map(w => {
            const status = warmupStatus[w.id];
            const pct = Math.round((w.day / w.total) * 100);
            const chartData = w.volume.map((v, i) => ({ day: i + 1, volume: v }));
            return (
              <div key={w.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{w.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`badge text-[10px] ${status==='active'?'badge-green':status==='completed'?'badge-blue':'badge-amber'}`}>
                        {status}
                      </span>
                      <span className="text-xs" style={{ color:'var(--text-3)' }}>Day {w.day} of {w.total}</span>
                      <span className="text-xs" style={{ color:'var(--text-3)' }}>Engagement: <span style={{ color: w.engagement>=80?'#10b981':'#f59e0b' }}>{w.engagement}%</span></span>
                    </div>
                  </div>
                  {status !== 'completed' && (
                    <button className="btn-secondary text-xs"
                      onClick={() => { setWarmupStatus(s => ({...s, [w.id]: s[w.id]==='active'?'paused':'active'})); toast('info', `Warmup ${status==='active'?'paused':'resumed'}`); }}>
                      {status === 'active' ? <><Pause size={11}/>Pause</> : <><Play size={11}/>Resume</>}
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]" style={{ color:'var(--text-3)' }}>Progress</span>
                    <span className="text-[10px] font-medium" style={{ color:'var(--text-2)' }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background:'var(--border-2)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:'#5b6ef9' }} />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={50}>
                  <AreaChart data={chartData}>
                    <Area type="monotone" dataKey="volume" stroke="#5b6ef9" fill="rgba(91,110,249,0.1)" strokeWidth={1.5} dot={false} />
                    <XAxis hide /><YAxis hide />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spam alerts + Inbox placement */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color:'var(--text)' }}>
              <AlertTriangle size={14} style={{ color:'#ef4444' }}/>Spam Risk Alerts
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {alerts.filter(a => !dismissed.has(a.id)).map(a => (
              <div key={a.id} className="p-3 rounded-xl" style={{ background: a.level==='error'?'rgba(239,68,68,0.07)':a.level==='warning'?'rgba(245,158,11,0.07)':'rgba(16,185,129,0.07)', border:`1px solid ${a.level==='error'?'rgba(239,68,68,0.2)':a.level==='warning'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)'}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-0.5" style={{ color:'var(--text)' }}>{a.campaign}</p>
                    <p className="text-xs" style={{ color:'var(--text-2)' }}>{a.msg}</p>
                  </div>
                  <span className={`badge text-[10px] ${a.level==='error'?'badge-red':a.level==='warning'?'badge-amber':'badge-green'}`}>{a.metric}</span>
                </div>
                <div className="flex gap-2 mt-2.5">
                  {a.level !== 'success' && <button className="btn-danger text-[11px] py-1 px-2" onClick={() => toast('info', 'Campaign paused')}>Pause</button>}
                  <button className="btn-secondary text-[11px] py-1 px-2" onClick={() => toast('info', 'Opening email review...')}>Review</button>
                  <button className="btn-ghost text-[11px] py-1 px-2" onClick={() => setDismissed(s => new Set([...s, a.id]))}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>Inbox Placement Test</h3>
          </div>
          <div className="p-5">
            {!placementRan ? (
              <div className="text-center py-6">
                <Activity size={32} className="mx-auto mb-3" style={{ color:'var(--text-3)' }} />
                <p className="text-sm mb-1" style={{ color:'var(--text)' }}>Test inbox placement</p>
                <p className="text-xs mb-4" style={{ color:'var(--text-3)' }}>Sends to seed addresses across major providers</p>
                <button className="btn-primary text-xs" onClick={runPlacement} disabled={placementLoading}>
                  {placementLoading ? <><RefreshCw size={12} className="animate-spin"/>Running...</> : 'Run Placement Test'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs mb-2" style={{ color:'var(--text-3)' }}>Last run: {new Date().toLocaleTimeString()}</p>
                {placementResults.map(r => (
                  <div key={r.provider}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color:'var(--text)' }}>{r.provider}</span>
                      <div className="flex gap-3 text-[10px]">
                        <span style={{ color:'#10b981' }}>Inbox {r.inbox}%</span>
                        <span style={{ color:'#f59e0b' }}>Promo {r.promo}%</span>
                        <span style={{ color:'#ef4444' }}>Spam {r.spam}%</span>
                      </div>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                      <div style={{ width:`${r.inbox}%`, background:'#10b981' }} />
                      <div style={{ width:`${r.promo}%`,  background:'#f59e0b' }} />
                      <div style={{ width:`${r.spam}%`,   background:'#ef4444' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stale email detector */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:'1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color:'var(--text)' }}>
            <Clock size={14} style={{ color:'#f59e0b' }}/>Stale Email Detector
          </h3>
          <span className="badge badge-amber">{staleEmails.length} stale</span>
        </div>
        <div className="divide-y" style={{ '--tw-divide-color':'var(--border)' } as any}>
          {staleEmails.map(e => (
            <div key={e.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{e.subject}</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>Sequence: {e.sequence}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {e.recs.map(r => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:'var(--accent-dim)', color:'#5b6ef9' }}>💡 {r}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="badge badge-amber">{e.days} days stale</span>
                  <div className="flex gap-1.5 mt-2">
                    <button className="btn-danger text-[11px] py-1 px-2" onClick={() => toast('info', 'Sequence paused')}>Pause</button>
                    <button className="btn-secondary text-[11px] py-1 px-2" onClick={() => toast('info', 'Opening editor...')}>Edit</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
