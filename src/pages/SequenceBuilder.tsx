import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Mail, Clock, MessageSquare, Phone, GripVertical, Save, Zap, Sparkles, ChevronRight, Brain, TrendingUp, Target, Lightbulb, CheckCircle } from 'lucide-react';

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
const stepColors: Record<StepType, string> = { email:'#5b6ef9', wait:'var(--text-3)', linkedin:'#0077b5', call:'#10b981', task:'#f59e0b' };

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

const SUBJECT_TIPS: Record<string, string[]> = {
  good: ['Good length (4-7 words)', 'Contains personalization variable', 'Action-oriented language'],
  bad: ['Too generic — add specificity', 'Missing personalization', 'Consider adding a question'],
};

function scoreSubject(subj: string): number {
  if (!subj) return 0;
  let s = 40;
  if (subj.length > 10 && subj.length < 60) s += 15;
  if (/{{/.test(subj)) s += 20;
  if (/\?$/.test(subj.trim())) s += 10;
  if (subj.split(' ').length >= 3 && subj.split(' ').length <= 8) s += 10;
  if (!/quick|free|urgent/i.test(subj)) s += 5;
  return Math.min(s, 100);
}

function predictReplyRate(stepCount: number): number {
  return Math.min(8 + stepCount * 2, 26);
}

function getRecommendation(steps: Step[]): string {
  const types = steps.map(s => s.type);
  const emailCount = types.filter(t => t === 'email').length;
  const hasLinkedin = types.includes('linkedin');
  const hasCall = types.includes('call');
  if (emailCount >= 2 && !hasLinkedin) return 'After 2+ emails, add a LinkedIn touch to increase visibility by ~22%.';
  if (steps.length >= 4 && !hasCall) return 'Adding a call step at day 10+ increases close rates by 18%.';
  if (emailCount === 1) return 'Add a follow-up email 3 days after step 1. Most replies come from follow-ups.';
  if (steps.length >= 6) return 'Long sequence — consider A/B testing subject lines on steps 1 and 3.';
  return 'Sequence looks balanced. Add a break-up email as the final step for best results.';
}

const AI_MESSAGES: Record<string, string> = {
  email_professional: "Hi {{first_name}},\n\nI came across {{company}} and wanted to reach out about a specific challenge I thought you might relate to.\n\nProspectIQ has helped similar teams increase their outbound reply rates by 3x in under 60 days.\n\nWould you have 15 minutes this week to explore if this could work for {{company}}?\n\nBest,\nSarah",
  email_friendly: "Hey {{first_name}}! 👋\n\nSpotted {{company}} doing some exciting work and had to reach out. We help sales teams find and close deals faster using AI-powered prospecting.\n\nWould love to chat — got 15 minutes this week?\n\nCheers,\nSarah",
};

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
  const [showAdvisor, setShowAdvisor] = useState(true);
  const [subjectInput, setSubjectInput] = useState('');
  const [subjectScored, setSubjectScored] = useState<number|null>(null);
  const [showAICompose, setShowAICompose] = useState<string|null>(null); // stepId
  const [aiComposeLoading, setAiComposeLoading] = useState(false);
  const [aiComposeResult, setAiComposeResult] = useState('');

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

  const applySuggestion = () => {
    const emailCount = steps.filter(s=>s.type==='email').length;
    const hasLinkedin = steps.some(s=>s.type==='linkedin');
    const maxDay = Math.max(...steps.map(s=>s.day));
    if (emailCount >= 2 && !hasLinkedin) {
      addStep('linkedin');
    } else {
      const step: Step = { id: crypto.randomUUID(), type: 'email', day: maxDay+3,
        subject: 'Last note — {{first_name}}', body: "Hi {{first_name}},\n\nI'll take this as my last reach out. If the timing ever changes, I'd love to reconnect.\n\nBest,\nSarah" };
      setSteps(s => [...s, step]);
      setExpandedId(step.id);
    }
    toast('success', 'AI suggestion applied');
  };

  const generateAIMessage = (stepId: string) => {
    setAiComposeLoading(true);
    setAiComposeResult('');
    setTimeout(() => {
      setAiComposeResult(AI_MESSAGES.email_professional);
      setAiComposeLoading(false);
    }, 900);
  };

  const insertAIMessage = (stepId: string) => {
    updateStep(stepId, { body: aiComposeResult });
    setShowAICompose(null);
    setAiComposeResult('');
    toast('success', 'AI message inserted');
  };

  const replyRate = predictReplyRate(steps.length);
  const recommendation = getRecommendation(steps);
  const timingTip = steps.length >= 3
    ? `Best to wait ${steps.length >= 5 ? 4 : 3} days between steps ${steps.length-1} and ${steps.length}.`
    : 'Add more steps to see timing recommendations.';

  return (
    <div className="flex h-full overflow-hidden animate-fade-in">
      {/* Main editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 mr-4">
              <input value={name} onChange={e=>setName(e.target.value)}
                className="text-xl font-bold bg-transparent outline-none border-b border-transparent pb-0.5 transition-colors w-full"
                style={{ color:'var(--text)', caretColor:'#5b6ef9', borderBottomColor:'transparent' }}
                onFocus={e=>(e.currentTarget.style.borderBottomColor='var(--border-2)')}
                onBlur={e=>(e.currentTarget.style.borderBottomColor='transparent')}
              />
              <p className="text-sm mt-1" style={{ color:'var(--text-2)' }}>{steps.length} steps · {steps[steps.length-1]?.day || 0} day sequence</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setShowAdvisor(v=>!v)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: showAdvisor?'rgba(91,110,249,0.15)':'var(--surface-2)', color: showAdvisor?'#5b6ef9':'var(--text-2)', border:'1px solid var(--border)' }}>
                <Sparkles size={12}/>AI Advisor
              </button>
              <button onClick={()=>{ toast('success', `Sequence "${name}" saved`); }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background:'#5b6ef9', color:'#fff' }}>
                <Save size={13}/>Save
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 mb-6">
            {steps.map((step) => {
              const Icon = stepIcons[step.type];
              const color = stepColors[step.type];
              const isExpanded = expandedId===step.id;
              const isComposing = showAICompose===step.id;
              return (
                <div key={step.id}
                  draggable
                  onDragStart={()=>setDragId(step.id)}
                  onDragOver={e=>{e.preventDefault();setDragOverId(step.id);}}
                  onDrop={()=>handleDrop(step.id)}
                  onDragEnd={()=>{setDragId(null);setDragOverId(null);}}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{
                    border: dragOverId===step.id?`1px solid ${color}`:'1px solid var(--border)',
                    background:'var(--surface)',
                    opacity: dragId===step.id?0.5:1
                  }}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    onClick={()=>setExpandedId(isExpanded?null:step.id)}>
                    <GripVertical size={14} style={{ color:'var(--text-3)', cursor:'grab', flexShrink:0 }} />
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:`${color}18` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold capitalize" style={{ color:'var(--text)' }}>{step.type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>
                          Day {step.day}
                        </span>
                      </div>
                      {step.subject && (
                        <p className="text-xs mt-0.5 truncate" style={{ color:'var(--text-2)' }}>
                          <VariableHighlight text={step.subject} />
                        </p>
                      )}
                      {step.note && <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{step.note}</p>}
                    </div>
                    <button onClick={e=>{e.stopPropagation();deleteStep(step.id);}}
                      className="w-6 h-6 flex items-center justify-center rounded flex-shrink-0"
                      style={{ color:'var(--text-3)' }}>
                      <Trash2 size={11}/>
                    </button>
                  </div>

                  {isExpanded && step.type==='email' && (
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop:'1px solid var(--border)' }}>
                      <div className="pt-3">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                          style={{ color:'var(--text-3)' }}>Subject</label>
                        <input value={step.subject||''} onChange={e=>updateStep(step.id,{subject:e.target.value})}
                          placeholder="Subject line with {{variables}}"
                          className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                          style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color:'var(--text-3)' }}>Body</label>
                          <button onClick={e=>{e.stopPropagation();setShowAICompose(isComposing?null:step.id);setAiComposeResult('');}}
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg"
                            style={{ background: isComposing?'rgba(91,110,249,0.2)':'var(--surface-2)', color: isComposing?'#5b6ef9':'var(--text-2)', border:'1px solid var(--border)' }}>
                            <Sparkles size={9}/>AI Generate
                          </button>
                        </div>
                        {isComposing && (
                          <div className="mb-2 p-3 rounded-xl space-y-2"
                            style={{ background:'rgba(91,110,249,0.06)', border:'1px solid rgba(91,110,249,0.2)' }}>
                            <p className="text-[11px] font-semibold" style={{ color:'#5b6ef9' }}>AI Message Generator</p>
                            <button onClick={()=>generateAIMessage(step.id)} disabled={aiComposeLoading}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg w-full justify-center"
                              style={{ background:'#5b6ef9', color:'#fff', opacity:aiComposeLoading?0.7:1 }}>
                              {aiComposeLoading
                                ? <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating...</>
                                : <><Sparkles size={11}/>Generate Professional Email</>}
                            </button>
                            {aiComposeResult && (
                              <>
                                <textarea rows={4} value={aiComposeResult} onChange={e=>setAiComposeResult(e.target.value)}
                                  className="w-full px-3 py-2 text-xs rounded-lg outline-none resize-none"
                                  style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
                                <button onClick={()=>insertAIMessage(step.id)}
                                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                  style={{ background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.2)' }}>
                                  <CheckCircle size={11}/>Insert into Body
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        <textarea rows={5} value={step.body||''} onChange={e=>updateStep(step.id,{body:e.target.value})}
                          placeholder="Email body with {{first_name}}, {{company}}, {{title}}..."
                          className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
                          style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
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
                          style={{ color:'var(--text-3)' }}>Send on Day</label>
                        <input type="number" min={1} value={step.day} onChange={e=>updateStep(step.id,{day:Number(e.target.value)})}
                          className="w-24 px-3 py-2 text-sm rounded-lg outline-none"
                          style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
                      </div>
                    </div>
                  )}

                  {isExpanded && step.type!=='email' && (
                    <div className="px-4 pb-4 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color:'var(--text-3)' }}>Note</label>
                      <input value={step.note||''} onChange={e=>updateStep(step.id,{note:e.target.value})}
                        placeholder="Instructions for this step..."
                        className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                        style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
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
                  style={{ background:'var(--surface)', color:'var(--text-2)', border:'1px solid var(--border)' }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=color; (e.currentTarget as HTMLElement).style.color=color; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text-2)'; }}>
                  <Plus size={11}/>
                  <Icon size={11} style={{ color }} />
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Advisor Panel */}
      {showAdvisor && (
        <div className="w-72 flex-shrink-0 overflow-y-auto p-4 space-y-4"
          style={{ borderLeft:'1px solid var(--border)', background:'var(--surface)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color:'#5b6ef9' }} />
            <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>AI Sequence Advisor</h3>
          </div>

          {/* Reply prediction */}
          <div className="rounded-xl p-3" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={12} style={{ color:'#10b981' }} />
              <p className="text-[11px] font-semibold" style={{ color:'var(--text)' }}>Predicted Performance</p>
            </div>
            <p className="text-2xl font-bold" style={{ color:'#5b6ef9' }}>{replyRate}%</p>
            <p className="text-[11px]" style={{ color:'var(--text-2)' }}>estimated reply rate</p>
            <p className="text-[10px] mt-1" style={{ color:'var(--text-3)' }}>Based on {steps.length}-step sequence benchmarks</p>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl p-3" style={{ background:'rgba(91,110,249,0.06)', border:'1px solid rgba(91,110,249,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={12} style={{ color:'#5b6ef9' }} />
              <p className="text-[11px] font-semibold" style={{ color:'#5b6ef9' }}>Next Step Suggestion</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color:'var(--text-2)' }}>{recommendation}</p>
            <button onClick={applySuggestion}
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg w-full justify-center"
              style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9', border:'1px solid rgba(91,110,249,0.2)' }}>
              <Plus size={10}/>Apply Suggestion
            </button>
          </div>

          {/* Timing */}
          <div className="rounded-xl p-3" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain size={12} style={{ color:'#f59e0b' }} />
              <p className="text-[11px] font-semibold" style={{ color:'var(--text)' }}>Optimal Timing</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color:'var(--text-2)' }}>{timingTip}</p>
            <div className="mt-2 space-y-1">
              {steps.slice(0, 4).map((s, i) => i > 0 && (
                <div key={s.id} className="flex items-center justify-between text-[10px]"
                  style={{ color:'var(--text-3)' }}>
                  <span>Step {i} → {i+1}</span>
                  <span className="font-medium" style={{ color:'var(--text-2)' }}>
                    {s.day - steps[i-1].day}d gap
                    {s.day - steps[i-1].day < 2 ? ' ⚠️' : ' ✓'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject scorer */}
          <div className="rounded-xl p-3" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Target size={12} style={{ color:'#8b5cf6' }} />
              <p className="text-[11px] font-semibold" style={{ color:'var(--text)' }}>Subject Line Scorer</p>
            </div>
            <input value={subjectInput} onChange={e=>{setSubjectInput(e.target.value);setSubjectScored(null);}}
              placeholder="Paste a subject line..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none mb-2"
              style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)' }} />
            <button onClick={()=>setSubjectScored(scoreSubject(subjectInput))}
              className="text-[11px] font-medium px-3 py-1.5 rounded-lg w-full"
              style={{ background:'rgba(139,92,246,0.15)', color:'#8b5cf6', border:'1px solid rgba(139,92,246,0.2)' }}>
              Score Subject
            </button>
            {subjectScored !== null && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold" style={{ color: subjectScored>=70?'#10b981':subjectScored>=50?'#f59e0b':'#ef4444' }}>
                    Score: {subjectScored}/100
                  </span>
                  <span className="text-[10px]" style={{ color:'var(--text-3)' }}>
                    {subjectScored>=70?'Good':'Needs Work'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'var(--border-2)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width:`${subjectScored}%`, background:subjectScored>=70?'#10b981':subjectScored>=50?'#f59e0b':'#ef4444' }} />
                </div>
                <ul className="mt-2 space-y-0.5">
                  {(subjectScored >= 70 ? SUBJECT_TIPS.good : SUBJECT_TIPS.bad).map((tip,i) => (
                    <li key={i} className="text-[10px] flex items-start gap-1" style={{ color:'var(--text-3)' }}>
                      <ChevronRight size={8} className="mt-0.5 flex-shrink-0"/>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
