import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, DollarSign, Building2, Calendar } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { PipelineStage } from '../types';

const STAGES: PipelineStage[] = ['new','contacted','replied','interested','meeting_booked','proposal_sent','opportunity','won','lost'];

const stageColors: Record<string,string> = {
  new:'#6b7280', contacted:'#5b6ef9', replied:'#8b5cf6',
  interested:'#f59e0b', meeting_booked:'#ec4899', proposal_sent:'#ef4444',
  opportunity:'#10b981', won:'#10b981', lost:'#6b7280',
};

const stageLabels: Record<string,string> = {
  new:'New', contacted:'Contacted', replied:'Replied',
  interested:'Interested', meeting_booked:'Meeting Booked', proposal_sent:'Proposal Sent',
  opportunity:'Opportunity', won:'Won', lost:'Lost',
};

// Show fewer stages for the kanban (most important ones)
const KANBAN_STAGES: PipelineStage[] = ['new','contacted','interested','meeting_booked','proposal_sent','won'];

export default function Pipeline() {
  const { opportunities, opportunityOps, toast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [dragId, setDragId] = useState<string|null>(null);
  const [dragOverStage, setDragOverStage] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', accountName:'', contactName:'', value:0, stage:'new' as PipelineStage, closeDate:'', notes:'' });

  const byStage = (stage: PipelineStage) => opportunities.filter(o => o.stage === stage);

  const totalValue = opportunities
    .filter(o => o.stage !== 'lost')
    .reduce((a,o) => a+(o.value||0), 0);

  const wonValue = opportunities
    .filter(o => o.stage === 'won')
    .reduce((a,o) => a+(o.value||0), 0);

  const handleAdd = () => {
    if (!form.name || !form.accountName) { toast('error','Deal name and company required'); return; }
    const now = new Date().toISOString();
    opportunityOps.add({
      id: crypto.randomUUID(),
      name: form.name,
      accountId: '', accountName: form.accountName,
      contactId: '', contactName: form.contactName,
      stage: form.stage,
      value: form.value,
      owner: 'Sarah Miller',
      createdAt: now, updatedAt: now,
      closeDate: form.closeDate,
      probability: form.stage === 'won' ? 100 : 30,
      notes: form.notes,
      source: 'Outbound',
    });
    setShowAdd(false);
    setForm({ name:'', accountName:'', contactName:'', value:0, stage:'new', closeDate:'', notes:'' });
  };

  const handleDrop = (stage: PipelineStage) => {
    if (!dragId) return;
    opportunityOps.update(dragId, { stage, updatedAt: new Date().toISOString() });
    setDragId(null);
    setDragOverStage(null);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>Pipeline</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>
            ${(totalValue/1000).toFixed(0)}k total · ${(wonValue/1000).toFixed(0)}k won
          </p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background:'#5b6ef9', color:'#fff' }}>
          <Plus size={13}/>Add Deal
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_STAGES.map(stage => {
          const deals = byStage(stage);
          const stageValue = deals.reduce((a,d)=>a+(d.value||0),0);
          const color = stageColors[stage];
          return (
            <div key={stage}
              className="flex-shrink-0 rounded-xl p-3"
              style={{
                width:220, background:'var(--surface)', border:'1px solid var(--surface-2)',
                outline: dragOverStage===stage ? '2px dashed #5b6ef9' : 'none',
                outlineOffset: -2,
                borderRadius: 12,
                transition: 'outline 150ms ease',
              }}
              onDragOver={e=>{e.preventDefault();setDragOverStage(stage);}}
              onDrop={()=>handleDrop(stage)}
              onDragLeave={()=>setDragOverStage(null)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background:color }} />
                  <span className="text-xs font-semibold" style={{ color:"var(--text)" }}>{stageLabels[stage]}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>
                  {deals.length}
                </span>
              </div>
              {stageValue > 0 && (
                <p className="text-[10px] mb-2" style={{ color:'var(--text-3)' }}>
                  ${stageValue.toLocaleString()}
                </p>
              )}
              <div className="space-y-2">
                {deals.map(d => (
                  <div key={d.id}
                    draggable
                    onDragStart={()=>setDragId(d.id)}
                    onDragEnd={()=>{setDragId(null);setDragOverStage(null);}}
                    className="rounded-lg p-3 cursor-grab active:cursor-grabbing group"
                    style={{ background:'var(--surface)', border:'1px solid var(--border)', opacity:dragId===d.id?0.5:1 }}>
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold  leading-tight flex-1" style={{ color:"var(--text)" }}>{d.name}</p>
                      <button onClick={()=>setDeleteId(d.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                        style={{ color:'var(--text-3)' }}>
                        <Trash2 size={10}/>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Building2 size={10} style={{ color:'var(--text-3)' }} />
                      <span className="text-[10px] truncate" style={{ color:'var(--text-2)' }}>{d.accountName}</span>
                    </div>
                    {d.value > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <DollarSign size={10} style={{ color }} />
                        <span className="text-[10px] font-semibold" style={{ color }}>${d.value.toLocaleString()}</span>
                      </div>
                    )}
                    {d.closeDate && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar size={10} style={{ color:'var(--text-3)' }} />
                        <span className="text-[10px]" style={{ color:'var(--text-3)' }}>{d.closeDate}</span>
                      </div>
                    )}
                  </div>
                ))}
                {deals.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-[10px]" style={{ color:'var(--text-3)' }}>Drop deals here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Deal" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:'var(--text-3)' }}>Deal Name *</label>
              <input placeholder="Q2 Enterprise Deal" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:'var(--text-3)' }}>Company *</label>
              <input placeholder="Acme Corp" value={form.accountName} onChange={e=>setForm(x=>({...x,accountName:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:'var(--text-3)' }}>Value ($)</label>
              <input type="number" placeholder="10000" value={form.value||''} onChange={e=>setForm(x=>({...x,value:Number(e.target.value)}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:'var(--text-3)' }}>Close Date</label>
              <input type="date" value={form.closeDate} onChange={e=>setForm(x=>({...x,closeDate:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:'var(--text-3)' }}>Stage</label>
              <select value={form.stage} onChange={e=>setForm(x=>({...x,stage:e.target.value as PipelineStage}))}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
                {KANBAN_STAGES.map(s=><option key={s} value={s}>{stageLabels[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'#fff' }}>Add Deal</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={()=>setDeleteId(null)}
        onConfirm={()=>{ opportunityOps.del(deleteId!); setDeleteId(null); }}
        title="Delete Deal"
        message="Are you sure you want to delete this deal?"
        confirmLabel="Delete Deal"
        variant="danger"
      />
    </div>
  );
}
