import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, CheckSquare, Square, Calendar, Flag } from 'lucide-react';
import Modal from '../components/ui/Modal';
import type { TaskType, TaskPriority } from '../types';

const PRIORITY_OPTS: TaskPriority[] = ['low','medium','high'];
const TYPE_OPTS: TaskType[] = ['follow_up','call','email_review','research','meeting_prep'];

function priorityColor(p: string) {
  return p==='high'?'text-red-400':p==='medium'?'text-amber-400':'text-emerald-400';
}
function priorityBg(p: string) {
  return p==='high'?'rgba(239,68,68,0.1)':p==='medium'?'rgba(245,158,11,0.1)':'rgba(16,185,129,0.1)';
}

export default function Tasks() {
  const { tasks, taskOps, toast } = useApp();
  const [filter, setFilter] = useState<'all'|'open'|'done'>('open');
  const [priority, setPriority] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', priority:'medium' as TaskPriority, type:'follow_up' as TaskType, dueDate:'', owner:'Sarah Miller' });

  const filtered = tasks.filter(t => {
    const matchFilter = filter==='all' || (filter==='open'&&!t.completed) || (filter==='done'&&t.completed);
    const matchPriority = priority==='all' || t.priority===priority;
    return matchFilter && matchPriority;
  });

  const handleAdd = () => {
    if (!form.title) { toast('error','Task title required'); return; }
    taskOps.add({
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      priority: form.priority,
      type: form.type,
      dueDate: form.dueDate,
      owner: form.owner,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setShowAdd(false);
    setForm({ title:'', description:'', priority:'medium', type:'follow_up', dueDate:'', owner:'Sarah Miller' });
  };

  const toggleDone = (id: string, current: boolean) => {
    taskOps.update(id, { completed: !current });
  };

  const openCount = tasks.filter(t=>!t.completed).length;
  const doneCount = tasks.filter(t=>t.completed).length;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>{openCount} open · {doneCount} completed</p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background:'#5b6ef9', color:'var(--text)' }}>
          <Plus size={13}/>Add Task
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {(['all','open','done'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg capitalize"
            style={{
              background:filter===f?'rgba(91,110,249,0.2)':'var(--surface)',
              color:filter===f?'#5b6ef9':'var(--text-2)',
              border:filter===f?'1px solid rgba(91,110,249,0.3)':'1px solid var(--border)'
            }}>{f}</button>
        ))}
        <div className="w-px h-5 mx-1" style={{ background:'var(--border-2)' }} />
        <Flag size={12} style={{ color:'var(--text-3)' }} />
        {(['all','low','medium','high'] as const).map(p=>(
          <button key={p} onClick={()=>setPriority(p)}
            className="text-xs px-3 py-1.5 rounded-lg capitalize"
            style={{
              background:priority===p?'var(--border-2)':'var(--surface)',
              color:priority===p?'#fff':'var(--text-2)',
              border:'1px solid var(--border)'
            }}>{p}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckSquare size={36} className="mx-auto mb-3" style={{ color:'var(--border-2)' }} />
          <p className="text-sm" style={{ color:'var(--text-3)' }}>No tasks found</p>
          <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
            style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Add your first task</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl px-4 py-3 group"
              style={{ background:'var(--surface)', border:'1px solid var(--border)', opacity:t.completed?0.6:1 }}>
              <button onClick={()=>toggleDone(t.id, t.completed)} className="flex-shrink-0">
                {t.completed
                  ? <CheckSquare size={18} style={{ color:'#5b6ef9' }} />
                  : <Square size={18} style={{ color:'var(--text-3)' }} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-white ${t.completed?'line-through opacity-50':''}`}>{t.title}</p>
                {t.description && <p className="text-xs mt-0.5 truncate" style={{ color:'var(--text-3)' }}>{t.description}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background:priorityBg(t.priority), color:priorityColor(t.priority) }}>
                  {t.priority}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                  style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>
                  {t.type.replace('_',' ')}
                </span>
                {t.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={10} style={{ color:'var(--text-3)' }} />
                    <span className="text-[10px]" style={{ color:'var(--text-3)' }}>{t.dueDate}</span>
                  </div>
                )}
                <button onClick={()=>taskOps.del(t.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color:'var(--text-3)' }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="New Task" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Task Title *</label>
            <input placeholder="Follow up with Acme Corp" value={form.title} onChange={e=>setForm(x=>({...x,title:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Description</label>
            <textarea rows={2} placeholder="Additional notes..." value={form.description} onChange={e=>setForm(x=>({...x,description:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Priority</label>
              <select value={form.priority} onChange={e=>setForm(x=>({...x,priority:e.target.value as TaskPriority}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {PRIORITY_OPTS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Type</label>
              <select value={form.type} onChange={e=>setForm(x=>({...x,type:e.target.value as TaskType}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {TYPE_OPTS.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e=>setForm(x=>({...x,dueDate:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)', colorScheme:'dark' }} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'var(--text)' }}>Create Task</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
