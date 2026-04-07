import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, Building2, Globe, Users, TrendingUp } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const INDUSTRY_OPTS = ['SaaS','FinTech','HealthTech','E-commerce','Enterprise','Agency','Manufacturing','Other'];

function statusBadge(enrichmentStatus: string) {
  const map: Record<string,string> = {
    enriched:'bg-emerald-500/15 text-emerald-400',
    partial:'bg-amber-500/15 text-amber-400',
    not_enriched:'bg-gray-500/15 text-gray-400',
  };
  return map[enrichmentStatus] ?? 'bg-gray-500/15 text-gray-400';
}

export default function Accounts() {
  const { accounts, accountOps, contacts, toast } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', domain:'', industry:'SaaS', headquarters:'', description:'' });

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    return !search || a.name.toLowerCase().includes(q) || a.domain?.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q);
  });

  const handleAdd = () => {
    if (!form.name) { toast('error','Company name required'); return; }
    const now = new Date().toISOString();
    accountOps.add({
      id: crypto.randomUUID(),
      name: form.name,
      domain: form.domain,
      industry: form.industry,
      headquarters: form.headquarters,
      description: form.description,
      website: form.domain ? `https://${form.domain}` : '',
      linkedin: '',
      employeeCount: 0,
      revenueBand: '',
      country: '',
      technologies: [],
      enrichmentStatus: 'not_enriched',
      leadScore: 0,
      scoreLabel: 'nurture',
      owner: 'Sarah Miller',
      source: 'Manual',
      tags: [],
      lastUpdated: now,
      createdAt: now,
    });
    setShowAdd(false);
    setForm({ name:'', domain:'', industry:'SaaS', headquarters:'', description:'' });
  };

  const contactCount = (accountName: string) => contacts.filter(c => c.accountName === accountName).length;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Accounts</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>{accounts.length} companies tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search accounts..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg outline-none w-56"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
          </div>
          <button onClick={()=>setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background:'#5b6ef9', color:'#fff' }}>
            <Plus size={13}/>Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-20">
            <Building2 size={36} className="mx-auto mb-3" style={{ color:'rgba(255,255,255,0.1)' }} />
            <p className="text-sm" style={{ color:'var(--text-3)' }}>No accounts found</p>
            <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
              style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Add first account</button>
          </div>
        ) : filtered.map(a => (
          <div key={a.id} className="rounded-xl p-5 group transition-all hover:shadow-glass"
            style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#1e2040,#2a2d5a)' }}>
                  {a.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color:'var(--text)' }}>{a.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Globe size={10} style={{ color:'var(--text-3)' }} />
                    <span className="text-xs" style={{ color:'var(--text-3)' }}>{a.domain || a.website || 'No domain'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>setDeleteId(a.id)} className="w-6 h-6 flex items-center justify-center rounded"
                  style={{ color:'var(--text-3)' }}>
                  <Trash2 size={11}/>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(a.enrichmentStatus)}`}>
                {a.enrichmentStatus.replace('_',' ')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>{a.industry}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Users size={10} style={{ color:'var(--text-3)' }} />
                  <span className="text-[10px]" style={{ color:'var(--text-3)' }}>Contacts</span>
                </div>
                <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{contactCount(a.name)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Building2 size={10} style={{ color:'var(--text-3)' }} />
                  <span className="text-[10px]" style={{ color:'var(--text-3)' }}>Employees</span>
                </div>
                <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{a.employeeCount || '—'}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp size={10} style={{ color:'var(--text-3)' }} />
                  <span className="text-[10px]" style={{ color:'var(--text-3)' }}>Score</span>
                </div>
                <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{a.leadScore || '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Account" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Company Name *</label>
              <input placeholder="Acme Corp" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
            </div>
            {[
              {label:'Domain',key:'domain',placeholder:'acmecorp.com'},
              {label:'Headquarters',key:'headquarters',placeholder:'San Francisco, CA'},
            ].map(f=>(
              <div key={f.key}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color:'var(--text-2)' }}>{f.label}</label>
                <input placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Industry</label>
            <select value={form.industry} onChange={e=>setForm(x=>({...x,industry:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
              {INDUSTRY_OPTS.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'#fff' }}>Add Account</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={()=>setDeleteId(null)}
        onConfirm={()=>{ accountOps.del(deleteId!); setDeleteId(null); }}
        title="Delete Account"
        message="Are you sure? All associated data will be removed."
        confirmLabel="Delete Account"
        variant="danger"
      />
    </div>
  );
}
