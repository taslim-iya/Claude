import { useState } from 'react';
import { Search, Filter, Upload, Plus, Zap, CheckCircle, XCircle } from 'lucide-react';
import { contacts, accounts } from '../data/sampleData';

const scoreStyle: Record<string, string> = {
  hot:'bg-red-50 text-red-700 border border-red-200',
  qualified:'bg-emerald-50 text-emerald-700 border border-emerald-200',
  nurture:'bg-amber-50 text-amber-700 border border-amber-200',
  review:'bg-blue-50 text-blue-700 border border-blue-200',
  low_priority:'bg-gray-100 text-gray-500 border border-gray-200',
  do_not_contact:'bg-red-100 text-red-500 border border-red-200',
};
const scoreLabel: Record<string, string> = { hot:'🔥 Hot', qualified:'✅ Qualified', nurture:'🌱 Nurture', review:'👁 Review', low_priority:'↓ Low', do_not_contact:'🚫 DNC' };
const statusStyle: Record<string, string> = {
  not_contacted:'bg-gray-100 text-gray-600', in_sequence:'bg-blue-50 text-blue-700',
  replied:'bg-indigo-50 text-indigo-700', interested:'bg-emerald-50 text-emerald-700',
  not_interested:'bg-gray-100 text-gray-400', unsubscribed:'bg-red-50 text-red-500', bounced:'bg-orange-50 text-orange-600',
};
const statusLabel: Record<string, string> = {
  not_contacted:'Not Contacted', in_sequence:'In Sequence', replied:'Replied',
  interested:'Interested', not_interested:'Not Interested', unsubscribed:'Unsubscribed', bounced:'Bounced',
};
const enrichStyle: Record<string, string> = {
  enriched:'bg-emerald-50 text-emerald-700', partial:'bg-amber-50 text-amber-700',
  pending:'bg-blue-50 text-blue-700', failed:'bg-red-50 text-red-600', not_enriched:'bg-gray-100 text-gray-500',
};

export default function Leads() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [filterScore, setFilterScore] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = contacts.filter(c => {
    const match = !q || [c.firstName, c.lastName, c.title, c.accountName, c.email].join(' ').toLowerCase().includes(q.toLowerCase());
    const sc = filterScore === 'all' || c.scoreLabel === filterScore;
    const st = filterStatus === 'all' || c.outreachStatus === filterStatus;
    return match && sc && st;
  });

  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  const allSel = filtered.length > 0 && sel.length === filtered.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lead Sourcing</h1>
            <p className="text-sm text-gray-500">Find, import, and manage your prospect pipeline.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload size={14} /> Import CSV
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors">
              <Plus size={14} /> Add Lead
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-lg">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, title, company, email…" className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={14} /> Filters
          </button>
          {['hot','qualified','nurture'].map(s => (
            <button key={s} onClick={() => setFilterScore(filterScore===s?'all':s)} className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors capitalize ${filterScore===s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {s==='hot'?'🔥 ':s==='qualified'?'✅ ':'🌱 '}{s}
            </button>
          ))}
          {sel.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">{sel.length} selected</span>
              <button className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"><Zap size={12} /> Enrich</button>
              <button className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100">Add to Campaign</button>
              <button className="text-xs font-medium bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">Add to List</button>
            </div>
          )}
        </div>
        {showFilters && (
          <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Score</label>
              <select value={filterScore} onChange={e=>setFilterScore(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Scores</option>
                {['hot','qualified','nurture','review','low_priority'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Outreach Status</label>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Statuses</option>
                {['not_contacted','in_sequence','replied','interested','unsubscribed'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={()=>{setFilterScore('all');setFilterStatus('all');}} className="text-sm text-indigo-600 hover:text-indigo-700 underline">Clear filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
            <tr>
              <th className="w-10 py-3 px-4"><input type="checkbox" checked={allSel} onChange={()=>setSel(allSel?[]:filtered.map(c=>c.id))} className="rounded border-gray-300 text-indigo-600" /></th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrichment</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {filtered.map(c => {
              const acct = accounts.find(a=>a.id===c.accountId);
              return (
                <tr key={c.id} className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${sel.includes(c.id)?'bg-indigo-50/40':''}`}>
                  <td className="py-3 px-4" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={sel.includes(c.id)} onChange={()=>toggle(c.id)} className="rounded border-gray-300 text-indigo-600" /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.firstName[0]}{c.lastName[0]}</div>
                      <div><p className="font-medium text-gray-900 text-sm">{c.firstName} {c.lastName}</p><p className="text-xs text-gray-500">{c.title}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800 text-sm">{c.accountName}</p>
                    <p className="text-xs text-gray-400">{acct?.industry} · {acct?.employeeCount?.toLocaleString()} emp</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-700 text-sm">{c.email}</span>
                      {c.emailVerified ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={13} className="text-gray-300 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${scoreStyle[c.scoreLabel]}`}>{scoreLabel[c.scoreLabel]}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[c.outreachStatus]}`}>{statusLabel[c.outreachStatus]}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${enrichStyle[c.enrichmentStatus]}`}>{c.enrichmentStatus.replace('_',' ')}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{c.lastActivity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No leads found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of <span className="font-semibold">{contacts.length}</span> leads</p>
        <div className="flex items-center gap-1">
          {['1','2','3'].map((p,i) => <button key={p} className={`text-sm px-3 py-1.5 rounded border transition-colors ${i===0?'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium':'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>)}
        </div>
      </div>
    </div>
  );
}
