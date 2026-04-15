import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, UserCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LeadDetailPanel from '../components/LeadDetailPanel';
import type { Contact } from '../types';

const PER_PAGE = 20;

const STATUS_OPTS = [
  { value:'not_contacted', label:'Not Contacted' },
  { value:'in_sequence', label:'In Sequence' },
  { value:'replied', label:'Replied' },
  { value:'interested', label:'Interested' },
  { value:'not_interested', label:'Not Interested' },
  { value:'unsubscribed', label:'Unsubscribed' },
  { value:'bounced', label:'Bounced' },
];

function badge(status: string) {
  const map: Record<string,string> = {
    not_contacted:'bg-blue-500/15 text-blue-400',
    in_sequence:'bg-indigo-500/15 text-indigo-400',
    replied:'bg-emerald-500/15 text-emerald-400',
    interested:'bg-purple-500/15 text-purple-400',
    not_interested:'bg-gray-500/15 text-gray-400',
    unsubscribed:'bg-orange-500/15 text-orange-400',
    bounced:'bg-red-500/15 text-red-400',
  };
  return map[status] ?? 'bg-gray-500/15 text-gray-400';
}

const getName = (c: Contact) => `${c.firstName} ${c.lastName}`;

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

export default function Contacts() {
  const { contacts, contactOps, accounts, toast } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact|null>(null);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', title:'', accountName:'', phone:'', source:'Manual' });

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || getName(c).toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.accountName.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.outreachStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PER_PAGE;
  const pageEnd = Math.min(pageStart + PER_PAGE, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const toggleAll = () => {
    if (pageRows.every(c => selected.has(c.id))) {
      const next = new Set(selected);
      pageRows.forEach(c => next.delete(c.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      pageRows.forEach(c => next.add(c.id));
      setSelected(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleAdd = () => {
    if (!form.firstName || !form.email) { toast('error','First name and email required'); return; }
    const now = new Date().toISOString();
    contactOps.add({
      id: crypto.randomUUID(),
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, title: form.title,
      accountName: form.accountName, accountId: '',
      phone: form.phone, source: form.source,
      department: '', seniority: '', emailVerified: false, linkedin: '',
      leadScore: 0, scoreLabel: 'nurture', personaType: '',
      outreachStatus: 'not_contacted', pipelineStage: 'new',
      owner: 'Sarah Miller', notes: '', lastActivity: now,
      enrichmentStatus: 'not_enriched', createdAt: now,
    });
    setShowAdd(false);
    setForm({ firstName:'', lastName:'', email:'', title:'', accountName:'', phone:'', source:'Manual' });
  };

  const allPageSelected = pageRows.length > 0 && pageRows.every(c => selected.has(c.id));

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Contacts</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>{contacts.length} contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)' }} />
            <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
              placeholder="Search contacts..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg outline-none w-56"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
          </div>
          <button onClick={()=>setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background:'#5b6ef9', color:'var(--text)' }}>
            <Plus size={13}/>Add Contact
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={()=>{ setStatusFilter(''); setPage(1); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: statusFilter==='' ? '#5b6ef9' : 'var(--surface-2)', color: statusFilter==='' ? '#fff' : 'var(--text-2)', border:'1px solid var(--border)' }}>
          All
        </button>
        {STATUS_OPTS.map(opt => (
          <button
            key={opt.value}
            onClick={()=>{ setStatusFilter(opt.value); setPage(1); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: statusFilter===opt.value ? '#5b6ef9' : 'var(--surface-2)', color: statusFilter===opt.value ? '#fff' : 'var(--text-2)', border:'1px solid var(--border)' }}>
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <UserCircle size={36} className="mx-auto mb-3" style={{ color:'var(--border-2)' }} />
          <p className="text-sm" style={{ color:'var(--text-3)' }}>No contacts found</p>
          <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
            style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Add first contact</button>
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-x-auto" style={{ border:'1px solid var(--border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" className="w-3.5 h-3.5" checked={allPageSelected} onChange={toggleAll} />
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Name</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Company</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Status</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Email</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Phone</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Source</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Last Activity</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(c => (
                  <tr
                    key={c.id}
                    className="group transition-colors"
                    style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--surface-2)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-3.5 h-3.5" checked={selected.has(c.id)} onChange={()=>toggleSelect(c.id)} />
                    </td>
                    <td className="px-4 py-3" onClick={()=>setSelectedContact(c)} style={{ cursor:'pointer' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                          style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>
                          {c.firstName[0]}{c.lastName?.[0] ?? ''}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold leading-tight" style={{ color:'var(--text)' }}>{getName(c)}</p>
                          {c.title && <p className="text-xs" style={{ color:'var(--text-3)' }}>{c.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{c.accountName || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge(c.outreachStatus)}`}>
                        {c.outreachStatus.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{c.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{c.phone || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{c.source || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{c.lastActivity ? relativeTime(c.lastActivity) : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={()=>setDeleteId(c.id)}
                          className="w-7 h-7 flex items-center justify-center rounded"
                          style={{ color:'var(--text-3)' }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-[13px]" style={{ color:'var(--text-3)' }}>
              Showing {pageStart + 1}–{pageEnd} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={()=>setPage(p)}
                  className="w-7 h-7 flex items-center justify-center text-xs rounded"
                  style={{
                    background: p === safePage ? '#5b6ef9' : 'var(--surface-2)',
                    color: p === safePage ? '#fff' : 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Contact" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'First Name *',key:'firstName',placeholder:'Jane'},
              {label:'Last Name',key:'lastName',placeholder:'Smith'},
              {label:'Email *',key:'email',placeholder:'jane@company.com'},
              {label:'Job Title',key:'title',placeholder:'VP of Sales'},
              {label:'Phone',key:'phone',placeholder:'+1 (415) 555-0100'},
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
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'var(--text-2)' }}>Company</label>
              <select value={form.accountName} onChange={e=>setForm(x=>({...x,accountName:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                <option value="">Select company</option>
                {accounts.map(a=><option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'var(--text)' }}>Add Contact</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={()=>setDeleteId(null)}
        onConfirm={()=>{ contactOps.del(deleteId!); setDeleteId(null); }}
        title="Delete Contact"
        message="Are you sure you want to delete this contact?"
        confirmLabel="Delete"
        variant="danger"
      />

      <LeadDetailPanel contact={selectedContact} onClose={()=>setSelectedContact(null)} />
    </div>
  );
}
