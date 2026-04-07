import { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Circle, AlertCircle, Zap, RefreshCw, Key } from 'lucide-react';
import type { Contact } from '../../types';

type Provider = 'apollo' | 'clearbit' | 'hunter' | 'manual';

interface ProviderConfig {
  name: string; icon: string; color: string;
  connected: boolean; credits: number; fields: string[];
  costPerLead: number;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  apollo:   { name:'Apollo.io',  icon:'🔵', color:'#2563eb', connected:true,  credits:4800, fields:['Phone','LinkedIn','Company Size','Funding Stage','Technology Stack','Job Changes'],  costPerLead:1 },
  clearbit: { name:'Clearbit',   icon:'🟢', color:'#10b981', connected:true,  credits:1200, fields:['Company Domain','Industry','Revenue Band','Employee Count','Social Profiles'],        costPerLead:2 },
  hunter:   { name:'Hunter.io',  icon:'🟠', color:'#f59e0b', connected:false, credits:0,    fields:['Email Verification','Email Pattern','Email Sources'],                                  costPerLead:1 },
  manual:   { name:'Manual',     icon:'✏️',  color:'#8b5cf6', connected:true,  credits:9999, fields:['Phone','LinkedIn','Company','Title','Custom fields'],                                 costPerLead:0 },
};

interface Props {
  open: boolean;
  onClose(): void;
  leads: Contact[];
  selectedIds: Set<string>;
}

type LeadStatus = 'pending' | 'enriching' | 'done' | 'failed';

