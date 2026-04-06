import { useState } from 'react';
import { Plus, Play, Pause, MoreHorizontal, Mail, Users, BarChart2, Calendar, ChevronRight } from 'lucide-react';
import { campaigns } from '../data/sampleData';
import { useNavigate } from 'react-router-dom';

const statusStyle: Record<string, {bg:string, dot:string, label:string}> = {
  active: { bg:'bg-emerald-50 text-emerald-700', dot:'bg-emerald-500', label:'Active' },
  draft: { bg:'bg-gray-100 text-gray-600', dot:'bg-gray-400', label:'Draft' },
  scheduled: { bg:'bg-blue-50 text-blue-700', dot:'bg-blue-500', label:'Scheduled' },
  paused: { bg:'bg-amber-50 text-amber-700', dot:'bg-amber-500', label:'Paused' },
  completed: { bg:'bg-indigo-50 text-indigo-600', dot:'bg-indigo-400', label:'Completed' },
};

export default function Campaigns() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const tabs = ['all', 'active', 'draft', 'scheduled', 'paused', 'completed'];
  const shown = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

  const totals = {
    sent: campaigns.reduce((a,c)=>a+c.emailsSent, 0),
    meetings: campaigns.reduce((a,c)=>a+c.meetingsBooked, 0),
    avgOpen: (campaigns.filter(c=>c.emailsSent>0).reduce((a,c)=>a+c.openRate,0)/campaigns.filter(c=>c.emailsSent>0).length).toFixed(1),
    avgReply: (campaigns.filter(c=>c.emailsSent>0).reduce((a,c)=>a+c.replyRate,0)/campaigns.filter(c=>c.emailsSent>0).length).toFixed(1),
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500">Manage all your outbound prospecting campaigns.</p>
        </div>
        <button onClick={()=>navigate('/campaigns/sequence')} className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors">
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:'Total Emails Sent', value:totals.sent.toLocaleString(), icon:Mail, color:'text-indigo-600 bg-indigo-50'},
          {label:'Avg Open Rate', value:totals.avgOpen+'%', icon:BarChart2, color:'text-amber-600 bg-amber-50'},
          {label:'Avg Reply Rate', value:totals.avgReply+'%', icon:BarChart2, color:'text-emerald-600 bg-emerald-50'},
          {label:'Meetings Booked', value:totals.meetings, icon:Calendar, color:'text-violet-600 bg-violet-50'},
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.color}`}><Icon size={14} /></div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={()=>setFilter(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter===t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {shown.map(c => {
          const st = statusStyle[c.status];
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <Mail size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>{st.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{c.goal}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users size={11}/>{c.contactCount} contacts</span>
                      <span>Owner: {c.owner}</span>
                      {c.startedAt && <span>Started {c.startedAt}</span>}
                      <span className="flex items-center gap-1"><Mail size={11}/>{c.targetList}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 ml-6 flex-shrink-0">
                  {c.emailsSent > 0 ? (
                    <>
                      <div className="text-right"><p className="text-sm font-bold text-gray-900">{c.emailsSent.toLocaleString()}</p><p className="text-xs text-gray-400">Sent</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-gray-900">{c.openRate}%</p><p className="text-xs text-gray-400">Open</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-gray-900">{c.replyRate}%</p><p className="text-xs text-gray-400">Reply</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-gray-900">{c.meetingsBooked}</p><p className="text-xs text-gray-400">Meetings</p></div>
                    </>
                  ) : (
                    <div className="text-right"><p className="text-sm text-gray-400">{c.contactCount} contacts ready</p><p className="text-xs text-gray-400">Not started</p></div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {c.status === 'active' && <button className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors" title="Pause"><Pause size={14} /></button>}
                    {(c.status === 'paused' || c.status === 'draft' || c.status === 'scheduled') && <button className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" title="Launch"><Play size={14} /></button>}
                    <button onClick={()=>navigate('/campaigns/sequence')} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Edit Sequence"><ChevronRight size={14} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><MoreHorizontal size={14} /></button>
                  </div>
                </div>
              </div>

              {/* Progress bar for active */}
              {c.status === 'active' && c.emailsSent > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{c.emailsSent} of {c.contactCount * 5} emails in sequence</span>
                    <span>{Math.round((c.emailsSent/(c.contactCount*5))*100)}% complete</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width:`${Math.min(100, Math.round((c.emailsSent/(c.contactCount*5))*100))}%`}} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
