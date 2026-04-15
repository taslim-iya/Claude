import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Plus, ExternalLink, Zap, RefreshCw, Key, Coins, TestTube, Clock, AlertCircle, Mail, Database, Users, CalendarDays, Bell, Code } from 'lucide-react';

const integrations = [
  { id:'resend', name:'Resend', category:'Email Sending', desc:'Modern email API for sending outreach emails. Free tier: 100 emails/day.', status:'disconnected', logo:'📨', color:'bg-blue-500/10', envKey:'RESEND_API_KEY', docsUrl:'https://resend.com/docs', signupUrl:'https://resend.com/signup' },
  { id:'sendgrid', name:'SendGrid', category:'Email Sending', desc:'Email delivery platform. Free tier: 100 emails/day forever.', status:'disconnected', logo:'📧', color:'bg-blue-500/10', envKey:'SENDGRID_API_KEY', docsUrl:'https://docs.sendgrid.com', signupUrl:'https://signup.sendgrid.com' },
  { id:'instantly', name:'Instantly.ai', category:'Email Sending', desc:'Cold email sending + warmup platform. Best for high-volume outreach. $30/mo.', status:'disconnected', logo:'⚡', color:'bg-amber-500/10', docsUrl:'https://instantly.ai', signupUrl:'https://instantly.ai/signup' },
  { id:'companies_house', name:'Companies House', category:'Enrichment', desc:'UK company data — officers, filings, accounts, PSCs. Free API.', status:'connected', logo:'🏛️', color:'bg-emerald-500/10', envKey:'COMPANIES_HOUSE_KEY', docsUrl:'https://developer.company-information.service.gov.uk' },
  { id:'apollo', name:'Apollo.io', category:'Enrichment', desc:'260M+ B2B contacts with emails, phone numbers, and LinkedIn profiles. Free tier: 10K credits/mo.', status:'disconnected', logo:'🔵', color:'bg-blue-500/10', envKey:'APOLLO_API_KEY', docsUrl:'https://apolloio.github.io/apollo-api-docs', signupUrl:'https://app.apollo.io/#/signup' },
  { id:'hunter', name:'Hunter.io', category:'Enrichment', desc:'Find and verify professional email addresses. Free: 25 searches/mo.', status:'disconnected', logo:'🟠', color:'bg-orange-500/10', docsUrl:'https://hunter.io/api-documentation', signupUrl:'https://hunter.io/users/sign_up' },
  { id:'hubspot', name:'HubSpot CRM', category:'CRM Sync', desc:'Sync prospects and deals to HubSpot. Free CRM available.', status:'disconnected', logo:'🟠', color:'bg-orange-500/10', docsUrl:'https://developers.hubspot.com', signupUrl:'https://app.hubspot.com/signup' },
  { id:'pipedrive', name:'Pipedrive', category:'CRM Sync', desc:'Sync leads and deals with Pipedrive.', status:'disconnected', logo:'🟢', color:'bg-green-500/10', docsUrl:'https://developers.pipedrive.com', signupUrl:'https://www.pipedrive.com/register' },
  { id:'calendly', name:'Calendly', category:'Scheduling', desc:'Embed booking links in outreach emails. Automate meeting scheduling.', status:'disconnected', logo:'📅', color:'bg-indigo-500/10', docsUrl:'https://developer.calendly.com', signupUrl:'https://calendly.com/signup' },
  { id:'cal', name:'Cal.com', category:'Scheduling', desc:'Open-source scheduling. Self-hostable alternative to Calendly.', status:'disconnected', logo:'📆', color:'bg-violet-500/10', docsUrl:'https://cal.com/docs', signupUrl:'https://cal.com/signup' },
  { id:'slack', name:'Slack', category:'Notifications', desc:'Get alerts for replies, meetings, and pipeline changes.', status:'disconnected', logo:'💬', color:'bg-violet-500/10', docsUrl:'https://api.slack.com', signupUrl:'https://slack.com/get-started' },
  { id:'webhooks', name:'Webhooks', category:'Developer', desc:'Send real-time events to your own endpoints.', status:'disconnected', logo:'🔗', color:'bg-gray-500/10', docsUrl:'#' },
  { id:'zapier', name:'Zapier', category:'Developer', desc:'Connect to 5,000+ apps via Zapier.', status:'disconnected', logo:'⚡', color:'bg-amber-500/10', docsUrl:'https://zapier.com', signupUrl:'https://zapier.com/sign-up' },
];

const categories = ['All', ...new Set(integrations.map(i => i.category))];

