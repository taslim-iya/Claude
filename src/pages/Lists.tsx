import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, List, Users, Calendar } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Lists() {
  const { lists, listOps, toast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', description:'', type:'static' as 'static'|'dynamic' });

  const handleAdd = () => {
    if (!form.name) { toast('error','List name required'); return; }
    const now = new Date().toISOString();
    listOps.add({
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description,
      type: form.type,
      contactCount: 0,
      owner: 'Sarah Miller',
      tags: [],
      createdAt: now,
      lastUpdated: now,
    });
    setShowAdd(false);
    setForm({ name:'', description:'', type:'static' });
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Prospect Lists</h1>
          <p className="text-sm mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>{lists.length} lists</p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background:'#5b6ef9', color:'#fff' }}>
          <Plus size={13}/>New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-24">
          <List size={36} className="mx-auto mb-3" style={{ color:'rgba(255,255,255,0.1)' }} />
          <p className="text-sm" style={{ color:'rgba(255,255,255,0.3)' }}>No lists yet</p>
          <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
            style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Create your first list</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {lists.map(l => (
            <div key={l.id} className="rounded-xl p-5 group transition-all hover:shadow-glass"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:'rgba(91,110,249,0.12)' }}>
                  <List size={16} style={{ color:'#5b6ef9' }} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>setDeleteId(l.id)} className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ color:'rgba(255,255,255,0.3)' }}><Trash2 size={11}/></button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{l.name}</h3>
              {l.description && <p className="text-xs mb-3" style={{ color:'rgba(255,255,255,0.4)' }}>{l.description}</p>}
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: l.type==='dynamic'?'rgba(16,185,129,0.12)':'rgba(91,110,249,0.12)',
                    color: l.type==='dynamic'?'#10b981':'#5b6ef9'
                  }}>
                  {l.type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-1.5">
                  <Users size={11} style={{ color:'rgba(255,255,255,0.3)' }} />
                  <span className="text-xs" style={{ color:'rgba(255,255,255,0.45)' }}>{l.contactCount} contacts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} style={{ color:'rgba(255,255,255,0.3)' }} />
                  <span className="text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>
                    {new Date(l.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="New List" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'rgba(255,255,255,0.4)' }}>List Name *</label>
            <input placeholder="Q2 SaaS Prospects" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'rgba(255,255,255,0.4)' }}>Description</label>
            <input placeholder="Optional description" value={form.description} onChange={e=>setForm(x=>({...x,description:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'rgba(255,255,255,0.4)' }}>Type</label>
            <div className="flex gap-2">
              {(['static','dynamic'] as const).map(t=>(
                <button key={t} onClick={()=>setForm(x=>({...x,type:t}))}
                  className="flex-1 py-2 text-sm rounded-lg capitalize"
                  style={{
                    background:form.type===t?'rgba(91,110,249,0.2)':'rgba(255,255,255,0.04)',
                    color:form.type===t?'#5b6ef9':'rgba(255,255,255,0.5)',
                    border:form.type===t?'1px solid rgba(91,110,249,0.3)':'1px solid rgba(255,255,255,0.06)'
                  }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'#fff' }}>Create List</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={()=>setDeleteId(null)}
        onConfirm={()=>{ listOps.del(deleteId!); setDeleteId(null); }}
        title="Delete List"
        message="Are you sure you want to delete this list?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
