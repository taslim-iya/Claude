import { useState } from 'react';
import { Plus, Search, ListChecks, Zap, Users, Tag, MoreHorizontal } from 'lucide-react';
import { prospectLists } from '../data/sampleData';

export default function Lists() {
  const [q, setQ] = useState('');
  const filtered = prospectLists.filter(l => !q || l.name.toLowerCase().includes(q.toLowerCase()) || l.description.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lists & Segmentation</h1>
          <p className="text-sm text-gray-500">Organize prospects into static and dynamic lists.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"><Plus size={14} /> New List</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Lists', value: prospectLists.length },
          { label:'Static Lists', value: prospectLists.filter(l=>l.type==='static').length },
          { label:'Dynamic Lists', value: prospectLists.filter(l=>l.type==='dynamic').length },
          { label:'Total Contacts', value: prospectLists.reduce((a,l)=>a+l.contactCount,0).toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search lists…" className="w-full max-w-sm pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="space-y-3">
        {filtered.map(list => (
          <div key={list.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${list.type==='dynamic' ? 'bg-violet-50' : 'bg-indigo-50'}`}>
                  {list.type === 'dynamic' ? <Zap size={16} className="text-violet-600" /> : <ListChecks size={16} className="text-indigo-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">{list.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${list.type==='dynamic' ? 'bg-violet-50 text-violet-700' : 'bg-indigo-50 text-indigo-700'}`}>
                      {list.type === 'dynamic' ? '⚡ Dynamic' : '📌 Static'}
                    </span>
                    {list.owner === 'System' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">Suppression</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{list.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users size={11} />{list.contactCount.toLocaleString()} contacts</span>
                    <span>Owner: {list.owner}</span>
                    <span>Updated {list.lastUpdated}</span>
                  </div>
                  {list.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {list.tags.map(t => <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"><Tag size={9}/>{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">View Contacts</button>
                <button className="text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Add to Campaign</button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
