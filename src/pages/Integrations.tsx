import { useState } from 'react';
import { CheckCircle, Plus, ExternalLink, Zap, RefreshCw, Key, Coins, TestTube, Clock } from 'lucide-react';

const integrations = [
  { id:'i1', name:'Apollo.io', category:'Enrichment', desc:'Source and enrich leads from Apollo\'s 260M+ contact database.', status:'connected', logo:'🔵', color:'bg-blue-500/10' },
  { id:'i2', name:'Clearbit', category:'Enrichment', desc:'Real-time B2B data enrichment for companies and contacts.', status:'connected', logo:'🟢', color:'bg-emerald-500/10' },
  { id:'i3', name:'Hunter.io', category:'Enrichment', desc:'Find and verify email addresses for any domain.', status:'disconnected', logo:'🟠', color:'bg-orange-500/10' },
  { id:'i4', name:'Instantly', category:'Email Sending', desc:'High-deliverability cold email sending platform.', status:'connected', logo:'⚡', color:'bg-amber-500/10' },
  { id:'i5', name:'Mailgun', category:'Email Sending', desc:'Transactional and marketing email API.', status:'disconnected', logo:'🔴', color:'bg-red-500/10' },
  { id:'i6', name:'SendGrid', category:'Email Sending', desc:'Email delivery and marketing platform.', status:'disconnected', logo:'🔵', color:'bg-blue-500/10' },
  { id:'i7', name:'Salesforce', category:'CRM Sync', desc:'Sync accounts, contacts, and opportunities to Salesforce.', status:'disconnected', logo:'☁️', color:'bg-sky-500/10' },
  { id:'i8', name:'HubSpot', category:'CRM Sync', desc:'Two-way sync with HubSpot CRM contacts and deals.', status:'disconnected', logo:'🟠', color:'bg-orange-500/10' },
  { id:'i9', name:'Pipedrive', category:'CRM Sync', desc:'Sync deals and contacts with Pipedrive.', status:'disconnected', logo:'🟢', color:'bg-green-500/10' },
  { id:'i10', name:'Google Calendar', category:'Calendar', desc:'Book meetings directly to prospects\' calendars.', status:'connected', logo:'📅', color:'bg-indigo-500/10' },
  { id:'i11', name:'Calendly', category:'Calendar', desc:'Embed Calendly booking links in outreach emails.', status:'disconnected', logo:'🔵', color:'bg-blue-500/10' },
  { id:'i12', name:'Slack', category:'Notifications', desc:'Get real-time alerts for replies, meetings, and pipeline changes.', status:'connected', logo:'💬', color:'bg-violet-500/10' },
  { id:'i13', name:'Webhooks', category:'Developer', desc:'Send real-time data to your own endpoints via webhooks.', status:'disconnected', logo:'🔗', color:'bg-gray-500/10' },
  { id:'i14', name:'Zapier', category:'Developer', desc:'Connect ProspectIQ to 5,000+ apps via Zapier.', status:'disconnected', logo:'⚡', color:'bg-amber-500/10' },
];

const categories = ['All', ...new Set(integrations.map(i=>i.category))];

const CREDITS: Record<string,number> = { i1:4820, i2:9150, i3:1200 };
const SYNC_OPTIONS = ['Real-time','Every 15 min','Hourly','Daily'];

