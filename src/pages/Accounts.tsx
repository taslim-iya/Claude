import { useState } from 'react';
import { Search, Plus, Building2, Globe, ExternalLink, X, Zap, Tag, Users } from 'lucide-react';
import { accounts, contacts } from '../data/sampleData';

const enrichColor: Record<string, string> = {
  enriched:'bg-emerald-50 text-emerald-700', partial:'bg-amber-50 text-amber-700',
  pending:'bg-blue-50 text-blue-700', failed:'bg-red-50 text-red-600', not_enriched:'bg-gray-100 text-gray-500',
};
const scoreColor: Record<string, string> = {
  hot:'bg-red-50 text-red-700', qualified:'bg-emerald-50 text-emerald-700',
  nurture:'bg-amber-50 text-amber-700', review:'bg-blue-50 text-blue-700',
  low_priority:'bg-gray-100 text-gray-500', do_not_contact:'bg-red-100 text-red-500',
};

export default function Accounts() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<typeof accounts[0] | null>(null);
  const [filterIndustry, setFilterIndustry] = useState('all');

  const industries = [...new Set(accounts.map(a => a.industry))];
  const filtered = accounts.filter(a => {
    const match = !q || [a.name, a.industry, a.headquarters, a.domain].join(' ').toLowerCase().includes(q.toLowerCase());
    const ind = filterIndustry === 'all' || a.industry === filterIndustry;
    return match && ind;
  });

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Accounts</h1>
              <p className="text-sm text-gray-500">All target companies in your workspace.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors">
              <Plus size={14} /> Add Account
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search accounts…" className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <select value={filterIndustry} onChange={e=>setFilterIndustry(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrichment</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setSelected(a)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id===a.id ? 'bg-indigo-50/40' : ''}`}>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{a.industry}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{a.employeeCount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{a.revenueBand}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scoreColor[a.scoreLabel]}`}>{a.scoreLabel.replace('_',' ')}</span>
                      <span className="text-xs text-gray-400">{a.leadScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${enrichColor[a.enrichmentStatus]}`}>{a.enrichmentStatus.replace('_',' ')}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{a.owner.split(' ')[0]}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{a.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border-t border-gray-100 px-6 py-3">
          <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {accounts.length} accounts</p>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Account Details</h3>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Company identity */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0"><Building2 size={20} className="text-gray-400" /></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-lg">{selected.name}</h4>
                <a href={selected.website} className="text-sm text-indigo-600 hover:underline flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  <Globe size={12} />{selected.domain}<ExternalLink size={10} />
                </a>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${enrichColor[selected.enrichmentStatus]}`}>{selected.enrichmentStatus.replace('_',' ')}</span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>

            {/* Score */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead Score</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scoreColor[selected.scoreLabel]}`}>{selected.scoreLabel.replace('_',' ')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">{selected.leadScore}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{width:`${selected.leadScore}%`}} />
                </div>
              </div>
            </div>

            {/* Fields */}
            {[
              { label:'Industry', value: selected.industry },
              { label:'Employees', value: selected.employeeCount.toLocaleString() },
              { label:'Revenue', value: selected.revenueBand },
              { label:'HQ', value: selected.headquarters },
              { label:'Country', value: selected.country },
              { label:'Owner', value: selected.owner },
              { label:'Source', value: selected.source },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400 font-medium">{f.label}</span>
                <span className="text-sm text-gray-800 font-medium">{f.value}</span>
              </div>
            ))}

            {/* Tech stack */}
            {selected.technologies.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.technologies.map(t => <span key={t} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">{t}</span>)}
                </div>
              </div>
            )}

            {/* Tags */}
            {selected.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(t => <span key={t} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"><Tag size={10} />{t}</span>)}
                </div>
              </div>
            )}

            {/* Contacts */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><Users size={12} /> Contacts</p>
              <div className="space-y-2">
                {contacts.filter(c => c.accountId === selected.id).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.firstName[0]}{c.lastName[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{c.title}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${scoreColor[c.scoreLabel]}`}>{c.scoreLabel==='hot'?'🔥':'✅'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <button className="flex-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">View Full Profile</button>
            <button className="flex-1 text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"><Zap size={13} /> Enrich</button>
          </div>
        </div>
      )}
    </div>
  );
}
