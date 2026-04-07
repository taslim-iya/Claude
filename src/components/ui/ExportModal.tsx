import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Modal from './Modal';
import { useApp } from '../../context/AppContext';
import type { Contact } from '../../types';

type Format = 'csv' | 'xlsx' | 'json';

const FIELDS = [
  { key:'name',         label:'Name',            default:true  },
  { key:'email',        label:'Email',           default:true  },
  { key:'title',        label:'Title',           default:true  },
  { key:'company',      label:'Company',         default:true  },
  { key:'phone',        label:'Phone',           default:true  },
  { key:'linkedin',     label:'LinkedIn',        default:false },
  { key:'status',       label:'Status',          default:true  },
  { key:'score',        label:'Lead Score',      default:false },
  { key:'source',       label:'Source',          default:true  },
  { key:'lastActivity', label:'Last Activity',   default:false },
  { key:'enrichment',   label:'Enrichment Data', default:false },
];

interface Props {
  open: boolean;
  onClose(): void;
  leads: Contact[];
  selectedIds: Set<string>;
  totalCount: number;
}

export default function ExportModal({ open, onClose, leads, selectedIds, totalCount }: Props) {
  const { toast } = useApp();
  const [format, setFormat] = useState<Format>('csv');
  const [fields, setFields] = useState<Set<string>>(new Set(FIELDS.filter(f=>f.default).map(f=>f.key)));
  const [exportScope, setExportScope] = useState<'selected'|'all'>('all');
  const [enrichFirst, setEnrichFirst] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enriching, setEnriching] = useState(false);

  const toggleField = (key: string) => setFields(s => { const n=new Set(s); n.has(key)?n.delete(key):n.add(key); return n; });

  const getRows = () => {
    const base = exportScope === 'selected' ? leads.filter(l => selectedIds.has(l.id)) : leads;
    return base.map(c => {
      const row: Record<string,string> = {};
      if (fields.has('name'))        row['Name']         = `${c.firstName} ${c.lastName}`;
      if (fields.has('email'))       row['Email']        = c.email;
      if (fields.has('title'))       row['Title']        = c.title || '';
      if (fields.has('company'))     row['Company']      = c.accountName || '';
      if (fields.has('phone'))       row['Phone']        = c.phone || '';
      if (fields.has('linkedin'))    row['LinkedIn']     = c.linkedin || '';
      if (fields.has('status'))      row['Status']       = c.outreachStatus || '';
      if (fields.has('score'))       row['Lead Score']   = String(c.leadScore || 0);
      if (fields.has('source'))      row['Source']       = c.source || '';
      if (fields.has('lastActivity'))row['Last Activity']= c.lastActivity || '';
      if (fields.has('enrichment'))  row['Enrichment']   = c.enrichmentStatus || '';
      return row;
    });
  };

  const runExport = useCallback(async () => {
    const rows = getRows();
    const count = rows.length;
    const date = new Date().toISOString().slice(0,10);

    if (enrichFirst) {
      setEnriching(true);
      for (let i = 1; i <= count; i++) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 40));
      }
      setEnriching(false);
    }

    const filename = `leads_export_${date}`;

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {});
      const csvLines = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h]||'').replace(/"/g,'""')}"`).join(','))];
      const blob = new Blob([csvLines.join('\n')], { type:'text/csv' });
      downloadBlob(blob, `${filename}.csv`);
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type:'application/json' });
      downloadBlob(blob, `${filename}.json`);
    }

    toast('success', `Exported ${count} leads to ${filename}.${format}`);
    setProgress(0);
    onClose();
  }, [format, fields, exportScope, enrichFirst, leads, selectedIds]);

  function downloadBlob(blob: Blob, name: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const exportCount = exportScope === 'selected' ? selectedIds.size || totalCount : totalCount;

  return (
    <Modal open={open} onClose={onClose} title="Export Leads" size="md">
      <div className="space-y-5">
        {/* Format */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>Export Format</label>
          <div className="flex gap-2">
            {(['csv','xlsx','json'] as Format[]).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="flex-1 py-2.5 text-sm rounded-xl font-semibold uppercase transition-all"
                style={{ background:format===f?'rgba(91,110,249,0.15)':'var(--surface-2)', color:format===f?'#5b6ef9':'var(--text-2)', border:format===f?'1px solid rgba(91,110,249,0.35)':'1px solid var(--border)' }}>
                {f === 'csv' ? '📄 CSV' : f === 'xlsx' ? '📊 Excel' : '{ } JSON'}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>Export Scope</label>
          <div className="flex gap-2">
            {(['all','selected'] as const).map(s => (
              <button key={s} onClick={() => setExportScope(s)}
                className="flex-1 py-2 text-sm rounded-lg transition-all"
                style={{ background:exportScope===s?'var(--accent-dim)':'var(--surface-2)', color:exportScope===s?'#5b6ef9':'var(--text-2)', border:exportScope===s?'1px solid rgba(91,110,249,0.3)':'1px solid var(--border)' }}>
                {s === 'all' ? `All leads (${totalCount})` : `Selected (${selectedIds.size || 'none'})`}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>Fields to Include</label>
          <div className="grid grid-cols-2 gap-1.5">
            {FIELDS.map(f => (
              <label key={f.key} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors"
                style={{ background:fields.has(f.key)?'var(--accent-dim)':'var(--surface-2)', border:`1px solid ${fields.has(f.key)?'rgba(91,110,249,0.3)':'var(--border)'}` }}>
                <input type="checkbox" checked={fields.has(f.key)} onChange={()=>toggleField(f.key)} className="w-3.5 h-3.5 rounded accent-indigo-500" />
                <span className="text-xs" style={{ color:'var(--text)' }}>{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Enrich toggle */}
        <div className="p-3 rounded-xl flex items-start gap-3" style={{ background:'var(--surface-2)', border:'1px solid var(--border)' }}>
          <input type="checkbox" id="enrich" checked={enrichFirst} onChange={e=>setEnrichFirst(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-indigo-500" />
          <div>
            <label htmlFor="enrich" className="text-sm font-medium cursor-pointer" style={{ color:'var(--text)' }}>Enrich before export</label>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>Runs enrichment on all selected leads before downloading. May take a moment.</p>
          </div>
        </div>

        {/* Progress */}
        {enriching && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color:'var(--text-2)' }}>Enriching {progress}/{exportCount} leads...</span>
              <span className="text-xs font-semibold" style={{ color:'#5b6ef9' }}>{Math.round((progress/exportCount)*100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--border-2)' }}>
              <div className="h-full rounded-full transition-all" style={{ width:`${(progress/exportCount)*100}%`, background:'#5b6ef9' }} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary text-xs">Cancel</button>
          <button onClick={runExport} disabled={enriching} className="btn-primary text-xs">
            Export {exportCount} leads as .{format}
          </button>
        </div>
      </div>
    </Modal>
  );
}
