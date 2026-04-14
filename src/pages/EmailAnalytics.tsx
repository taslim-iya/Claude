import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, Mail, MousePointer, Reply, AlertCircle, UserMinus, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

type Range = '7d' | '30d' | '90d';

const heatmapDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const heatmapHours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

function seed(n: number) { let x = Math.sin(n + 1) * 10000; return x - Math.floor(x); }
function heatmapVal(d: number, h: number) {
  const base = seed(d * 24 + h) * 100;
  const workdayBoost = d < 5 ? 20 : -30;
  const morningBoost = h >= 9 && h <= 11 ? 30 : h >= 14 && h <= 16 ? 15 : 0;
  return Math.max(0, Math.min(100, base + workdayBoost + morningBoost));
}

const DEVICE_DATA = [{ name:'Desktop', value:68, fill:'#5b6ef9' },{ name:'Mobile', value:32, fill:'#8b5cf6' }];
const CLIENT_DATA = [
  { name:'Gmail',      value:45, fill:'#5b6ef9' },
  { name:'Outlook',    value:30, fill:'#8b5cf6' },
  { name:'Apple Mail', value:15, fill:'#10b981' },
  { name:'Other',      value:10, fill:'var(--text-3)' },
];

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background:'var(--modal-bg)', border:'1px solid var(--border-2)', boxShadow:'var(--shadow-modal)' }}>
      <p className="font-semibold mb-1.5" style={{ color:'var(--text-2)' }}>{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color:p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function EmailAnalytics() {
  const { campaigns } = useApp();
  const [range, setRange] = useState<Range>('30d');
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  const totals = useMemo(() => {
    const sent = campaigns.reduce((a, c) => a + (c.emailsSent || 0), 0);
    const openRate = campaigns.length
      ? Math.round(campaigns.reduce((a, c) => a + (c.openRate || 0), 0) / campaigns.length * 10) / 10
      : 0;
    const replyRate = campaigns.length
      ? Math.round(campaigns.reduce((a, c) => a + (c.replyRate || 0), 0) / campaigns.length * 10) / 10
      : 0;
    return { sent, openRate, clickRate: 0, replyRate, bounceRate: 0, unsubRate: 0 };
  }, [campaigns]);

  const daily = useMemo(() => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      opens: 0, clicks: 0, replies: 0,
    }));
  }, [days]);

  const stats = [
    { label:'Emails Sent',   value: totals.sent > 0 ? totals.sent.toLocaleString() : '—', icon:Mail,        color:'#5b6ef9' },
    { label:'Open Rate',     value: totals.openRate > 0 ? `${totals.openRate}%` : '—',    icon:TrendingUp,  color:'#10b981' },
    { label:'Click Rate',    value: totals.clickRate > 0 ? `${totals.clickRate}%` : '—',  icon:MousePointer,color:'#8b5cf6' },
    { label:'Reply Rate',    value: totals.replyRate > 0 ? `${totals.replyRate}%` : '—',  icon:Reply,       color:'#f59e0b' },
    { label:'Bounce Rate',   value: totals.bounceRate > 0 ? `${totals.bounceRate}%` : '—',icon:AlertCircle, color:'#ef4444' },
    { label:'Unsub Rate',    value: totals.unsubRate > 0 ? `${totals.unsubRate}%` : '—',  icon:UserMinus,   color:'var(--text-2)' },
  ];

  if (campaigns.length === 0) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Email Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Track opens, clicks, and replies across all campaigns</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart2 size={40} className="mb-4" style={{ color:'var(--border-2)' }} />
          <p className="text-base font-semibold mb-1" style={{ color:'var(--text)' }}>No campaign data yet</p>
          <p className="text-sm" style={{ color:'var(--text-3)' }}>Create and send campaigns to start seeing analytics here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Email Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Track opens, clicks, and replies across all campaigns</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background:'var(--surface-2)' }}>
          {(['7d','30d','90d'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
              style={{ background: range===r?'var(--accent)':'transparent', color: range===r?'#fff':'var(--text-3)' }}>
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 hover:shadow-glow transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${typeof s.color === 'string' && s.color.startsWith('#') ? s.color : '#6b7280'}18` }}>
                  <Icon size={13} style={{ color:s.color }} />
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color:'var(--text)' }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color:'var(--text-3)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color:'var(--text)' }}>Opens · Clicks · Replies over time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={daily} margin={{ top:4, right:4, left:-16, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill:'var(--text-3)', fontSize:10 }} axisLine={false} tickLine={false}
              interval={Math.floor(days/7)} />
            <YAxis tick={{ fill:'var(--text-3)', fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CT />} />
            <Legend wrapperStyle={{ fontSize:12, color:'var(--text-2)' }} />
            <Line type="monotone" dataKey="opens"   stroke="#5b6ef9" strokeWidth={2.5} dot={false} name="Opens" />
            <Line type="monotone" dataKey="clicks"  stroke="#10b981" strokeWidth={2.5} dot={false} name="Clicks" />
            <Line type="monotone" dataKey="replies" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Replies" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>Campaign Breakdown</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Campaign','Sent','Open Rate','Click Rate','Reply Rate','Bounced'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.slice(0, 6).map(c => (
              <tr key={c.id} className="tr">
                <td className="td"><span className="font-medium">{c.name}</span></td>
                <td className="td">{(c.emailsSent || 0).toLocaleString()}</td>
                <td className="td"><span style={{ color:'#10b981' }}>{c.openRate || 0}%</span></td>
                <td className="td">—</td>
                <td className="td"><span style={{ color:'#f59e0b' }}>{c.replyRate || 0}%</span></td>
                <td className="td"><span style={{ color:'#ef4444' }}>—</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap + device/client row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Heatmap */}
        <div className="card p-5 col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color:'var(--text)' }}>Best Send Times (Engagement Heatmap)</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1 mb-1 ml-8">
              {heatmapHours.map(h => (
                <div key={h} className="w-8 text-center text-[9px]" style={{ color:'var(--text-3)' }}>
                  {h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`}
                </div>
              ))}
            </div>
            {heatmapDays.map((day, di) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <span className="w-7 text-[10px] text-right mr-1" style={{ color:'var(--text-3)' }}>{day}</span>
                {heatmapHours.map(h => {
                  const v = heatmapVal(di, h);
                  const alpha = v / 100;
                  return (
                    <div key={h} title={`${day} ${h}:00 — ${Math.round(v)}% engagement`}
                      className="w-8 h-5 rounded cursor-pointer transition-opacity hover:opacity-80"
                      style={{ background: `rgba(${v > 50 ? '16,185,129' : v > 25 ? '245,158,11' : '239,68,68'},${0.15 + alpha * 0.75})` }} />
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 ml-8">
              {[['Low','#ef4444'],['Med','#f59e0b'],['High','#10b981']].map(([l,c]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background:c }} />
                  <span className="text-[10px]" style={{ color:'var(--text-3)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device + client */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold mb-3" style={{ color:'var(--text)' }}>Device Breakdown</h3>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={3}>
                  {DEVICE_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background:'var(--modal-bg)', border:'1px solid var(--border-2)', borderRadius:8, fontSize:11 }} />
                <Legend wrapperStyle={{ fontSize:11, color:'var(--text-2)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold mb-3" style={{ color:'var(--text)' }}>Email Clients</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={CLIENT_DATA} layout="vertical" margin={{ left:10, right:10 }}>
                <XAxis type="number" tick={{ fill:'var(--text-3)', fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill:'var(--text-2)', fontSize:10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background:'var(--modal-bg)', border:'1px solid var(--border-2)', borderRadius:8, fontSize:11 }} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {CLIENT_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* A/B Test Results */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color:'var(--text)' }}>
            <BarChart2 size={14} style={{ color:'#5b6ef9' }} />A/B Test Results
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <BarChart2 size={28} className="mb-2" style={{ color:'var(--border-2)' }} />
          <p className="text-sm font-medium" style={{ color:'var(--text-2)' }}>No A/B tests yet</p>
          <p className="text-xs mt-1" style={{ color:'var(--text-3)' }}>Set up A/B tests in your campaigns to compare subject lines and copy</p>
        </div>
      </div>
    </div>
  );
}
