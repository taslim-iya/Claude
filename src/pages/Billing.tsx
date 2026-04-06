import { CheckCircle, CreditCard, Zap, Users, Mail, ArrowUpRight } from 'lucide-react';

const plans = [
  { name:'Starter', price:49, desc:'Perfect for small teams and solo founders', features:['500 leads/month','2 team members','3 active campaigns','AI personalization','Email enrichment','Basic analytics'], highlight:false },
  { name:'Growth', price:149, desc:'For growing sales teams that need more power', features:['2,500 leads/month','10 team members','Unlimited campaigns','Advanced AI writing','Full enrichment suite','CRM integrations','Priority support'], highlight:true },
  { name:'Scale', price:399, desc:'For serious revenue teams scaling outbound', features:['Unlimited leads','Unlimited members','Unlimited campaigns','Custom AI models','Dedicated enrichment','Salesforce sync','White-glove onboarding','SLA support'], highlight:false },
];

export default function Billing() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-sm text-gray-500">Manage your subscription, usage, and payment methods.</p>
      </div>

      {/* Current plan */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-white/80"/>
              <span className="text-white/80 text-sm font-medium">Current Plan</span>
            </div>
            <h2 className="text-2xl font-bold">Growth Plan</h2>
            <p className="text-white/70 text-sm mt-1">$149/month · Renews April 5, 2026</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">$149</p>
            <p className="text-white/70 text-sm">per month</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          {[
            {icon:Users, label:'Team Members', used:4, total:10},
            {icon:Mail, label:'Leads This Month', used:1247, total:2500},
            {icon:Zap, label:'Enrichments', used:892, total:2000},
          ].map(s => {
            const Icon = s.icon; const pct = Math.round((s.used/s.total)*100);
            return (
              <div key={s.label}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={13} className="text-white/70"/><span className="text-xs text-white/70">{s.label}</span>
                </div>
                <p className="text-lg font-bold">{s.used.toLocaleString()} <span className="text-sm font-normal text-white/60">/ {s.total.toLocaleString()}</span></p>
                <div className="mt-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{width:`${pct}%`}}/></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Plan</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {plans.map(plan => (
          <div key={plan.name} className={`rounded-2xl p-5 border-2 transition-all relative ${plan.highlight ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>}
            <h3 className={`font-bold text-lg mb-0.5 ${plan.highlight ? 'text-indigo-700' : 'text-gray-900'}`}>{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
            <div className="mb-4">
              <span className={`text-3xl font-bold ${plan.highlight ? 'text-indigo-700' : 'text-gray-900'}`}>${plan.price}</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>
            <ul className="space-y-2 mb-5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={14} className={plan.highlight ? 'text-indigo-500' : 'text-emerald-500'} flex-shrink-0 />{f}
                </li>
              ))}
            </ul>
            <button className={`w-full text-sm font-semibold py-2.5 rounded-xl transition-colors ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {plan.name === 'Growth' ? 'Current Plan' : 'Switch to ' + plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={16}/>Payment Method</h3>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
              <p className="text-xs text-gray-400">Expires 08/2028</p>
            </div>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">Update <ArrowUpRight size={12}/></button>
        </div>
      </div>
    </div>
  );
}
