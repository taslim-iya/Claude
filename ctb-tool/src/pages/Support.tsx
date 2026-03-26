import { useState, useMemo } from 'react';
import { store, generateId } from '../lib/store';
import type { SupportTicket } from '../lib/types';
import Modal from '../components/Modal';
import { Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const issueTypes = ['transport', 'accommodation', 'language', 'emergency', 'other'];
const issueColors: Record<string, string> = {
  transport: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  accommodation: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  language: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  emergency: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  other: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState(() => store.support.getAll());
  const [clients] = useState(() => store.clients.getAll());
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ clientId: '', issueType: 'other', description: '' });
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const filtered = useMemo(() => tickets.filter(t => filter === 'all' || t.status === filter), [tickets, filter]);

  const addTicket = () => {
    const client = clients.find(c => c.id === form.clientId);
    const newTicket: SupportTicket = {
      id: generateId(), clientId: form.clientId, clientName: client?.name || 'Unknown',
      timestamp: new Date().toISOString(), issueType: form.issueType,
      description: form.description, resolution: '', status: 'open',
    };
    const updated = [...tickets, newTicket];
    store.support.save(updated);
    setTickets(updated);
    setShowAdd(false);
    setForm({ clientId: '', issueType: 'other', description: '' });
  };

  const resolve = (id: string) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: 'resolved', resolution } : t);
    store.support.save(updated);
    setTickets(updated);
    setResolving(null);
    setResolution('');
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Support Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">{openCount} open, {resolvedCount} resolved</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-ctb-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2">
          <Plus size={16} /> Log Issue
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'open', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-ctb-red text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'All' : f === 'open' ? `Open (${openCount})` : `Resolved (${resolvedCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${issueColors[t.issueType] || ''}`}>{t.issueType}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${t.status === 'open' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                    {t.status === 'open' ? <AlertCircle size={10} /> : <CheckCircle size={10} />} {t.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900">{t.clientName}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> {new Date(t.timestamp).toLocaleString('en-GB')}</p>
              </div>
              {t.status === 'open' && (
                <button onClick={() => { setResolving(t.id); setResolution(''); }} className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                  <CheckCircle size={14} /> Resolve
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{t.description}</p>
            {t.resolution && (
              <div className="mt-3 bg-emerald-50/50 rounded-xl p-4 ring-1 ring-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Resolution</p>
                <p className="text-sm text-emerald-800">{t.resolution}</p>
              </div>
            )}
            {resolving === t.id && (
              <div className="mt-4 flex gap-2">
                <input value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Resolution details..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 focus:outline-none" />
                <button onClick={() => resolve(t.id)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700">Save</button>
                <button onClick={() => setResolving(null)} className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-12 text-gray-400">No tickets found</p>}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log Support Issue">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</label>
            <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none bg-white">
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue Type</label>
            <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none bg-white">
              {issueTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" rows={4} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={addTicket} className="flex-1 bg-ctb-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Log Issue</button>
          <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
