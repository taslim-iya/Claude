import { useState } from 'react';
import { Plus, Mail, Clock, CheckSquare, Trash2, Save, Play, Sparkles, ChevronDown } from 'lucide-react';
import { sequenceSteps } from '../data/sampleData';
import type { SequenceStep } from '../types';

const tones = ['Professional', 'Casual', 'Direct', 'Friendly', 'Concise'];
const tokens = ['{{first_name}}', '{{last_name}}', '{{company_name}}', '{{title}}', '{{your_name}}', '{{industry}}', '{{pain_point}}'];

export default function SequenceBuilder() {
  const [steps, setSteps] = useState<SequenceStep[]>(sequenceSteps);
  const [activeStep, setActiveStep] = useState<string | null>(steps[0]?.id ?? null);
  const [campaignName, setCampaignName] = useState('Q2 SaaS Outreach Sequence');
  const [showAI, setShowAI] = useState(false);
  const [aiTone, setAiTone] = useState('Professional');
  const [aiGenerating, setAiGenerating] = useState(false);

  const addStep = (type: 'email' | 'wait' | 'task') => {
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`, stepNumber: steps.length + 1, type, delayDays: type === 'wait' ? 3 : 0,
      subject: type === 'email' ? 'Follow up — {{first_name}}' : undefined,
      body: type === 'email' ? 'Hi {{first_name}},\n\n' : undefined,
    };
    setSteps(s => [...s, newStep]);
    setActiveStep(newStep.id);
  };

  const removeStep = (id: string) => {
    setSteps(s => s.filter(x => x.id !== id));
    if (activeStep === id) setActiveStep(null);
  };

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    setSteps(s => s.map(x => x.id === id ? {...x, ...updates} : x));
  };

  const simulateAI = () => {
    setAiGenerating(true);
    setTimeout(() => setAiGenerating(false), 1500);
  };

  const active = steps.find(s => s.id === activeStep);
  const emailSteps = steps.filter(s => s.type === 'email').length;

  return (
    <div className="flex h-full">
      {/* Left: Sequence Steps */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <input value={campaignName} onChange={e=>setCampaignName(e.target.value)} className="w-full text-sm font-semibold text-gray-900 border-0 focus:outline-none focus:ring-0 p-0 bg-transparent" />
          <p className="text-xs text-gray-400 mt-0.5">{emailSteps} emails · {steps.filter(s=>s.type==='wait').reduce((a,s)=>a+s.delayDays,0)} days total</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {steps.map((step, i) => (
            <div key={step.id} className="relative">
              {/* Connector */}
              {i < steps.length - 1 && <div className="absolute left-5 top-full h-2 w-0.5 bg-gray-200 z-10" />}
              <div
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${activeStep === step.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${step.type==='email' ? 'bg-indigo-100' : step.type==='wait' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  {step.type === 'email' ? <Mail size={14} className="text-indigo-600" /> : step.type === 'wait' ? <Clock size={14} className="text-amber-600" /> : <CheckSquare size={14} className="text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  {step.type === 'email' ? (
                    <>
                      <p className="text-xs font-semibold text-gray-700">Email #{steps.filter((s,j)=>j<=i&&s.type==='email').length}</p>
                      <p className="text-xs text-gray-400 truncate">{step.subject ?? 'No subject'}</p>
                    </>
                  ) : step.type === 'wait' ? (
                    <>
                      <p className="text-xs font-semibold text-gray-700">Wait {step.delayDays} day{step.delayDays!==1?'s':''}</p>
                      <p className="text-xs text-gray-400">Delay before next step</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-gray-700">Task</p>
                      <p className="text-xs text-gray-400 truncate">{step.taskDescription ?? 'Manual task'}</p>
                    </>
                  )}
                </div>
                <button onClick={e=>{e.stopPropagation();removeStep(step.id);}} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Add step */}
        <div className="p-3 border-t border-gray-100 space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">Add Step</p>
          {[{type:'email' as const, label:'Email', icon:Mail, color:'text-indigo-600 bg-indigo-50'},
            {type:'wait' as const, label:'Wait / Delay', icon:Clock, color:'text-amber-600 bg-amber-50'},
            {type:'task' as const, label:'Manual Task', icon:CheckSquare, color:'text-emerald-600 bg-emerald-50'}].map(({type,label,icon:Icon,color}) => (
            <button key={type} onClick={()=>addStep(type)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors border border-dashed border-gray-200 hover:border-gray-300">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${color}`}><Icon size={12} /></div>
              <span className="text-xs font-medium">{label}</span>
              <Plus size={11} className="ml-auto text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Right: Step editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Sequence Settings</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">Pause on reply: ON</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Send window: 9am–5pm</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Unsubscribe: ON</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowAI(!showAI)} className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${showAI?'bg-violet-50 border-violet-300 text-violet-700':'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <Sparkles size={14} /> AI Writer
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"><Save size={14} /> Save</button>
            <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg"><Play size={14} /> Launch</button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {active ? (
              active.type === 'email' ? (
                <div className="max-w-2xl space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject Line</label>
                    <input value={active.subject ?? ''} onChange={e=>updateStep(active.id, {subject:e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Subject line…" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Body</label>
                      <div className="flex gap-1">
                        {tokens.map(t => <button key={t} onClick={()=>updateStep(active.id,{body:(active.body??'')+t})} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors font-mono">{t}</button>)}
                      </div>
                    </div>
                    <textarea value={active.body ?? ''} onChange={e=>updateStep(active.id, {body:e.target.value})} rows={14}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Send Delay (days after previous step)</label>
                      <input type="number" value={active.delayDays} onChange={e=>updateStep(active.id,{delayDays:parseInt(e.target.value)||0})} min={0} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-24" />
                    </div>
                  </div>
                </div>
              ) : active.type === 'wait' ? (
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Wait Step</h3>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Number of days to wait</label>
                  <input type="number" value={active.delayDays} onChange={e=>updateStep(active.id,{delayDays:parseInt(e.target.value)||1})} min={1} max={30}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32" />
                  <p className="text-xs text-gray-400 mt-2">The sequence will pause for {active.delayDays} day{active.delayDays!==1?'s':''} before the next step.</p>
                </div>
              ) : (
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Task</h3>
                  <textarea value={active.taskDescription ?? ''} onChange={e=>updateStep(active.id,{taskDescription:e.target.value})} rows={4} placeholder="Describe the task for the rep…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              )
            ) : (
              <div className="text-center py-20 text-gray-400">
                <Mail size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a step to edit</p>
              </div>
            )}
          </div>

          {/* AI Panel */}
          {showAI && (
            <div className="w-72 border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
              <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">AI Email Writer</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Tone</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tones.map(t => <button key={t} onClick={()=>setAiTone(t)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${aiTone===t?'bg-violet-600 text-white border-violet-600':'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{t}</button>)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Context</label>
                  <textarea rows={3} placeholder="What problem do you solve? What's the value prop?" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none bg-white" defaultValue="We help B2B sales teams book more meetings through automated outreach and AI personalization." />
                </div>
                <div className="space-y-2">
                  {['Generate first line', 'Write full email', 'Rewrite shorter', 'Make more personal', 'Generate subject line', 'Write follow-up'].map(action => (
                    <button key={action} onClick={simulateAI} className="w-full text-left text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 px-3 py-2 rounded-lg transition-colors flex items-center justify-between">
                      {action}
                      {aiGenerating ? <span className="text-violet-500 text-xs">✨ Writing…</span> : <Sparkles size={11} className="text-gray-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
