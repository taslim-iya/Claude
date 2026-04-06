import { useState } from 'react';
import { Zap, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const steps = [
  { title: 'Company Setup', sub: 'Tell us about your company' },
  { title: 'What You Sell', sub: 'Describe your product or service' },
  { title: 'Ideal Customer', sub: 'Define your ICP' },
  { title: 'Outreach Goals', sub: 'Set your prospecting objectives' },
  { title: 'All Set!', sub: 'Your workspace is ready' },
];

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
      {label}
    </button>
  );
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    company: 'Acme Sales Co', size: '11-50', industry: 'SaaS',
    whatYouSell: 'B2B sales automation software that helps teams prospect faster and book more meetings.',
    targetType: 'B2B Companies',
    industries: ['SaaS', 'Fintech', 'E-commerce'],
    regions: ['North America', 'Europe'],
    personas: ['VP of Sales', 'Head of Growth', 'CRO'],
    goal: '20 meetings', startMethod: 'sample',
  });
  const toggle = (key: 'industries' | 'regions' | 'personas', val: string) => {
    setData(d => ({ ...d, [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val] }));
  };

  const steps_content = [
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Company Name</label>
        <input value={data.company} onChange={e => setData(d => ({...d, company: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Team Size</label>
        <div className="grid grid-cols-3 gap-2">
          {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => (
            <button key={s} onClick={() => setData(d => ({...d, size: s}))} className={`py-2 text-sm rounded-lg border transition-colors ${data.size===s ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Industry</label>
        <select value={data.industry} onChange={e => setData(d => ({...d, industry: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {['SaaS','Fintech','E-commerce','Healthcare Tech','Marketing Tech','HR Tech','Sales Tech','Agency','Other'].map(i => <option key={i}>{i}</option>)}
        </select>
      </div>
    </div>,

    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">What do you sell?</label>
        <textarea value={data.whatYouSell} onChange={e => setData(d => ({...d, whatYouSell: e.target.value}))} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <p className="text-xs text-gray-400 mt-1">Used to personalise your AI outreach.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Target Customer Type</label>
        <div className="grid grid-cols-2 gap-2">
          {['B2B Companies','Enterprise','Mid-Market SMBs','Startups','Agencies','B2C Brands'].map(t => (
            <button key={t} onClick={() => setData(d => ({...d, targetType: t}))} className={`py-2.5 px-4 rounded-lg text-sm border text-left transition-colors ${data.targetType===t ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{t}</button>
          ))}
        </div>
      </div>
    </div>,

    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Target Industries</label>
        <div className="flex flex-wrap gap-2">
          {['SaaS','Fintech','E-commerce','Healthcare','MarTech','EdTech','HR Tech','Logistics','Real Estate'].map(i => <Chip key={i} label={i} selected={data.industries.includes(i)} onClick={() => toggle('industries', i)} />)}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Target Regions</label>
        <div className="flex flex-wrap gap-2">
          {['North America','Europe','APAC','Latin America','Middle East','Global'].map(r => <Chip key={r} label={r} selected={data.regions.includes(r)} onClick={() => toggle('regions', r)} />)}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Target Personas</label>
        <div className="flex flex-wrap gap-2">
          {['VP of Sales','Head of Growth','CRO','CMO','CEO','Founder','Director Sales Ops','SDR Manager','RevOps Lead'].map(p => <Chip key={p} label={p} selected={data.personas.includes(p)} onClick={() => toggle('personas', p)} />)}
        </div>
      </div>
    </div>,

    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Monthly Meeting Goal</label>
        <div className="grid grid-cols-3 gap-2">
          {['5 meetings','10 meetings','20 meetings','30 meetings','50+ meetings','Custom'].map(g => (
            <button key={g} onClick={() => setData(d => ({...d, goal: g}))} className={`py-2.5 text-sm rounded-lg border transition-colors ${data.goal===g ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{g}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">How would you like to start?</label>
        <div className="space-y-2">
          {[{v:'import',l:'Import my leads (CSV)',d:'Upload a spreadsheet'},{v:'search',l:'Search for new leads',d:'Filter by ICP criteria'},{v:'sample',l:'Start with sample data',d:'Explore with demo data first'}].map(o => (
            <button key={o.v} onClick={() => setData(d => ({...d, startMethod: o.v}))} className={`w-full text-left p-3 rounded-lg border transition-colors ${data.startMethod===o.v ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <p className={`text-sm font-medium ${data.startMethod===o.v ? 'text-indigo-700' : 'text-gray-800'}`}>{o.l}</p>
              <p className="text-xs text-gray-500 mt-0.5">{o.d}</p>
            </button>
          ))}
        </div>
      </div>
    </div>,

    <div className="text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Your workspace is ready!</h3>
      <p className="text-gray-500 text-sm mb-6">ProspectIQ has been configured based on your ICP settings.</p>
      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
        {[{l:'Company', v:data.company},{l:'Target',v:data.targetType},{l:'Industries',v:data.industries.slice(0,3).join(', ')},{l:'Regions',v:data.regions.join(', ')},{l:'Goal',v:data.goal+'/month'}].map(item => (
          <div key={item.l} className="flex justify-between text-sm">
            <span className="text-gray-500">{item.l}</span>
            <span className="font-medium text-gray-900">{item.v}</span>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center"><Zap size={13} className="text-white" /></div>
            <span className="text-white font-semibold text-sm">ProspectIQ</span>
          </div>
          <div className="flex gap-1.5 mb-4">
            {steps.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-white' : 'bg-white/25'}`} />)}
          </div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Step {step+1} of {steps.length}</p>
          <h2 className="text-white text-xl font-bold">{steps[step].title}</h2>
          <p className="text-white/70 text-sm">{steps[step].sub}</p>
        </div>
        <div className="p-6">{steps_content[step]}</div>
        <div className="px-6 pb-6 flex justify-between items-center">
          <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step===0} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={step === steps.length-1 ? onComplete : () => setStep(s => s+1)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
            {step === steps.length-1 ? 'Launch ProspectIQ' : 'Continue'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
