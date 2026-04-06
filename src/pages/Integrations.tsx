import { useState } from 'react';
import { CheckCircle, Plus, ExternalLink, Zap, RefreshCw } from 'lucide-react';

const integrations = [
  { id:'i1', name:'Apollo.io', category:'Enrichment', desc:'Source and enrich leads from Apollo\'s 260M+ contact database.', status:'connected', logo:'🔵', color:'bg-blue-50' },
  { id:'i2', name:'Clearbit', category:'Enrichment', desc:'Real-time B2B data enrichment for companies and contacts.', status:'connected', logo:'🟢', color:'bg-emerald-50' },
  { id:'i3', name:'Hunter.io', category:'Enrichment', desc:'Find and verify email addresses for any domain.', status:'disconnected', logo:'🟠', color:'bg-orange-50' },
  { id:'i4', name:'Instantly', category:'Email Sending', desc:'High-deliverability cold email sending platform.', status:'connected', logo:'⚡', color:'bg-amber-50' },
  { id:'i5', name:'Mailgun', category:'Email Sending', desc:'Transactional and marketing email API.', status:'disconnected', logo:'🔴', color:'bg-red-50' },
  { id:'i6', name:'SendGrid', category:'Email Sending', desc:'Email delivery and marketing platform.', status:'disconnected', logo:'🔵', color:'bg-blue-50' },
  { id:'i7', name:'Salesforce', category:'CRM Sync', desc:'Sync accounts, contacts, and opportunities to Salesforce.', status:'disconnected', logo:'☁️', color:'bg-sky-50' },
  { id:'i8', name:'HubSpot', category:'CRM Sync', desc:'Two-way sync with HubSpot CRM contacts and deals.', status:'disconnected', logo:'🟠', color:'bg-orange-50' },
  { id:'i9', name:'Pipedrive', category:'CRM Sync', desc:'Sync deals and contacts with Pipedrive.', status:'disconnected', logo:'🟢', color:'bg-green-50' },
  { id:'i10', name:'Google Calendar', category:'Calendar', desc:'Book meetings directly to prospects\' calendars.', status:'connected', logo:'📅', color:'bg-indigo-50' },
  { id:'i11', name:'Calendly', category:'Calendar', desc:'Embed Calendly booking links in outreach emails.', status:'disconnected', logo:'🔵', color:'bg-blue-50' },
  { id:'i12', name:'Slack', category:'Notifications', desc:'Get real-time alerts for replies, meetings, and pipeline changes.', status:'connected', logo:'💬', color:'bg-violet-50' },
  { id:'i13', name:'Webhooks', category:'Developer', desc:'Send real-time data to your own endpoints via webhooks.', status:'disconnected', logo:'🔗', color:'bg-gray-50' },
  { id:'i14', name:'Zapier', category:'Developer', desc:'Connect ProspectIQ to 5,000+ apps via Zapier.', status:'disconnected', logo:'⚡', color:'bg-amber-50' },
];

const categories = [...new Set(integrations.map(i=>i.category))];

export default function Integrations() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [statuses, setStatuses] = useState<Record<string,string>>({});

  const getStatus = (i: typeof integrations[0]) => statuses[i.id] ?? i.status;
  const toggle = (id: string, current: string) => setStatuses(s => ({...s, [id]: current==='connected'?'disconnected':'connected'}));
  const shown = activeCategory==='all' ? integrations : integrations.filter(i=>i.category===activeCategory);
  const connected = integrations.filter(i=>getStatus(i)==='connected').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500">Connect ProspectIQ to your existing tools and data sources.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle size={14} className="text-emerald-500"/>
          <span><span className="font-semibold text-gray-900">{connected}</span> of {integrations.length} connected</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        <button onClick={()=>setActiveCategory('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeCategory==='all'?'bg-indigo-600 text-white border-indigo-600':'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>All</button>
        {categories.map(c => <button key={c} onClick={()=>setActiveCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeCategory===c?'bg-indigo-600 text-white border-indigo-600':'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{c}</button>)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {shown.map(i => {
          const status = getStatus(i);
          return (
            <div key={i.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${i.color}`}>{i.logo}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{i.name}</h3>
                    <span className="text-xs text-gray-400">{i.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'connected' && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12}/>Connected</span>}
                  <button onClick={()=>toggle(i.id, status)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${status==='connected'?'bg-gray-100 text-gray-600 hover:bg-gray-200':'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{i.desc}</p>
              {status === 'connected' && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><RefreshCw size={10}/>Last synced: 2 hours ago</span>
                  <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"><ExternalLink size={10}/>Settings</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Webhooks section */}
      <div className="mt-6 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Zap size={18} className="text-white"/></div>
          <div>
            <h3 className="font-semibold">Custom Webhooks & API</h3>
            <p className="text-white/60 text-sm">Build custom integrations with the ProspectIQ API.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"><Plus size={14}/>Add Webhook</button>
          <button className="flex items-center gap-2 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"><ExternalLink size={14}/>API Docs</button>
        </div>
      </div>
    </div>
  );
}
