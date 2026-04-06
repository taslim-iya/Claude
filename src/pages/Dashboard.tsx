import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Building2, Mail, Target, Zap, Calendar, DollarSign, BarChart2, ArrowUpRight, Plus, Upload, Play, Clock, CheckCircle2 } from 'lucide-react';
import { campaigns, activities, teamMembers, emailPerformanceData, funnelData } from '../data/sampleData';

const metrics = [
  { label:'Total Leads', value:'1,247', change:'+124', icon:Target, bg:'bg-indigo-50', color:'text-indigo-600' },
  { label:'Accounts', value:'342', change:'+28', icon:Building2, bg:'bg-violet-50', color:'text-violet-600' },
  { label:'Enriched', value:'892', change:'+67', icon:Zap, bg:'bg-blue-50', color:'text-blue-600' },
  { label:'Verified Emails', value:'743', change:'+51', icon:Mail, bg:'bg-sky-50', color:'text-sky-600' },
  { label:'Active Campaigns', value:'3', change:'+1', icon:Play, bg:'bg-emerald-50', color:'text-emerald-600' },
  { label:'Emails Sent', value:'4,810', change:'+380', icon:Mail, bg:'bg-teal-50', color:'text-teal-600' },
  { label:'Open Rate', value:'37.2%', change:'+2.4%', icon:BarChart2, bg:'bg-amber-50', color:'text-amber-600' },
  { label:'Reply Rate', value:'9.8%', change:'+1.1%', icon:TrendingUp, bg:'bg-orange-50', color:'text-orange-600' },
  { label:'Meetings', value:'42', change:'+8', icon:Calendar, bg:'bg-green-50', color:'text-green-600' },
  { label:'Pipeline', value:'$348K', change:'+$42K', icon:DollarSign, bg:'bg-purple-50', color:'text-purple-600' },
];

const activityIcons: Record<string, string> = {
  meeting_booked:'📅', email_replied:'↩️', email_opened:'👁', email_sent:'📧',
  lead_added:'➕', enrichment_completed:'⚡', stage_changed:'🔄', note_added:'📝', campaign_launched:'🚀',
};

function timeAgo(ts: string) {
  const diff = Math.floor((new Date('2026-03-26').getTime() - new Date(ts).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function Dashboard() {
  const active = campaigns.filter(c => c.status === 'active');
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good morning, Sarah 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your pipeline overview for today.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload size={14} /> Import Leads
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg} ${m.color}`}><Icon size={14} /></div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600"><ArrowUpRight size={10} />{m.change}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Email chart */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Email Performance</h3>
              <p className="text-xs text-gray-400">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />Sent</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Opened</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Replied</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={emailPerformanceData} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                <linearGradient id="gOpen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'12px'}} />
              <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2} fill="url(#gSent)" />
              <Area type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={2} fill="url(#gOpen)" />
              <Area type="monotone" dataKey="replied" stroke="#f59e0b" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pipeline Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((item, i) => (
              <div key={item.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{item.stage}</span>
                  <span className="font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{width:`${(item.count/funnelData[0].count)*100}%`, opacity: 1 - i*0.1}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active Campaigns */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Active Campaigns</h3>
            <a href="#/campaigns" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {active.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><Play size={12} className="text-indigo-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.contactCount} contacts · {c.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><p className="text-sm font-semibold text-gray-900">{c.openRate}%</p><p className="text-xs text-gray-400">Open</p></div>
                  <div className="text-right"><p className="text-sm font-semibold text-gray-900">{c.replyRate}%</p><p className="text-xs text-gray-400">Reply</p></div>
                  <div className="text-right"><p className="text-sm font-semibold text-gray-900">{c.meetingsBooked}</p><p className="text-xs text-gray-400">Meetings</p></div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Activity */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
              <Clock size={13} className="text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {activities.slice(0,6).map(a => (
                <div key={a.id} className="flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50/50">
                  <span className="text-sm mt-0.5 flex-shrink-0">{activityIcons[a.type] ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.timestamp)}{a.owner !== 'System' ? ` · ${a.owner}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Team Leaderboard</h3>
            <div className="space-y-3">
              {teamMembers.slice(0,3).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-4 ${i===0 ? 'text-amber-500' : 'text-gray-400'}`}>#{i+1}</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {m.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <p className="text-xs font-medium text-gray-800 flex-1 truncate">{m.name}</p>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{m.meetingsBooked}</p>
                    <p className="text-xs text-gray-400">mtgs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
