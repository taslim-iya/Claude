import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, Mail, Phone, Building2, UserCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Contact } from '../types';

function badge(status: string) {
  const map: Record<string,string> = {
    not_contacted:'bg-blue-500/15 text-blue-400',
    in_sequence:'bg-indigo-500/15 text-indigo-400',
    replied:'bg-emerald-500/15 text-emerald-400',
    interested:'bg-purple-500/15 text-purple-400',
    not_interested:'bg-gray-500/15 text-gray-400',
    bounced:'bg-red-500/15 text-red-400',
  };
  return map[status] ?? 'bg-gray-500/15 text-gray-400';
}

const getName = (c: Contact) => `${c.firstName} ${c.lastName}`;

export default function Contacts() {
  const { contacts, contactOps, accounts, toast } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', title:'', accountName:'', phone:'', source:'Manual' });

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const name = getName(c).toLowerCase();
    return !search || name.includes(q) || c.email.toLowerCase().includes(q) || c.accountName.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q);
  });

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
            <input value={search} onChange={e=>setSearch(e.target.value)}
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

      <div className="grid grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-20">
            <UserCircle size={36} className="mx-auto mb-3" style={{ color:'var(--border-2)' }} />
            <p className="text-sm" style={{ color:'var(--text-3)' }}>No contacts found</p>
            <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
              style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Add first contact</button>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="rounded-xl p-4 group transition-all hover:shadow-glass"
            style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color:'var(--text)' }}>{getName(c)}</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--text-2)' }}>{c.title}</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button onClick={()=>setDeleteId(c.id)} className="w-6 h-6 flex items-center justify-center rounded"
                  style={{ color:'var(--text-3)' }}><Trash2 size={11}/></button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge(c.outreachStatus)}`}>
                {c.outreachStatus.replace('_',' ')}
              </span>
            </div>
            <div className="space-y-1.5 pt-2" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Building2 size={11} style={{ color:'var(--text-3)' }} />
                <span className="text-xs" style={{ color:'var(--text-2)' }}>{c.accountName || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={11} style={{ color:'var(--text-3)' }} />
                <span className="text-xs truncate" style={{ color:'var(--text-2)' }}>{c.email}</span>
              </div>
              {c.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={11} style={{ color:'var(--text-3)' }} />
                  <span className="text-xs" style={{ color:'var(--text-2)' }}>{c.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}