export default function Integrations() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [statuses, setStatuses] = useState<Record<string,string>>({});
  const [apiKeys, setApiKeys] = useState<Record<string,string>>({});
  const [showKey, setShowKey] = useState<Record<string,boolean>>({});
  const [syncFreq, setSyncFreq] = useState<Record<string,string>>({});
  const [testing, setTesting] = useState<string|null>(null);
  const [testResult, setTestResult] = useState<Record<string,boolean>>({});

  const getStatus = (i: typeof integrations[0]) => statuses[i.id] ?? i.status;
  const toggle = (id: string, current: string) => setStatuses(s => ({...s, [id]: current==='connected'?'disconnected':'connected'}));
  const shown = activeCategory==='All' ? integrations : integrations.filter(i=>i.category===activeCategory);
  const connected = integrations.filter(i=>getStatus(i)==='connected').length;

  const testConnection = (id: string) => {
    setTesting(id);
    setTimeout(()=>{ setTesting(null); setTestResult(s=>({...s,[id]:true})); setTimeout(()=>setTestResult(s=>({...s,[id]:false})),3000); }, 1500);
  };

  return (
    <div className="p-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Integrations</h1>
          <p className="text-sm mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>Connect ProspectIQ to your existing tools.</p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>
          <CheckCircle size={13} className="text-emerald-400"/>
          <span><span className="font-semibold text-white">{connected}</span> of {integrations.length} connected</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={()=>setActiveCategory(c)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: activeCategory===c?'#5b6ef9':'rgba(255,255,255,0.05)',
              color: activeCategory===c?'#fff':'rgba(255,255,255,0.5)',
              border: activeCategory===c?'1px solid transparent':'1px solid rgba(255,255,255,0.08)'
            }}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {shown.map(i => {
          const status = getStatus(i);
          return (
            <div key={i.id} className="rounded-xl p-5 group transition-all hover:shadow-glass"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${i.color}`}>{i.logo}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{i.name}</h3>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>{i.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status==='connected' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle size={11}/>Connected
                    </span>
                  )}
                  <button onClick={()=>toggle(i.id, status)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: status==='connected'?'rgba(255,255,255,0.06)':'rgba(91,110,249,0.15)',
                      color: status==='connected'?'rgba(255,255,255,0.5)':'#5b6ef9',
                      border: status==='connected'?'1px solid rgba(255,255,255,0.08)':'1px solid rgba(91,110,249,0.2)'
                    }}>
                    {status==='connected'?'Disconnect':'Connect'}
                  </button>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color:'rgba(255,255,255,0.45)' }}>{i.desc}</p>
              {status==='connected' && (
                <div className="mt-3 pt-3 space-y-3"
                  style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  {/* API Key field */}
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color:'rgba(255,255,255,0.3)' }}>
                      <Key size={9}/>API Key
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type={showKey[i.id]?'text':'password'}
                        value={apiKeys[i.id]??'sk-demo-key-xxxxxxxxxxxxxxxx'}
                        onChange={e=>setApiKeys(s=>({...s,[i.id]:e.target.value}))}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)' }}
                      />
                      <button onClick={()=>setShowKey(s=>({...s,[i.id]:!s[i.id]}))}
                        className="text-[10px] px-2 rounded-lg"
                        style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        {showKey[i.id]?'Hide':'Show'}
                      </button>
                    </div>
                  </div>
                  {/* Credits (enrichment only) */}
                  {CREDITS[i.id] !== undefined && (
                    <div className="flex items-center gap-2 text-xs">
                      <Coins size={11} style={{ color:'#f59e0b' }}/>
                      <span style={{ color:'rgba(255,255,255,0.5)' }}>Credits:</span>
                      <span className="font-semibold text-white">{CREDITS[i.id].toLocaleString()}</span>
                      <span style={{ color:'rgba(255,255,255,0.3)' }}>remaining</span>
                    </div>
                  )}
                  {/* Sync frequency */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>
                      <Clock size={10}/>
                      <select value={syncFreq[i.id]??'Hourly'}
                        onChange={e=>setSyncFreq(s=>({...s,[i.id]:e.target.value}))}
                        className="text-[11px] outline-none"
                        style={{ background:'transparent', color:'rgba(255,255,255,0.5)', border:'none' }}>
                        {SYNC_OPTIONS.map(o=><option key={o} value={o} style={{background:'#1a1a1a'}}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResult[i.id] && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                          <CheckCircle size={10}/>Connected
                        </span>
                      )}
                      <button onClick={()=>testConnection(i.id)} disabled={testing===i.id}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                        style={{ background:'rgba(91,110,249,0.1)', color:'#5b6ef9', border:'1px solid rgba(91,110,249,0.15)' }}>
                        {testing===i.id?<><RefreshCw size={9} className="animate-spin"/>Testing…</>:<><TestTube size={9}/>Test</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* API section */}
      <div className="mt-6 rounded-2xl p-6" style={{ background:'linear-gradient(135deg,rgba(91,110,249,0.15),rgba(139,92,246,0.1))', border:'1px solid rgba(91,110,249,0.2)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(91,110,249,0.2)' }}>
            <Zap size={18} style={{ color:'#5b6ef9' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Custom Webhooks & API</h3>
            <p className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>Build custom integrations with the ProspectIQ API.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg"
            style={{ background:'rgba(91,110,249,0.2)', color:'#5b6ef9', border:'1px solid rgba(91,110,249,0.3)' }}>
            <Plus size={13}/>Add Webhook
          </button>
          <button className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg"
            style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ExternalLink size={13}/>API Docs
          </button>
        </div>
      </div>
    </div>
  );
}
