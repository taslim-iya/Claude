import { useState } from 'react';
import { Plus, DollarSign, MoreHorizontal, TrendingUp, Target, Users } from 'lucide-react';
import { opportunities } from '../data/sampleData';
import type { PipelineStage, Opportunity } from '../types';

const stages: { id: PipelineStage; label: string; color: string; bg: string }[] = [
  { id:'new', label:'New', color:'bg-gray-400', bg:'bg-gray-50' },
  { id:'contacted', label:'Contacted', color:'bg-blue-400', bg:'bg-blue-50' },
  { id:'replied', label:'Replied', color:'bg-indigo-400', bg:'bg-indigo-50' },
  { id:'interested', label:'Interested', color:'bg-violet-400', bg:'bg-violet-50' },
  { id:'meeting_booked', label:'Meeting Booked', color:'bg-purple-400', bg:'bg-purple-50' },
  { id:'proposal_sent', label:'Proposal Sent', color:'bg-amber-400', bg:'bg-amber-50' },
  { id:'opportunity', label:'Opportunity', color:'bg-orange-400', bg:'bg-orange-50' },
  { id:'won', label:'Won', color:'bg-emerald-400', bg:'bg-emerald-50' },
  { id:'lost', label:'Lost', color:'bg-red-300', bg:'bg-red-50' },
];

function formatVal(v: number) {
  if (v >= 1000) return '$' + (v/1000).toFixed(0) + 'K';
  return '$' + v;
}

export default function Pipeline() {
  const [view, setView] = useState<'kanban'|'table'>('kanban');
  const [opps, setOpps] = useState(opportunities);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<PipelineStage | null>(null);

  const activeOpps = opps.filter(o => o.stage !== 'won' && o.stage !== 'lost');
  const totalPipeline = activeOpps.reduce((a, o) => a + o.value, 0);
  const weightedPipeline = activeOpps.reduce((a, o) => a + o.value * (o.probability/100), 0);
  const won = opps.filter(o=>o.stage==='won').reduce((a,o)=>a+o.value,0);

  const moveOpp = (id: string, stage: PipelineStage) => {
    setOpps(os => os.map(o => o.id === id ? {...o, stage} : o));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
            <p className="text-sm text-gray-500">Track and manage your sales opportunities.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={()=>setView('kanban')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view==='kanban'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>Kanban</button>
              <button onClick={()=>setView('table')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view==='table'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>Table</button>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg"><Plus size={14}/> Add Deal</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {label:'Total Pipeline', value: formatVal(totalPipeline), icon:Target, color:'text-indigo-600 bg-indigo-50'},
            {label:'Weighted Pipeline', value: formatVal(Math.round(weightedPipeline)), icon:TrendingUp, color:'text-violet-600 bg-violet-50'},
            {label:'Won (All Time)', value: formatVal(won), icon:DollarSign, color:'text-emerald-600 bg-emerald-50'},
            {label:'Open Deals', value: activeOpps.length, icon:Users, color:'text-amber-600 bg-amber-50'},
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}><Icon size={16}/></div>
                <div><p className="text-base font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </div>
            );
          })}
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-4 h-full min-w-max">
            {stages.map(stage => {
              const stageOpps = opps.filter(o => o.stage === stage.id);
              const stageVal = stageOpps.reduce((a,o)=>a+o.value,0);
              return (
                <div
                  key={stage.id}
                  className={`w-60 flex flex-col rounded-xl border-2 transition-colors ${dragOver===stage.id ? 'border-indigo-300 bg-indigo-50/30' : 'border-transparent bg-gray-100/60'}`}
                  onDragOver={e=>{e.preventDefault();setDragOver(stage.id);}}
                  onDragLeave={()=>setDragOver(null)}
                  onDrop={e=>{e.preventDefault();if(dragging){moveOpp(dragging,stage.id);setDragging(null);setDragOver(null);}}}
                >
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.color}`}></span>
                      <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                      <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{stageOpps.length}</span>
                    </div>
                    {stageVal > 0 && <span className="text-xs font-semibold text-gray-500">{formatVal(stageVal)}</span>}
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                    {stageOpps.map(opp => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={()=>setDragging(opp.id)}
                        onDragEnd={()=>{setDragging(null);setDragOver(null);}}
                        className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-900 leading-tight flex-1 pr-1">{opp.name}</p>
                          <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-100 text-gray-400 transition-all"><MoreHorizontal size={12}/></button>
                        </div>
                        <p className="text-xs text-gray-400 mb-2.5">{opp.contactName} · {opp.accountName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">{formatVal(opp.value)}</span>
                          <span className="text-xs text-gray-400">{opp.probability}%</span>
                        </div>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{width:`${opp.probability}%`}}/>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">Close: {opp.closeDate}</span>
                          <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{opp.owner[0]}</div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 hover:border-indigo-200">
                      <Plus size={12}/>Add deal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deal</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Probability</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Close Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {opps.map(opp => {
                const st = stages.find(s=>s.id===opp.stage);
                return (
                  <tr key={opp.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="py-3 px-6"><p className="font-medium text-gray-900">{opp.name}</p><p className="text-xs text-gray-400">{opp.contactName}</p></td>
                    <td className="py-3 px-4 text-gray-700">{opp.accountName}</td>
                    <td className="py-3 px-4"><span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-xs font-medium ${st?.bg} text-gray-700`}><span className={`w-1.5 h-1.5 rounded-full ${st?.color}`}></span>{st?.label}</span></td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatVal(opp.value)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{width:`${opp.probability}%`}}/></div>
                        <span className="text-xs text-gray-500">{opp.probability}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{opp.closeDate}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{opp.owner.split(' ')[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
