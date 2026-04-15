import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, List, Search, MoreHorizontal } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const PER_PAGE = 20;

export default function Lists() {
  const { lists, listOps, toast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', description:'', type:'static' as 'static'|'dynamic' });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string|null>(null);
  const [menuId, setMenuId] = useState<string|null>(null);
  const [selectedList, setSelectedList] = useState<typeof lists[0]|null>(null);

  const handleAdd = () => {
    if (!form.name) { toast('error','List name required'); return; }
    const now = new Date().toISOString();
    listOps.add({
      id: crypto.randomUUID(), name: form.name, description: form.description,
      type: form.type, contactCount: 0, owner: 'Sarah Miller',
      tags: [], createdAt: now, lastUpdated: now,
    });
    setShowAdd(false);
    setForm({ name:'', description:'', type:'static' });
  };

  const filtered = lists.filter(l => {
    const q = search.toLowerCase();
    return !search || l.name.toLowerCase().includes(q) || (l.description||'').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const allChecked = paginated.length > 0 && paginated.every(l => selected.has(l.id));
  const toggleAll = () => {
    if (allChecked) {
      setSelected(s => { const n = new Set(s); paginated.forEach(l => n.delete(l.id)); return n; });
    } else {
      setSelected(s => { const n = new Set(s); paginated.forEach(l => n.add(l.id)); return n; });
    }
  };
  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const start = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const end = Math.min(safePage * PER_PAGE, filtered.length);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:'var(--text)' }}>Prospect Lists</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>{lists.length} lists</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)' }} />
            <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
              placeholder="Search lists..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg outline-none w-48"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)' }} />
          </div>
          <button onClick={()=>setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background:'#5b6ef9', color:'var(--text)' }}>
            <Plus size={13}/>New List
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ border:'1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="w-3.5 h-3.5 rounded" checked={allChecked} onChange={toggleAll} />
              </th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>List Name</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Description</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Contacts</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Last Updated</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color:'var(--text-3)' }}>Created By</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <List size={32} className="mx-auto mb-3" style={{ color:'var(--border-2)' }} />
                  <p className="text-sm" style={{ color:'var(--text-3)' }}>
                    {search ? 'No lists match your search' : 'No lists yet'}
                  </p>
                  {!search && (
                    <button onClick={()=>setShowAdd(true)} className="mt-3 text-xs px-4 py-2 rounded-lg"
                      style={{ background:'rgba(91,110,249,0.15)', color:'#5b6ef9' }}>Create your first list</button>
                  )}
                </td>
              </tr>
            ) : paginated.map(l => (
              <tr key={l.id} className="group transition-colors"
                style={{ borderBottom:'1px solid var(--border)', background: hoveredId===l.id ? 'var(--surface-2)' : 'transparent' }}
                onMouseEnter={()=>setHoveredId(l.id)}
                onMouseLeave={()=>setHoveredId(null)}>
                <td className="w-10 px-4 py-3">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded" checked={selected.has(l.id)} onChange={()=>toggleSelect(l.id)} />
                </td>
                <td className="px-4 py-3" onClick={()=>setSelectedList(l)} style={{ cursor:'pointer' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color:'var(--text)' }}>{l.name}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: l.type==='dynamic' ? 'rgba(16,185,129,0.12)' : 'rgba(91,110,249,0.12)',
                        color: l.type==='dynamic' ? '#10b981' : '#5b6ef9'
                      }}>{l.type}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color:'var(--text-2)' }}>
                    {l.description ? (l.description.length > 40 ? l.description.slice(0, 40) + '…' : l.description) : <span style={{ color:'var(--text-3)' }}>—</span>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{l.contactCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color:'var(--text-2)' }}>
                    {new Date(l.lastUpdated).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color:'var(--text-2)' }}>{l.owner}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e=>{ e.stopPropagation(); setMenuId(menuId===l.id?null:l.id); }}
                      style={{ color:'var(--text-2)', background:'transparent', border:'none', cursor:'pointer', padding:4 }}>
                      <MoreHorizontal size={14}/>
                    </button>
                    {menuId===l.id && (
                      <div style={{ position:'absolute', right:0, top:'100%', zIndex:20, width:140, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', overflow:'hidden' }}>
                        {[
                          { label:'Edit', action:()=>{ setMenuId(null); toast('info','Edit coming soon'); } },
                          { label:'Duplicate', action:()=>{ setMenuId(null); listOps.add({...l, id:crypto.randomUUID(), name:l.name+' (copy)', createdAt:new Date().toISOString(), lastUpdated:new Date().toISOString()}); toast('success','List duplicated'); } },
                          { label:'Export', action:()=>{ setMenuId(null); toast('success','Export started'); } },
                          { label:'Delete', action:()=>{ setMenuId(null); listOps.del(l.id); toast('success','List deleted'); } },
                        ].map(item=>(
                          <button key={item.label} onClick={item.action}
                            style={{ display:'block', width:'100%', padding:'8px 12px', textAlign:'left', fontSize:13, color:item.label==='Delete'?'#ef4444':'var(--text)', background:'transparent', border:'none', cursor:'pointer' }}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--surface-2)'}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color:'var(--text-3)' }}>
            Showing {start}–{end} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={()=>setPage(p)}
                className="w-7 h-7 flex items-center justify-center rounded text-xs font-medium"
                style={{
                  background: p === safePage ? 'rgba(91,110,249,0.2)' : 'transparent',
                  color: p === safePage ? '#5b6ef9' : 'var(--text-2)',
                  border: p === safePage ? '1px solid rgba(91,110,249,0.3)' : '1px solid transparent',
                }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="New List" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>List Name *</label>
            <input placeholder="Q2 SaaS Prospects" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Description</label>
            <input placeholder="Optional description" value={form.description} onChange={e=>setForm(x=>({...x,description:e.target.value}))}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Type</label>
            <div className="flex gap-2">
              {(['static','dynamic'] as const).map(t=>(
                <button key={t} onClick={()=>setForm(x=>({...x,type:t}))}
                  className="flex-1 py-2 text-sm rounded-lg capitalize"
                  style={{
                    background:form.type===t?'rgba(91,110,249,0.2)':'var(--surface)',
                    color:form.type===t?'#5b6ef9':'var(--text-2)',
                    border:form.type===t?'1px solid rgba(91,110,249,0.3)':'1px solid var(--border)'
                  }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'var(--text)' }}>Create List</button>
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

      {selectedList && (
        <>
          <div onClick={()=>setSelectedList(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:39 }}/>
          <div style={{ position:'fixed', right:0, top:0, height:'100%', width:440, zIndex:40, background:'var(--surface)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', boxShadow:'-8px 0 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{selectedList.name}</p>
                <p style={{ fontSize:12, color:'var(--text-2)' }}>{selectedList.type} list · {selectedList.contactCount} contacts</p>
              </div>
              <button onClick={()=>setSelectedList(null)} style={{ color:'var(--text-3)', background:'transparent', border:'none', cursor:'pointer' }}>
                ✕
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
              <p style={{ fontSize:13, color:'var(--text-3)', textAlign:'center', marginTop:40 }}>No contacts in this list yet. Add contacts from the Leads or Contacts page.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
