import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Mail, Clock, MessageSquare, Phone, GripVertical, Save, Zap } from 'lucide-react';

type StepType = 'email'|'wait'|'linkedin'|'call'|'task';

interface Step {
  id: string;
  type: StepType;
  day: number;
  subject?: string;
  body?: string;
  note?: string;
}

const stepIcons: Record<StepType, any> = { email:Mail, wait:Clock, linkedin:MessageSquare, call:Phone, task:Zap };
const stepColors: Record<StepType, string> = { email:'#5b6ef9', wait:'rgba(255,255,255,0.3)', linkedin:'#0077b5', call:'#10b981', task:'#f59e0b' };

function VariableHighlight({ text }: { text: string }) {
  const parts = text.split(/({{[^}]+}})/g);
  return (
    <span>
      {parts.map((p, i) => /^{{.+}}$/.test(p)
        ? <span key={i} className="px-1 rounded text-xs font-mono" style={{ background:'rgba(91,110,249,0.2)', color:'#5b6ef9' }}>{p}</span>
        : <span key={i}>{p}</span>
      )}
    </span>
  );
}

export default function SequenceBuilder() {
  const { toast } = useApp();
  const [name, setName] = useState('New Sequence');
  const [steps, setSteps] = useState<Step[]>([
    { id:'s1', type:'email', day:1, subject:'Quick question about {{company}}', body:'Hi {{first_name}},\n\nI noticed that {{company}} is...' },
    { id:'s2', type:'wait', day:3, note:'Wait 2 days' },
    { id:'s3', type:'email', day:5, subject:'Following up', body:'Hi {{first_name}},\n\nJust wanted to follow up...' },
    { id:'s4', type:'linkedin', day:7, note:'Connect on LinkedIn' },
  ]);
  const [expandedId, setExpandedId] = useState<string|null>('s1');
  const [dragId, setDragId] = useState<string|null>(null);
  const [dragOverId, setDragOverId] = useState<string|null>(null);

  const addStep = (type: StepType) => {
    const maxDay = steps.length ? Math.max(...steps.map(s=>s.day)) : 0;
    const step: Step = { id: crypto.randomUUID(), type, day: maxDay+2 };
    if (type==='email') { step.subject=''; step.body=''; }
    else { step.note=''; }
    setSteps(s => [...s, step]);
    setExpandedId(step.id);
  };

  const updateStep = (id: string, patch: Partial<Step>) => {
    setSteps(s => s.map(x => x.id===id ? {...x,...patch} : x));
  };

  const deleteStep = (id: string) => {
    setSteps(s => s.filter(x => x.id!==id));
    if (expandedId===id) setExpandedId(null);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId===targetId) return;
    const arr = [...steps];
    const fromIdx = arr.findIndex(s=>s.id===dragId);
    const toIdx = arr.findIndex(s=>s.id===targetId);
    const [removed] = arr.splice(fromIdx,1);
    arr.splice(toIdx,0,removed);
    setSteps(arr.map((s,i) => ({...s, day: i*2+1})));
    setDragId(null);
    setDragOverId(null);
  };

  const handleSave = () => {
    toast('success', `Sequence "${name}" saved`);
  };

  return (
    <div className="p-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 mr-4">
          <input value={name} onChange={e=>setName(e.target.value)}
            className="text-xl font-bold bg-transparent outline-none text-white border-b border-transparent focus:border-white/20 pb-0.5 transition-colors w-full"
            style={{ caretColor:'#5b6ef9' }} />
          <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.4)' }}>{steps.length} steps · {steps[steps.length-1]?.day || 0} day sequence</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background:'#5b6ef9', color:'#fff' }}>
          <Save size={13}/>Save
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-6">
        {steps.map((step, idx) => {
          const Icon = stepIcons[step.type];
          const color = stepColors[step.type];
          const isExpanded = expandedId===step.id;
          return (
            <div key={step.id}
              draggable
              onDragStart={()=>setDragId(step.id)}
              onDragOver={e=>{e.preventDefault();setDragOverId(step.id);}}
              onDrop={()=>handleDrop(step.id)}
              onDragEnd={()=>{setDragId(null);setDragOverId(null);}}
              className="rounded-xl overflow-hidden transition-all"
              style={{
                border: dragOverId===step.id?`1px solid ${color}`:'1px solid rgba(255,255,255,0.07)',
                background:'rgba(255,255,255,0.03)',
                opacity: dragId===step.id?0.5:1
              }}>
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={()=>setExpandedId(isExpanded?null:step.id)}>
                <GripVertical size={14} style={{ color:'rgba(255,255,255,0.2)', cursor:'grab', flexShrink:0 }} />
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background:`${color}18` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white capitalize">{step.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }}>
                      Day {step.day}
                    </span>
                  </div>
                  {step.subject && (
                    <p className="text-xs mt-0.5 truncate" style={{ color:'rgba(255,255,255,0.45)' }}>
                      <VariableHighlight text={step.subject} />
                    </p>
                  )}
                  {step.note && <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{step.note}</p>}
                </div>
                <button onClick={e=>{e.stopPropagation();deleteStep(step.id);}}
                  className="w-6 h-6 flex items-center justify-center rounded flex-shrink-0"
                  style={{ color:'rgba(255,255,255,0.25)' }}>
                  <Trash2 size={11}/>
                </button>
              </div>

              {isExpanded && step.type==='email' && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  <div className="pt-3">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color:'rgba(255,255,255,0.35)' }}>Subject</label>
                    <input value={step.subject||''} onChange={e=>updateStep(step.id,{subject:e.target.value})}
                      placeholder="Subject line with {{variables}}"
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color:'rgba(255,255,255,0.35)' }}>Body</label>
                    <textarea rows={5} value={step.body||''} onChange={e=>updateStep(step.id,{body:e.target.value})}
                      placeholder="Email body with {{first_name}}, {{company}}, {{title}}..."
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }} />
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {['{{first_name}}','{{company}}','{{title}}','{{industry}}'].map(v=>(
                        <button key={v} onClick={()=>updateStep(step.id,{body:(step.body||'')+v})}
                          className="text-[10px] px-2 py-0.5 rounded font-mono"
                          style={{ background:'rgba(91,110,249,0.12)', color:'#5b6ef9' }}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color:'rgba(255,255,255,0.35)' }}>Send on Day</label>
                    <input type="number" min={1} value={step.day} onChange={e=>updateStep(step.id,{day:Number(e.target.value)})}
                      className="w-24 px-3 py-2 text-sm rounded-lg outline-none"
                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }} />
                  </div>
                </div>
              )}

              {isExpanded && step.type!=='email' && (
                <div className="px-4 pb-4 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color:'rgba(255,255,255,0.35)' }}>Note</label>
                  <input value={step.note||''} onChange={e=>updateStep(step.id,{note:e.target.value})}
                    placeholder="Instructions for this step..."
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add step */}
      <div className="flex flex-wrap gap-2">
        {(['email','wait','linkedin','call','task'] as StepType[]).map(type=>{
          const Icon = stepIcons[type];
          const color = stepColors[type];
          return (
            <button key={type} onClick={()=>addStep(type)}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors capitalize"
              style={{ background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=color; (e.currentTarget as HTMLElement).style.color='#fff'; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.6)'; }}>
              <Plus size={11}/>
              <Icon size={11} style={{ color }} />
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
