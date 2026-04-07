import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, CreditCard, Zap, Users, Mail, ArrowUpRight } from 'lucide-react';

const plans = [
  { name:'Starter', price:49, desc:'Perfect for small teams', features:['500 leads/month','2 team members','3 active campaigns','AI personalization','Basic analytics'], highlight:false },
  { name:'Growth', price:149, desc:'For growing sales teams', features:['2,500 leads/month','10 team members','Unlimited campaigns','Advanced AI writing','Full enrichment','CRM integrations','Priority support'], highlight:true },
  { name:'Scale', price:399, desc:'For serious revenue teams', features:['Unlimited leads','Unlimited members','Unlimited campaigns','Custom AI models','Dedicated enrichment','Salesforce sync','White-glove onboarding','SLA support'], highlight:false },
];

export default function Billing() {
  const { currentPlan, toast } = useApp();
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly');

  const selectPlan = (name: string) => {
    if (name === currentPlan) return;
    toast('success', `Switched to ${name} plan`);
  };

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>Billing & Plans</h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Manage your subscription and payment methods.</p>
      </div>

      {/* Current plan card */}
      <div className="rounded-2xl p-6 mb-8"
        style={{ background:'linear-gradient(135deg,rgba(91,110,249,0.2),rgba(139,92,246,0.15))', border:'1px solid rgba(91,110,249,0.25)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} style={{ color:'var(--text-2)' }} />
              <span className="text-sm font-medium" style={{ color:'var(--text-2)' }}>Current Plan</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color:"var(--text)" }}>{currentPlan || 'Growth'} Plan</h2>
            <p className="text-sm mt-1" style={{ color:'var(--text-2)' }}>$149/month · Renews April 5, 2027</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color:"var(--text)" }}>$149</p>
            <p className="text-sm" style={{ color:'var(--text-2)' }}>per month</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5" style={{ borderTop:'1px solid var(--border-2)' }}>
          {[
            {icon:Users, label:'Team Members', used:4, total:10},
            {icon:Mail, label:'Leads This Month', used:1247, total:2500},
            {icon:Zap, label:'Enrichments', used:892, total:2000},
          ].map(s => {
            const Icon = s.icon;
            const pct = Math.round((s.used/s.total)*100);
            return (
              <div key={s.label}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={12} style={{ color:'var(--text-2)' }} />
                  <span className="text-xs" style={{ color:'var(--text-2)' }}>{s.label}</span>
                </div>
                <p className="text-base font-bold" style={{ color:"var(--text)" }}>{s.used.toLocaleString()} <span className="text-sm font-normal" style={{ color:'var(--text-2)' }}>/ {s.total.toLocaleString()}</span></p>
                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background:'var(--border-2)' }}>
                  <div className="h-full rounded-full" style={{ width:`${pct}%`, background:'#fff' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold" style={{ color:"var(--text)" }}>Change Plan</h2>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background:'var(--surface-2)' }}>
          {(['monthly','annual'] as const).map(b=>(
            <button key={b} onClick={()=>setBilling(b)}
              className="px-3 py-1 text-xs rounded-lg capitalize transition-colors"
              style={{ background:billing===b?'rgba(91,110,249,0.3)':'transparent', color:billing===b?'#fff':'var(--text-2)' }}>
              {b}{b==='annual'?<span className="ml-1 text-emerald-400">-20%</span>:null}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {plans.map(plan => {
          const isCurrent = plan.name === (currentPlan || 'Growth');
          const price = billing==='annual' ? Math.round(plan.price*0.8) : plan.price;
          return (
            <div key={plan.name} className="rounded-2xl p-5 relative transition-all"
              style={{
                border: plan.highlight?'1px solid rgba(91,110,249,0.4)':'1px solid var(--border)',
                background: plan.highlight?'rgba(91,110,249,0.08)':'var(--surface)'
              }}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background:'#5b6ef9', color:'var(--text)' }}>Most Popular</div>
              )}
              <h3 className="font-bold text-base mb-0.5" style={{ color:plan.highlight?'#5b6ef9':'#fff' }}>{plan.name}</h3>
              <p className="text-xs mb-4" style={{ color:'var(--text-2)' }}>{plan.desc}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold" style={{ color:"var(--text)" }}>${price}</span>
                <span className="text-sm" style={{ color:'var(--text-2)' }}>/mo</span>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map(f=>(
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color:'var(--text-2)' }}>
                    <CheckCircle size={13} style={{ color:plan.highlight?'#5b6ef9':'#10b981', flexShrink:0 }} />{f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>selectPlan(plan.name)}
                className="w-full text-xs font-semibold py-2.5 rounded-xl transition-colors"
                style={{
                  background: isCurrent?'var(--border-2)':plan.highlight?'#5b6ef9':'var(--surface-2)',
                  color: isCurrent?'var(--text-2)':plan.highlight?'#fff':'var(--text-2)',
                  cursor: isCurrent?'default':'pointer'
                }}>
                {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment method */}
      <div className="rounded-xl p-5" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold  mb-4 flex items-center gap-2" style={{ color:"var(--text)" }}>
          <CreditCard size={15}/>Payment Method
        </h3>
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background:'var(--surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
            <div>
              <p className="text-sm font-medium" style={{ color:"var(--text)" }}>Visa ending in 4242</p>
              <p className="text-xs" style={{ color:'var(--text-2)' }}>Expires 08/2028</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium" style={{ color:'#5b6ef9' }}>
            Update <ArrowUpRight size={11}/>
          </button>
        </div>
      </div>
    </div>
  );
}
