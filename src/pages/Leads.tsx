import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, Mail, Building2, Download, Users, Sparkles, Upload } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportModal from '../components/ui/ExportModal';
import EnrichmentModal from '../components/ui/EnrichmentModal';
import ImportLeadsModal from '../components/ui/ImportLeadsModal';
import type { Contact } from '../types';

const STATUS_OPTS = ['not_contacted','in_sequence','replied','interested','not_interested','unsubscribed','bounced'] as const;
const SOURCE_OPTS = ['Apollo','LinkedIn','Manual','Clearbit','Referral','Inbound'];

function badge(status: string) {
  const map: Record<string,string> = {
    not_contacted:'bg-blue-500/15 text-blue-400',
    in_sequence:'bg-indigo-500/15 text-indigo-400',
    replied:'bg-emerald-500/15 text-emerald-400',
    interested:'bg-purple-500/15 text-purple-400',
    not_interested:'bg-gray-500/15 text-gray-400',
    unsubscribed:'bg-gray-500/15 text-gray-400',
    bounced:'bg-red-500/15 text-red-400',
  };
  return map[status] ?? 'bg-gray-500/15 text-gray-400';
}

export default function Leads() {
  const { contacts, contactOps, toast } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showEnrich, setShowEnrich] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', title:'', accountName:'', outreachStatus:'not_contacted' as typeof STATUS_OPTS[number], source:'Apollo', phone:'' });
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const getName = (c: Contact) => `${c.firstName} ${c.lastName}`;

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const name = getName(c).toLowerCase();
    const matchQ = !search || name.includes(q) || c.email.toLowerCase().includes(q) || c.accountName.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || c.outreachStatus === statusFilter;
    return matchQ && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(c => c.id)));
  };

  const handleAdd = () => {
    if (!form.firstName || !form.email) { toast('error','First name and email required'); return; }
    const now = new Date().toISOString();
    contactOps.add({
      id: crypto.randomUUID(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      title: form.title,
      accountName: form.accountName,
      accountId: '',
      phone: form.phone,
      outreachStatus: form.outreachStatus,
      source: form.source,
      department: '',
      seniority: '',
      emailVerified: false,
      linkedin: '',
      leadScore: 0,
      scoreLabel: 'nurture',
      personaType: '',
      pipelineStage: 'new',
      owner: 'Sarah Miller',
      notes: '',
      lastActivity: now,
      enrichmentStatus: 'not_enriched',
      createdAt: now,
    });
    setShowAdd(false);
    setForm({ firstName:'', lastName:'', email:'', title:'', accountName:'', outreachStatus:'not_contacted', source:'Apollo', phone:'' });
  };

  const handleBulkDelete = () => {
    selected.forEach(id => contactOps.del(id));
    setSelected(new Set());
    toast('success', `Deleted ${selected.size} leads`);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Leads</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>{contacts.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowImport(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background:'var(--surface-2)', color:'var(--text-2)', border:'1px solid var(--border)' }}>
            <Upload size={13}/>Import
          </button>
          <button onClick={()=>setShowEnrich(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background:'rgba(139,92,246,0.12)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.2)' }}>
            <Sparkles size={13}/>Enrich
          </button>
          <button onClick={()=>setShowExport(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background:'var(--surface-2)', color:'var(--text-2)', border:'1px solid var(--border)' }}>
            <Download size={13}/>Export
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background:'#5b6ef9', color:'var(--text)' }}>
            <Plus size={13}/>Add Lead
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)' }} />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Search leads..."
            className="pl-9 pr-3 py-2 text-sm rounded-lg outline-none w-60"
            style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all',...STATUS_OPTS] as string[]).map(s => (
            <button key={s} onClick={()=>{setStatusFilter(s);setPage(1);}}
              className="text-xs px-3 py-1.5 rounded-lg capitalize transition-colors"
              style={{
                background: statusFilter===s?'rgba(91,110,249,0.2)':'var(--surface)',
                color: statusFilter===s?'#5b6ef9':'var(--text-2)',
                border: statusFilter===s?'1px solid rgba(91,110,249,0.3)':'1px solid var(--border)'
              }}>
              {s.replace('_',' ')}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ml-auto"
            style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={12}/>Delete {selected.size}
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.size===paginated.length && paginated.length>0} onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded" />
              </th>
              {['Name','Company','Status','Enriched','Source','Email',''].map(h=>(
                <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider px-4 py-3"
                  style={{ color:'var(--text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <Users size={32} className="mx-auto mb-3" style={{ color:'var(--text-3)' }} />
                  <p className="text-sm font-medium" style={{ color:'var(--text-3)' }}>No leads found</p>
                  <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
                    style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Add your first lead</button>
                </td>
              </tr>
            ) : paginated.map(c => {
              const name = getName(c);
              return (
                <tr key={c.id} className="group transition-colors"
                  style={{ borderBottom:'1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleSelect(c.id)}
                      className="w-3.5 h-3.5 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{name}</p>
                        <p className="text-xs" style={{ color:'var(--text-3)' }}>{c.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} style={{ color:'var(--text-3)' }} />
                      <span className="text-sm" style={{ color:'var(--text-2)' }}>{c.accountName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge(c.outreachStatus)}`}>
                      {c.outreachStatus.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.enrichmentStatus === 'enriched' ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Enriched</span>
                    ) : c.enrichmentStatus === 'pending' ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Pending…</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color:'var(--text-3)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color:'var(--text-2)' }}>{c.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color:'var(--text-2)' }}>{c.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-6 h-6 flex items-center justify-center rounded"
                        style={{ color:'var(--text-2)' }}>
                        <Mail size={12}/>
                      </button>
                      <button onClick={()=>setDeleteId(c.id)} className="w-6 h-6 flex items-center justify-center rounded"
                        style={{ color:'var(--text-2)' }}>
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color:'var(--text-3)' }}>
            Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)}
                className="w-7 h-7 text-xs rounded"
                style={{ background:p===page?'#5b6ef9':'var(--surface-2)', color:p===page?'#fff':'var(--text-2)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Lead" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'First Name *',key:'firstName',placeholder:'Jane'},
              {label:'Last Name',key:'lastName',placeholder:'Smith'},
              {label:'Email *',key:'email',placeholder:'jane@company.com'},
              {label:'Job Title',key:'title',placeholder:'VP of Sales'},
              {label:'Company',key:'accountName',placeholder:'Acme Corp'},
              {label:'Phone',key:'phone',placeholder:'+1 (415) 555-0100'},
            ].map(f=>(
              <div key={f.key}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color:'var(--text-3)' }}>{f.label}</label>
                <input placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-3)' }}>Status</label>
              <select value={form.outreachStatus} onChange={e=>setForm(x=>({...x,outreachStatus:e.target.value as any}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {STATUS_OPTS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-3)' }}>Source</label>
              <select value={form.source} onChange={e=>setForm(x=>({...x,source:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {SOURCE_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'var(--text)' }}>Add Lead</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={()=>setDeleteId(null)}
        onConfirm={()=>{ contactOps.del(deleteId!); setDeleteId(null); }}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmLabel="Delete Lead"
        variant="danger"
      />

      <ExportModal
        open={showExport}
        onClose={()=>setShowExport(false)}
        leads={contacts}
        selectedIds={selected}
        totalCount={contacts.length}
      />

      <EnrichmentModal
        open={showEnrich}
        onClose={()=>setShowEnrich(false)}
        leads={contacts}
        selectedIds={selected}
      />

      <ImportLeadsModal
        open={showImport}
        onClose={()=>setShowImport(false)}
      />
    </div>
  );
}
