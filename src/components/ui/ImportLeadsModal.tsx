import { useState, useRef, useCallback } from 'react';
import Modal from './Modal';
import { useApp } from '../../context/AppContext';
import { Upload, ChevronRight, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type Step = 1 | 2 | 3 | 4;

const PIQ_FIELDS = [
  { key:'firstName', label:'First Name' }, { key:'lastName',  label:'Last Name' },
  { key:'email',     label:'Email' },      { key:'title',     label:'Job Title' },
  { key:'accountName',label:'Company' },   { key:'phone',     label:'Phone' },
  { key:'linkedin',  label:'LinkedIn' },   { key:'source',    label:'Source' },
  { key:'skip',      label:'— Skip this field —' },
];

// Fuzzy match a column name to a PIQ field
function matchField(col: string): string {
  const c = col.toLowerCase().replace(/[\s_\-\.]/g,'');
  if (/^(firstname|first|fname|givenname)$/.test(c))         return 'firstName';
  if (/^(lastname|last|lname|surname|familyname)$/.test(c))  return 'lastName';
  if (/^(fullname|name|contactname|person)$/.test(c))        return 'firstName'; // will split
  if (/^(email|emailaddress|workemail|mail|e[-]?mail)$/.test(c)) return 'email';
  if (/^(jobtitle|title|position|role|occupation)$/.test(c)) return 'title';
  if (/^(company|organization|org|bizname|employer|account)$/.test(c)) return 'accountName';
  if (/^(phone|mobile|tel|telephone|cell|bizphone|workphone)$/.test(c)) return 'phone';
  if (/^(linkedin|linkedinurl|linkedinprofile)$/.test(c))    return 'linkedin';
  if (/^(source|leadsource|origin)$/.test(c))               return 'source';
  return 'skip';
}

function confidence(col: string, mapped: string): 'high' | 'medium' | 'low' {
  if (mapped === 'skip') return 'low';
  const c = col.toLowerCase().replace(/[\s_\-\.]/g,'');
  const exact = ['email','phone','title','company','firstname','lastname','linkedin','source'];
  if (exact.some(e => c === e)) return 'high';
  return 'medium';
}

interface Props { open: boolean; onClose(): void; }

export default function ImportLeadsModal({ open, onClose }: Props) {
  const { contactOps, toast } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string,string>[]>([]);
  const [mapping, setMapping] = useState<Record<string,string>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ imported:0, dupes:0, errors:0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (res) => {
          const hdrs = res.meta.fields || [];
          setHeaders(hdrs);
          setRows(res.data as Record<string,string>[]);
          const autoMap: Record<string,string> = {};
          hdrs.forEach(h => { autoMap[h] = matchField(h); });
          setMapping(autoMap);
          setStep(2);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type:'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string,string>>(ws, { defval:'' });
        if (!json.length) return;
        const hdrs = Object.keys(json[0]);
        setHeaders(hdrs);
        setRows(json);
        const autoMap: Record<string,string> = {};
        hdrs.forEach(h => { autoMap[h] = matchField(String(h)); });
        setMapping(autoMap);
        setStep(2);
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const doImport = async () => {
    setImporting(true);
    const total = rows.length;
    let imported = 0, dupes = 0, errors = 0;
    for (let i = 0; i < total; i++) {
      setImportProgress(i + 1);
      await new Promise(r => setTimeout(r, 8));
      try {
        const row = rows[i];
        const getField = (key: string) => {
          const col = Object.entries(mapping).find(([,v]) => v === key)?.[0];
          return col ? (row[col] || '') : '';
        };
        const email = getField('email');
        if (!email) { errors++; continue; }
        // Check for name field — could be "Full Name" mapped to firstName
        let firstName = getField('firstName');
        let lastName  = getField('lastName');
        if (firstName && firstName.includes(' ') && !lastName) {
          const parts = firstName.split(' ');
          firstName = parts[0]; lastName = parts.slice(1).join(' ');
        }
        const now = new Date().toISOString();
        contactOps.add({
          id: crypto.randomUUID(),
          firstName: firstName || email.split('@')[0],
          lastName,
          email,
          title: getField('title'),
          accountName: getField('accountName'),
          accountId: '',
          phone: getField('phone'),
          linkedin: getField('linkedin'),
          source: getField('source') || 'CSV Import',
          department: '', seniority: '', emailVerified: false,
          leadScore: 0, scoreLabel: 'nurture', personaType: '',
          outreachStatus: 'not_contacted', pipelineStage: 'new',
          owner: 'Sarah Miller', notes: '', lastActivity: now,
          enrichmentStatus: 'not_enriched', createdAt: now,
        });
        imported++;
      } catch { errors++; }
    }
    setImportResults({ imported, dupes, errors });
    setImporting(false);
    setStep(4);
  };

  const reset = () => { setStep(1); setFileName(''); setHeaders([]); setRows([]); setMapping({}); setImportProgress(0); };

  const confColor = (c: 'high'|'medium'|'low') => c==='high'?'#10b981':c==='medium'?'#f59e0b':'var(--text-3)';

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={`Import Leads — Step ${step} of 4`} size="xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(['Upload','Map Fields','Preview','Done'] as const).map((label, i) => {
          const n = i + 1;
          const active = step === n; const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background:done?'#10b981':active?'#5b6ef9':'var(--surface-2)', color:done||active?'#fff':'var(--text-3)' }}>
                  {done ? <CheckCircle size={12}/> : n}
                </div>
                <span className="text-xs font-medium" style={{ color:active?'var(--text)':'var(--text-3)' }}>{label}</span>
              </div>
              {i < 3 && <ChevronRight size={12} style={{ color:'var(--text-3)' }} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${dragging?'drag-over':''}`}
          style={{ borderColor:'var(--border-2)' }}
          onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
          onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'var(--accent-dim)' }}>
            <Upload size={24} style={{ color:'#5b6ef9' }} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color:'var(--text)' }}>Drop your file here, or click to browse</p>
          <p className="text-sm" style={{ color:'var(--text-3)' }}>Supports .csv, .xlsx, .xls — up to 10,000 rows</p>
        </div>
      )}

      {/* Step 2: Map fields */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color:'var(--text-2)' }}>
              <FileText size={13} className="inline mr-1"/><strong style={{ color:'var(--text)' }}>{fileName}</strong> — {rows.length} rows, {headers.length} columns
            </p>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)' }}>
            <div className="grid grid-cols-4 gap-0 px-4 py-2" style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
              {['Your Column','Sample Data','ProspectIQ Field','Confidence'].map(h => (
                <p key={h} className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'var(--text-3)' }}>{h}</p>
              ))}
            </div>
            <div style={{ maxHeight:300, overflowY:'auto' }}>
              {headers.map(h => {
                const sample = rows[0]?.[h] || '—';
                const mapped = mapping[h] || 'skip';
                const conf = confidence(h, mapped);
                return (
                  <div key={h} className="grid grid-cols-4 gap-0 px-4 py-2.5 items-center" style={{ borderBottom:'1px solid var(--border)' }}>
                    <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{h}</p>
                    <p className="text-xs font-mono truncate pr-4" style={{ color:'var(--text-3)' }}>{sample}</p>
                    <select value={mapped} onChange={e=>setMapping(m=>({...m,[h]:e.target.value}))}
                      className="input-field text-xs" style={{ padding:'0.25rem 0.5rem', marginRight:'0.5rem' }}>
                      {PIQ_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                    <span className="text-[10px] font-semibold" style={{ color:confColor(conf) }}>
                      {conf === 'high' ? '✓ High' : conf === 'medium' ? '~ Medium' : '? Low'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-xs" onClick={reset}>Back</button>
            <button className="btn-primary text-xs" onClick={() => setStep(3)}>
              Preview Import <ChevronRight size={12}/>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color:'var(--text-2)' }}>Preview of first 5 rows with your field mapping:</p>
          <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {PIQ_FIELDS.filter(f => f.key !== 'skip' && Object.values(mapping).includes(f.key)).map(f => (
                      <th key={f.key} className="th">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0,5).map((row, i) => (
                    <tr key={i} className="tr">
                      {PIQ_FIELDS.filter(f => f.key !== 'skip' && Object.values(mapping).includes(f.key)).map(f => {
                        const col = Object.entries(mapping).find(([,v]) => v === f.key)?.[0];
                        return <td key={f.key} className="td text-xs">{col ? row[col] || '—' : '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-center gap-3" style={{ background:'var(--accent-dim)', border:'1px solid rgba(91,110,249,0.2)' }}>
            <CheckCircle size={14} style={{ color:'#5b6ef9' }}/>
            <p className="text-sm" style={{ color:'var(--text)' }}>Ready to import <strong>{rows.length}</strong> leads</p>
          </div>
          {importing && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color:'var(--text-2)' }}>Importing {importProgress}/{rows.length} leads...</span>
                <span className="text-xs font-semibold" style={{ color:'#5b6ef9' }}>{Math.round((importProgress/rows.length)*100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--border-2)' }}>
                <div className="h-full rounded-full transition-all" style={{ width:`${(importProgress/rows.length)*100}%`, background:'linear-gradient(90deg,#5b6ef9,#8b5cf6)' }} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-xs" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary text-xs" onClick={doImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${rows.length} Leads`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background:'rgba(16,185,129,0.12)' }}>
            <CheckCircle size={28} style={{ color:'#10b981' }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color:'var(--text)' }}>Import Complete!</p>
            <p className="text-sm mt-1" style={{ color:'var(--text-2)' }}>
              Imported {importResults.imported} leads{importResults.dupes>0?`, ${importResults.dupes} duplicates skipped`:''}{importResults.errors>0?`, ${importResults.errors} errors`:''}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {[
              {label:'Imported', val:importResults.imported, color:'#10b981'},
              {label:'Duplicates', val:importResults.dupes, color:'#f59e0b'},
              {label:'Errors', val:importResults.errors, color:'#ef4444'},
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl" style={{ background:'var(--surface-2)' }}>
                <p className="text-xl font-bold" style={{ color:s.color }}>{s.val}</p>
                <p className="text-[10px]" style={{ color:'var(--text-3)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <button className="btn-primary text-sm" onClick={() => { reset(); onClose(); }}>View Leads</button>
        </div>
      )}
    </Modal>
  );
}
