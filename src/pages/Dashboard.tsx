import { useApp } from '../context/AppContext';
import { TrendingUp, Users, Mail, DollarSign, ArrowUpRight, ArrowDownRight, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const revenueData = [
  {month:'Jan',value:34000},{month:'Feb',value:42000},{month:'Mar',value:38000},
  {month:'Apr',value:51000},{month:'May',value:47000},{month:'Jun',value:62000},
  {month:'Jul',value:58000},{month:'Aug',value:71000},{month:'Sep',value:67000},
  {month:'Oct',value:79000},{month:'Nov',value:84000},{month:'Dec',value:91000},
];
const replyData = [
  {day:'Mon',rate:12},{day:'Tue',rate:19},{day:'Wed',rate:16},{day:'Thu',rate:23},
  {day:'Fri',rate:18},{day:'Sat',rate:8},{day:'Sun',rate:5},
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-2)' }}>{label}</p>
      <p className="font-semibold">{typeof payload[0].value === 'number' && payload[0].value > 1000 ? `$${payload[0].value.toLocaleString()}` : `${payload[0].value}%`}</p>
    </div>
  );
};

export default function Dashboard() {
  const { accounts, contacts, campaigns, tasks } = useApp();

  const stats = [
    { label: 'Total Leads', value: contacts.length + 1420, change: +12.4, icon: Users, color: '#5b6ef9' },
    { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length, change: +3, icon: Mail, color: '#10b981' },
    { label: 'Pipeline Value', value: '$284K', change: +18.2, icon: DollarSign, color: '#f59e0b' },
    { label: 'Reply Rate', value: '14.7%', change: -1.2, icon: TrendingUp, color: '#8b5cf6' },
  ];

  const recentActivity = [
    { icon: Mail, text: 'Campaign "Q2 Outreach" sent to 240 contacts', time: '2m ago', color: '#5b6ef9' },
    { icon: CheckCircle2, text: 'Jordan Lee replied to your email', time: '15m ago', color: '#10b981' },
    { icon: Users, text: '12 new leads enriched via Apollo', time: '1h ago', color: '#f59e0b' },
    { icon: Zap, text: 'Sequence "SaaS Founders" completed step 3', time: '2h ago', color: '#8b5cf6' },
    { icon: DollarSign, text: 'Acme Corp moved to "Negotiation"', time: '3h ago', color: '#10b981' },
  ];

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>Good morning, Sarah 👋</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Here's what's happening with your pipeline today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          const pos = s.change > 0;
          return (
            <div key={s.label} className="rounded-xl p-5 transition-all hover:shadow-glass"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(s.change)}{typeof s.change === 'number' && s.change % 1 !== 0 ? '%' : ''}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color:"var(--text)" }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="col-span-2 rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color:"var(--text)" }}>Pipeline Revenue</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Last 12 months</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><ArrowUpRight size={12}/>+24.3% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6ef9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5b6ef9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#5b6ef9" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reply rate chart */}
        <div className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold  mb-0.5" style={{ color:"var(--text)" }}>Reply Rate</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>This week by day</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={replyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" fill="#5b6ef9" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity + Tasks */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent activity */}
        <div className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold  mb-4" style={{ color:"var(--text)" }}>Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${a.color}15` }}>
                    <Icon size={13} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs  leading-relaxed" style={{ color:"var(--text)" }}>{a.text}</p>
                  </div>
                  <span className="text-[10px] flex-shrink-0 flex items-center gap-1 mt-0.5"
                    style={{ color: 'var(--text-3)' }}>
                    <Clock size={9} />{a.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending tasks */}
        <div className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color:"var(--text)" }}>Pending Tasks</h3>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(91,110,249,0.15)', color: '#5b6ef9' }}>
              {pendingTasks.length} open
            </span>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: 'var(--border-2)' }} />
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>All tasks complete!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'var(--surface)' }}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <p className="text-xs  flex-1 truncate" style={{ color:"var(--text)" }}>{t.title}</p>
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{t.dueDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
