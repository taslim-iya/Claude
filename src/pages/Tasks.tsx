import { useState } from 'react';
import { Plus, CheckSquare, Phone, Mail, Search, Calendar, AlertCircle, Building2, User } from 'lucide-react';
import { tasks as initialTasks } from '../data/sampleData';
import type { Task } from '../types';

const typeConfig: Record<string, {icon:any, color:string, bg:string, label:string}> = {
  follow_up: { icon:CheckSquare, color:'text-indigo-600', bg:'bg-indigo-50', label:'Follow Up' },
  call: { icon:Phone, color:'text-emerald-600', bg:'bg-emerald-50', label:'Call' },
  email_review: { icon:Mail, color:'text-amber-600', bg:'bg-amber-50', label:'Email Review' },
  research: { icon:Search, color:'text-violet-600', bg:'bg-violet-50', label:'Research' },
  meeting_prep: { icon:Calendar, color:'text-blue-600', bg:'bg-blue-50', label:'Meeting Prep' },
};
const priorityStyle: Record<string, string> = {
  high:'bg-red-50 text-red-700 border border-red-200',
  medium:'bg-amber-50 text-amber-700 border border-amber-100',
  low:'bg-gray-100 text-gray-500',
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'all'|'pending'|'completed'>('all');
  const [filterType, setFilterType] = useState('all');

  const shown = tasks.filter(t => {
    const statusMatch = filter==='all' || (filter==='pending' && !t.completed) || (filter==='completed' && t.completed);
    const typeMatch = filterType==='all' || t.type===filterType;
    return statusMatch && typeMatch;
  });

  const toggle = (id: string) => setTasks(ts => ts.map(t => t.id===id ? {...t, completed:!t.completed} : t));
  const pending = tasks.filter(t=>!t.completed);
  const dueToday = pending.filter(t=>t.dueDate<='2026-03-28');
  const highPriority = pending.filter(t=>t.priority==='high');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Manage follow-ups, calls, and prospecting actions.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"><Plus size={14}/> New Task</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:'Total Tasks', value:tasks.length, color:'text-gray-900'},
          {label:'Due Soon', value:dueToday.length, color:'text-amber-600'},
          {label:'High Priority', value:highPriority.length, color:'text-red-600'},
          {label:'Completed', value:tasks.filter(t=>t.completed).length, color:'text-emerald-600'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['all','pending','completed'] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter===f?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{f}</button>
          ))}
        </div>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Types</option>
          {Object.entries(typeConfig).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {shown.map(task => {
          const tc = typeConfig[task.type];
          const Icon = tc?.icon ?? CheckSquare;
          const overdue = !task.completed && task.dueDate < '2026-03-26';
          return (
            <div key={task.id} className={`bg-white rounded-xl border transition-all ${task.completed ? 'border-gray-100 opacity-60' : overdue ? 'border-red-200' : 'border-gray-100 hover:shadow-sm'}`}>
              <div className="flex items-start gap-4 p-4">
                <button onClick={()=>toggle(task.id)} className="mt-0.5 flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                    {task.completed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </button>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tc?.bg}`}>
                  <Icon size={14} className={tc?.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                      {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle[task.priority]}`}>{task.priority}</span>
                      <span className={`text-xs font-medium ${overdue && !task.completed ? 'text-red-600 flex items-center gap-1' : 'text-gray-400'}`}>
                        {overdue && !task.completed && <AlertCircle size={11}/>} {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><User size={10}/>{task.owner}</span>
                    {task.accountName && <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={10}/>{task.accountName}</span>}
                    {task.contactName && <span className="text-xs text-indigo-500 font-medium">{task.contactName}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tc?.bg} ${tc?.color}`}>{tc?.label}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <CheckSquare size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
