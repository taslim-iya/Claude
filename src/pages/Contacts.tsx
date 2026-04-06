import { useState } from 'react';
import { Search, Plus, X, Mail, Phone, Linkedin, CheckCircle, XCircle, Zap } from 'lucide-react';
import { contacts, accounts } from '../data/sampleData';

const scoreStyle: Record<string, string> = {
  hot:'bg-red-50 text-red-700', qualified:'bg-emerald-50 text-emerald-700',
  nurture:'bg-amber-50 text-amber-700', review:'bg-blue-50 text-blue-700',
  low_priority:'bg-gray-100 text-gray-500', do_not_contact:'bg-red-100 text-red-500',
};
const statusStyle: Record<string, string> = {
  not_contacted:'bg-gray-100 text-gray-600', in_sequence:'bg-blue-50 text-blue-700',
  replied:'bg-indigo-50 text-indigo-700', interested:'bg-emerald-50 text-emerald-700',
  not_interested:'bg-gray-100 text-gray-400', unsubscribed:'bg-red-50 text-red-500', bounced:'bg-orange-50 text-orange-600',
};
const pipelineStyle: Record<string, string> = {
  new:'bg-gray-100 text-gray-500', contacted:'bg-blue-50 text-blue-600',
  replied:'bg-indigo-50 text-indigo-600', interested:'bg-violet-50 text-violet-600',
  meeting_booked:'bg-emerald-50 text-emerald-600', proposal_sent:'bg-amber-50 text-amber-600',
  opportunity:'bg-orange-50 text-orange-600', won:'bg-green-50 text-green-700', lost:'bg-red-50 text-red-500',
};

export default function Contacts() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<typeof contacts[0] | null>(null);
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const depts = [...new Set(contacts.map(c => c.department))];
  const filtered = contacts.filter(c => {
    const match = !q || [c.firstName, c.lastName, c.title, c.accountName, c.email].join(' ').toLowerCase().includes(q.toLowerCase());
    const dept = filterDept === 'all' || c.department === filterDept;
    const st = filterStatus === 'all' || c.outreachStatus === filterStatus;
    return match && dept && st;
  });

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-white border-b border-gray-100 px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
              <p className="text-sm text-gray-500">All prospect contacts across your accounts.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"><Plus size={14} /> Add Contact</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search contacts…" className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Departments</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Statuses</option>
              {['not_contacted','in_sequence','replied','interested','unsubscribed'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Outreach</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pipeline</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filtered.map(c => (
                <tr key={c.id} onClick={()=>setSel(c)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${sel?.id===c.id?'bg-indigo-50/30':''}`}>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.firstName[0]}{c.lastName[0]}</div>
                      <div><p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p><p className="text-xs text-gray-400">{c.title} · {c.seniority}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><p className="font-medium text-gray-800">{c.accountName}</p><p className="text-xs text-gray-400">{c.department}</p></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 text-sm truncate max-w-[160px]">{c.email}</span>
                      {c.emailVerified ? <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={12} className="text-gray-300 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scoreStyle[c.scoreLabel]}`}>{c.scoreLabel.replace('_',' ')}</span>
                      <span className="text-xs text-gray-400">{c.leadScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[c.outreachStatus]}`}>{c.outreachStatus.replace(/_/g,' ')}</span></td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pipelineStyle[c.pipelineStage]}`}>{c.pipelineStage.replace(/_/g,' ')}</span></td>
                  <td className="py-3 px-4 text-sm text-gray-500">{c.owner.split(' ')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border-t border-gray-100 px-6 py-3">
          <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {contacts.length} contacts</p>
        </div>
      </div>

      {/* Detail panel */}
      {sel && (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Contact Details</h3>
            <button onClick={()=>setSel(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-2">{sel.firstName[0]}{sel.lastName[0]}</div>
              <h4 className="font-bold text-gray-900">{sel.firstName} {sel.lastName}</h4>
              <p className="text-sm text-gray-500">{sel.title}</p>
              <p className="text-sm text-indigo-600 font-medium">{sel.accountName}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className={`text-center px-2 py-1 rounded-full text-xs font-medium ${scoreStyle[sel.scoreLabel]}`}>{sel.scoreLabel.replace('_',' ')} · {sel.leadScore}</span>
              <span className={`text-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle[sel.outreachStatus]}`}>{sel.outreachStatus.replace(/_/g,' ')}</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate">{sel.email}</span>
                {sel.emailVerified ? <CheckCircle size={12} className="text-emerald-500" /> : null}
              </div>
              {sel.phone && <div className="flex items-center gap-2.5 text-sm"><Phone size={14} className="text-gray-400 flex-shrink-0" /><span className="text-gray-700">{sel.phone}</span></div>}
              {sel.linkedin && <div className="flex items-center gap-2.5 text-sm"><Linkedin size={14} className="text-indigo-500 flex-shrink-0" /><a href={sel.linkedin} className="text-indigo-600 hover:underline truncate" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a></div>}
            </div>

            {[
              {l:'Department', v:sel.department},{l:'Seniority', v:sel.seniority},
              {l:'Persona', v:sel.personaType},{l:'Pipeline', v:sel.pipelineStage.replace(/_/g,' ')},
              {l:'Owner', v:sel.owner},{l:'Source', v:sel.source},
              {l:'Last Activity', v:sel.lastActivity},
            ].map(f => (
              <div key={f.l} className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-xs text-gray-400">{f.l}</span>
                <span className="text-xs text-gray-800 font-medium capitalize">{f.v}</span>
              </div>
            ))}

            {sel.notes && (
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                <p className="text-xs text-amber-800 leading-relaxed">{sel.notes}</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <button className="flex-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">Add to Campaign</button>
            <button className="flex-1 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg flex items-center justify-center gap-1"><Zap size={12} />Enrich</button>
          </div>
        </div>
      )}
    </div>
  );
}