export default function Integrations() {
  const { toast } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'success' | 'error'>>({});

  const getStatus = (i: typeof integrations[0]) => statuses[i.id] ?? i.status;
  const shown = activeCategory === 'All' ? integrations : integrations.filter(i => i.category === activeCategory);
  const connected = integrations.filter(i => getStatus(i) === 'connected').length;

  const handleConnect = (id: string, name: string) => {
    setStatuses(s => ({ ...s, [id]: 'connected' }));
    toast('success', `${name} connected`);
  };

  const handleDisconnect = (id: string, name: string) => {
    if (window.confirm(`Disconnect ${name}?`)) {
      setStatuses(s => ({ ...s, [id]: 'disconnected' }));
      setApiKeys(s => { const n = { ...s }; delete n[id]; return n; });
      toast('success', `${name} disconnected`);
    }
  };

  const testConnection = async (i: typeof integrations[0]) => {
    const key = apiKeys[i.id];
    if (!key && i.id !== 'companies_house') {
      toast('warning', `Enter an API key for ${i.name} first`);
      return;
    }
    setTesting(i.id);
    setTestResult(s => { const n = { ...s }; delete n[i.id]; return n; });

    // Real test for supported integrations
    try {
      if (i.id === 'companies_house') {
        const res = await fetch('/api/companies-house?path=/company/00000006');
        setTestResult(s => ({ ...s, [i.id]: res.ok ? 'success' : 'error' }));
        toast(res.ok ? 'success' : 'error', res.ok ? 'Companies House API connected ✓' : 'Companies House API failed');
      } else if (i.id === 'resend') {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-resend-key': key },
          body: JSON.stringify({ to: 'test@test.com', subject: 'Connection test', text: 'Test', from: 'test@test.com' }),
        });
        // Even a 422 means the key is valid
        const ok = res.status !== 401 && res.status !== 403;
        setTestResult(s => ({ ...s, [i.id]: ok ? 'success' : 'error' }));
        toast(ok ? 'success' : 'error', ok ? 'Resend API key valid ✓' : 'Invalid API key');
      } else {
        // Generic: just mark as tested
        setTimeout(() => {
          setTestResult(s => ({ ...s, [i.id]: 'success' }));
          toast('success', `${i.name} key saved`);
        }, 800);
      }
    } catch {
      setTestResult(s => ({ ...s, [i.id]: 'error' }));
      toast('error', `Connection test failed for ${i.name}`);
    }
    setTesting(null);
  };

  const catIcons: Record<string, any> = {
    'Email Sending': Mail, 'Enrichment': Database, 'CRM Sync': Users,
    'Scheduling': CalendarDays, 'Notifications': Bell, 'Developer': Code,
  };

  return (
    <div className="p-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Integrations</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Connect your tools to start prospecting.</p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
          <CheckCircle size={13} className="text-emerald-400" />
          <span><span className="font-semibold" style={{ color: 'var(--text)' }}>{connected}</span> of {integrations.length} connected</span>
        </div>
      </div>

      {/* Setup guide for new users */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(91,110,249,0.06)', border: '1px solid rgba(91,110,249,0.15)' }}>
        <h3 className="text-xs font-bold mb-2" style={{ color: 'var(--text)' }}>⚡ Quick Start — Get sending in 3 steps</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-[11px]" style={{ color: 'var(--text-2)' }}>
            <span className="font-bold" style={{ color: '#5b6ef9' }}>1.</span> Sign up for <a href="https://resend.com/signup" target="_blank" className="underline font-medium" style={{ color: '#5b6ef9' }}>Resend</a> (free — 100 emails/day)
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-2)' }}>
            <span className="font-bold" style={{ color: '#5b6ef9' }}>2.</span> Paste your API key below and hit Test
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-2)' }}>
            <span className="font-bold" style={{ color: '#5b6ef9' }}>3.</span> Go to Leads → select companies → Send Email
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: activeCategory === c ? '#5b6ef9' : 'var(--surface-2)',
              color: activeCategory === c ? '#fff' : 'var(--text-2)',
              border: activeCategory === c ? '1px solid transparent' : '1px solid var(--border)'
            }}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {shown.map(i => {
          const status = getStatus(i);
          const isConnected = status === 'connected';
          return (
            <div key={i.id} className="rounded-xl p-5 transition-all"
              style={{ background: 'var(--surface)', border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'var(--border)'}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${i.color}`}>{i.logo}</div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{i.name}</h3>
                    <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{i.category}</span>
                  </div>
                </div>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400"><CheckCircle size={11} />Connected</span>
                ) : null}
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>{i.desc}</p>

              {/* API Key input */}
              {i.envKey && (
                <div className="mb-3">
                  <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>
                    <Key size={9} />API Key {i.envKey && <span className="normal-case font-normal">({i.envKey})</span>}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type={showKey[i.id] ? 'text' : 'password'}
                      value={apiKeys[i.id] ?? ''}
                      onChange={e => setApiKeys(s => ({ ...s, [i.id]: e.target.value }))}
                      placeholder={`Paste your ${i.name} API key...`}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                    />
                    <button onClick={() => setShowKey(s => ({ ...s, [i.id]: !s[i.id] }))}
                      className="text-[10px] px-2 rounded-lg"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      {showKey[i.id] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {i.signupUrl && (
                    <a href={i.signupUrl} target="_blank"
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      <ExternalLink size={9} />Sign up
                    </a>
                  )}
                  {i.docsUrl && i.docsUrl !== '#' && (
                    <a href={i.docsUrl} target="_blank"
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      <ExternalLink size={9} />Docs
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {testResult[i.id] === 'success' && <CheckCircle size={12} className="text-emerald-400" />}
                  {testResult[i.id] === 'error' && <AlertCircle size={12} style={{ color: '#ef4444' }} />}
                  <button onClick={() => testConnection(i)} disabled={testing === i.id}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                    style={{ background: 'rgba(91,110,249,0.1)', color: '#5b6ef9', border: '1px solid rgba(91,110,249,0.15)' }}>
                    {testing === i.id ? <><RefreshCw size={9} className="animate-spin" />Testing...</> : <><TestTube size={9} />Test</>}
                  </button>
                  {isConnected ? (
                    <button onClick={() => handleDisconnect(i.id, i.name)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={() => handleConnect(i.id, i.name)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(91,110,249,0.15)', color: '#5b6ef9', border: '1px solid rgba(91,110,249,0.2)' }}>
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
