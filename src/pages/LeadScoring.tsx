import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Target, Zap, TrendingUp } from 'lucide-react';

interface Rule {
  id: string; condition: string; field: string; operator: string; value: string; points: number;
}

const DEFAULT_RULES: Rule[] = [
  { id:'r1', condition:'If', field:'Title',       operator:'contains',      value:'VP / Director / C-Level', points:20 },
  { id:'r2', condition:'If', field:'Employee Count',operator:'greater than', value:'500',                   points:15 },
  { id:'r3', condition:'If', field:'Email Opens',  operator:'greater than', value:'3',                     points:10 },
  { id:'r4', condition:'If', field:'Replied',      operator:'is',           value:'true',                  points:30 },
  { id:'r5', condition:'If', field:'Pricing page', operator:'visited',      value:'',                      points:25 },
  { id:'r6', condition:'If', field:'Industry',     operator:'is',           value:'SaaS / FinTech',        points:10 },
  { id:'r7', condition:'If', field:'Bounced',      operator:'is',           value:'true',                  points:-20 },
];

const FIELD_OPTS = ['Title','Email Opens','Replied','Company Size','Industry','Pricing page','Last Activity','Source','Phone Available','LinkedIn Available'];
const OP_OPTS    = ['contains','is','greater than','less than','visited','is not'];

export default function LeadScoring() {
  const { toast } = useApp();
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [hotThreshold,  setHotThreshold]  = useState(80);
  const [warmThreshold, setWarmThreshold] = useState(50);

  const addRule = () => {
    setRules(r => [...r, { id: crypto.randomUUID(), condition:'If', field:'Title', operator:'contains', value:'', points:10 }]);
  };
  const delRule = (id: string) => setRules(r => r.filter(x => x.id !== id));
  const updateRule = (id: string, key: keyof Rule, val: string | number) => {
    setRules(r => r.map(x => x.id === id ? { ...x, [key]: val } : x));
  };

  const preview = [
    { name:'Jordan Lee',    company:'Stripe',  score:87, tier:'hot'  },
    { name:'Sarah Chen',    company:'Notion',  score:62, tier:'warm' },
    { name:'Marcus Davis',  company:'Figma',   score:34, tier:'cold' },
    { name:'Priya Patel',   company:'Linear',  score:91, tier:'hot'  },
    { name:'Alex Thompson', company:'Vercel',  score:48, tier:'warm' },
  ];

  return (
    <div className="p-6 max-w-4xl animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Lead Scoring Engine</h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Define rules to automatically score and prioritize leads</p>
      </div>

      {/* Score thresholds */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color:'var(--text)' }}>
          <Target size={14} style={{ color:'#5b6ef9' }}/>Score Thresholds
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Hot Lead', emoji:'🔥', color:'#ef4444', val:hotThreshold, min:warmThreshold+1, max:100, set:setHotThreshold },
            { label:'Warm Lead', emoji:'☀️', color:'#f59e0b', val:warmThreshold, min:1, max:hotThreshold-1, set:setWarmThreshold },
            { label:'Cold Lead', emoji:'❄️', color:'#5b6ef9', val:warmThreshold-1, min:0, max:warmThreshold-1, set:()=>{} },
          ].map(t => (
            <div key={t.label} className="p-4 rounded-xl" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{t.emoji}</span>
                <span className="text-sm font-semibold" style={{ color:'var(--text)' }}>{t.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color:'var(--text-3)' }}>≥</span>
                <input type="number" value={t.val} min={t.min} max={t.max}
                  onChange={e => t.set(Number(e.target.value))}
                  readOnly={t.label === 'Cold Lead'}
                  className="input-field w-20 text-center text-lg font-bold"
                  style={{ color:t.color }} />
                <span className="text-xs" style={{ color:'var(--text-3)' }}>pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring rules */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:'1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>Scoring Rules</h3>
          <button className="btn-primary text-xs" onClick={addRule}><Plus size={12}/>Add Rule</button>
        </div>
        <div className="p-4 space-y-2">
          {rules.map(r => (
            <div key={r.id} className="flex items-center gap-2 p-3 rounded-xl" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background:'var(--accent-dim)', color:'#5b6ef9', flexShrink:0 }}>IF</span>
              <select value={r.field} onChange={e=>updateRule(r.id,'field',e.target.value)}
                className="input-field flex-1 text-xs" style={{ padding:'0.25rem 0.5rem' }}>
                {FIELD_OPTS.map(o=><option key={o}>{o}</option>)}
              </select>
              <select value={r.operator} onChange={e=>updateRule(r.id,'operator',e.target.value)}
                className="input-field text-xs" style={{ padding:'0.25rem 0.5rem', width:110 }}>
                {OP_OPTS.map(o=><option key={o}>{o}</option>)}
              </select>
              {r.operator !== 'visited' && (
                <input value={r.value} onChange={e=>updateRule(r.id,'value',e.target.value)}
                  className="input-field text-xs" style={{ padding:'0.25rem 0.5rem', width:140 }}
                  placeholder="value..." />
              )}
              <span className="text-xs font-semibold ml-1" style={{ color:'var(--text-3)', flexShrink:0 }}>→</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <input type="number" value={r.points} onChange={e=>updateRule(r.id,'points',Number(e.target.value))}
                  className="input-field text-xs text-center" style={{ padding:'0.25rem 0.5rem', width:60 }} />
                <span className="text-xs" style={{ color:'var(--text-3)' }}>pts</span>
              </div>
              <button onClick={()=>delRule(r.id)} className="btn-ghost p-1"><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
        <div className="px-5 py-3" style={{ borderTop:'1px solid var(--border)' }}>
          <button className="btn-primary text-xs" onClick={() => toast('success','Scoring rules saved & applied to all leads')}>
            <Zap size={12}/>Save & Apply Rules
          </button>
        </div>
      </div>

      {/* Lead score preview */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color:'var(--text)' }}>
            <TrendingUp size={14} style={{ color:'#10b981' }}/>Score Preview
          </h3>
        </div>
        <table className="w-full">
          <thead><tr>{['Lead','Company','Score','Tier'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>
            {preview.map(p => (
              <tr key={p.name} className="tr">
                <td className="td font-medium">{p.name}</td>
                <td className="td" style={{ color:'var(--text-2)' }}>{p.company}</td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full" style={{ background:'var(--border-2)' }}>
                      <div className="h-full rounded-full" style={{ width:`${p.score}%`, background: p.tier==='hot'?'#ef4444':p.tier==='warm'?'#f59e0b':'#5b6ef9' }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color:'var(--text)' }}>{p.score}</span>
                  </div>
                </td>
                <td className="td">
                  <span className={`badge text-[10px] ${p.tier==='hot'?'badge-red':p.tier==='warm'?'badge-amber':'badge-blue'}`}>
                    {p.tier==='hot'?'🔥':p.tier==='warm'?'☀️':'❄️'} {p.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