export default function EnrichmentModal({ open, onClose, leads, selectedIds }: Props) {
  const { toast, contactOps } = useApp();
  const [tab, setTab] = useState<Provider>('apollo');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, LeadStatus>>({});
  const [results, setResults] = useState({ enriched:0, emails:0, phones:0, failed:0 });

  const targetLeads = selectedIds.size > 0
    ? leads.filter(l => selectedIds.has(l.id))
    : leads.slice(0, 12);

  const run = async () => {
    setRunning(true);
    setDone(false);
    const init: Record<string,LeadStatus> = {};
    targetLeads.forEach(l => init[l.id] = 'pending');
    setStatuses(init);

    let emails = 0, phones = 0, failed = 0;

    for (let i = 0; i < targetLeads.length; i++) {
      const lead = targetLeads[i];
      setStatuses(s => ({ ...s, [lead.id]: 'enriching' }));
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

      const success = Math.random() > 0.15;
      if (success) {
        const gotEmail = Math.random() > 0.3;
        const gotPhone = Math.random() > 0.4;
        if (gotEmail) emails++;
        if (gotPhone) phones++;
        // Update contact with mock enrichment data
        contactOps.update(lead.id, {
          enrichmentStatus: 'enriched',
          phone: gotPhone ? `+1 (${Math.floor(400+Math.random()*500)}) 555-${Math.floor(1000+Math.random()*9000)}` : lead.phone,
          linkedin: lead.linkedin || `https://linkedin.com/in/${lead.firstName.toLowerCase()}-${lead.lastName.toLowerCase()}`,
        });
      } else {
        failed++;
      }
      setStatuses(s => ({ ...s, [lead.id]: success ? 'done' : 'failed' }));
    }

    setResults({ enriched: targetLeads.length - failed, emails, phones, failed });
    setRunning(false);
    setDone(true);
    toast('success', `Enriched ${targetLeads.length - failed} leads`);
  };

  const cfg = PROVIDERS[tab];

  return (
    <Modal open={open} onClose={onClose} title="Enrich Leads" size="lg">
      <div className="space-y-4">
        {/* Provider tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background:'var(--surface-2)' }}>
          {(Object.entries(PROVIDERS) as [Provider, ProviderConfig][]).map(([key, p]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg font-medium transition-all"
              style={{ background:tab===key?'var(--modal-bg)':'transparent', color:tab===key?'var(--text)':'var(--text-3)', boxShadow:tab===key?'var(--shadow-card)':'none' }}>
              <span>{p.icon}</span>{p.name}
              {p.connected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>

        {/* Provider details */}
        <div className="p-4 rounded-xl" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cfg.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{cfg.name}</p>
                <p className="text-xs" style={{ color:'var(--text-3)' }}>
                  {cfg.connected ? <span className="text-emerald-400">● Connected</span> : <span className="text-red-400">● Not connected</span>}
                </p>
              </div>
            </div>
            {cfg.connected && (
              <div className="text-right">
                <p className="text-xs" style={{ color:'var(--text-3)' }}>Credits remaining</p>
                <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{cfg.credits.toLocaleString()}</p>
              </div>
            )}
          </div>

          {!cfg.connected && tab !== 'manual' ? (
            <div className="text-center py-4">
              <Key size={24} className="mx-auto mb-2" style={{ color:'var(--text-3)' }} />
              <p className="text-sm" style={{ color:'var(--text)' }}>Not connected</p>
              <p className="text-xs mt-1 mb-3" style={{ color:'var(--text-3)' }}>Connect {cfg.name} in Integrations to use enrichment</p>
              <button className="btn-primary text-xs">Connect {cfg.name}</button>
            </div>
          ) : (
            <>
              <p className="text-xs mb-2" style={{ color:'var(--text-3)' }}>Fields this provider enriches:</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cfg.fields.map(f => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'var(--accent-dim)', color:'#5b6ef9' }}>{f}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg" style={{ background:'var(--surface-3)' }}>
                <span style={{ color:'var(--text-3)' }}>Cost estimate</span>
                <span className="font-semibold" style={{ color:'var(--text)' }}>
                  {targetLeads.length} leads × {cfg.costPerLead} credit{cfg.costPerLead!==1?'s':''} = <strong style={{ color:'#5b6ef9' }}>{targetLeads.length * cfg.costPerLead} credits</strong>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Per-lead progress */}
        {(running || done) && (
          <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)', maxHeight:240, overflowY:'auto' }}>
            {targetLeads.map(l => {
              const st = statuses[l.id] || 'pending';
              return (
                <div key={l.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom:'1px solid var(--border)' }}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    {st === 'done'     && <CheckCircle size={15} style={{ color:'#10b981' }} />}
                    {st === 'failed'   && <AlertCircle size={15} style={{ color:'#ef4444' }} />}
                    {st === 'enriching'&& <RefreshCw   size={15} style={{ color:'#5b6ef9' }} className="animate-spin" />}
                    {st === 'pending'  && <Circle      size={15} style={{ color:'var(--text-3)' }} />}
                  </div>
                  <p className="text-xs flex-1" style={{ color:'var(--text)' }}>{l.firstName} {l.lastName}</p>
                  <span className="text-[10px]" style={{ color:'var(--text-3)' }}>{l.accountName}</span>
                  <span className="text-[10px]" style={{ color: st==='done'?'#10b981':st==='failed'?'#ef4444':'var(--text-3)' }}>
                    {st === 'done' ? 'Enriched' : st === 'failed' ? 'Failed' : st === 'enriching' ? 'Enriching...' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {done && (
          <div className="p-4 rounded-xl" style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-sm font-semibold text-emerald-400 mb-2">✅ Enrichment complete</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                {label:'Enriched',   val:results.enriched, color:'#10b981'},
                {label:'Emails found', val:results.emails, color:'#5b6ef9'},
                {label:'Phones found', val:results.phones, color:'#8b5cf6'},
                {label:'Failed',     val:results.failed,   color:'#ef4444'},
              ].map(s => (
                <div key={s.label} className="p-2 rounded-lg" style={{ background:'var(--surface-2)' }}>
                  <p className="text-lg font-bold" style={{ color:s.color }}>{s.val}</p>
                  <p className="text-[10px]" style={{ color:'var(--text-3)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary text-xs">Close</button>
          {!done && cfg.connected && (
            <button onClick={run} disabled={running} className="btn-primary text-xs">
              {running ? <><RefreshCw size={12} className="animate-spin"/>Enriching...</> : <><Zap size={12}/>Enrich {targetLeads.length} leads</>}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
