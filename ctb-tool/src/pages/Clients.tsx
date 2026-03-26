import { useState, useMemo } from 'react';
import { store, generateId } from '../lib/store';
import type { Client } from '../lib/types';
import Modal from '../components/Modal';
import { Plus, Search, Pencil, Trash2, UserCircle } from 'lucide-react';

const statuses = ['inquiry', 'planning', 'booked', 'on-trip', 'completed'];
const statusColors: Record<string, string> = {
  inquiry: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  planning: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  booked: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'on-trip': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  completed: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
};

const emptyClient: Omit<Client, 'id' | 'createdAt'> & { id: string; createdAt: string } = {
  id: '', name: '', email: '', phone: '', tripDates: '', destinations: [], budget: '', status: 'inquiry', notes: '', createdAt: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState(() => store.clients.getAll());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient);
  const [destInput, setDestInput] = useState('');

  const filtered = useMemo(() => clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  }), [clients, search, filterStatus]);

  const openAdd = () => { setEditing(null); setForm(emptyClient); setDestInput(''); setShowModal(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm(c); setDestInput(c.destinations.join(', ')); setShowModal(true); };

  const save = () => {
    const payload = { ...form, destinations: destInput.split(',').map(d => d.trim()).filter(Boolean) };
    let updated: Client[];
    if (editing) {
      updated = clients.map(c => c.id === editing.id ? { ...c, ...payload } : c);
    } else {
      updated = [...clients, { ...payload, id: generateId(), createdAt: new Date().toISOString() }];
    }
    store.clients.save(updated);
    setClients(updated);
    setShowModal(false);
  };

  const remove = (id: string) => {
    if (!confirm('Delete this client?')) return;
    const updated = clients.filter(c => c.id !== id);
    store.clients.save(updated);
    setClients(updated);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} total clients</p>
        </div>
        <button onClick={openAdd} className="bg-ctb-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none bg-white">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {['Client', 'Contact', 'Destinations', 'Trip Dates', 'Budget', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ctb-red/10 to-red-50 flex items-center justify-center">
                      <UserCircle size={18} className="text-ctb-red" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      {c.notes && <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{c.notes}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-600">{c.email}</p>
                  <p className="text-xs text-gray-400">{c.phone}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{c.destinations.join(', ')}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{c.tripDates}</td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{c.budget}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[c.status] || ''}`}>{c.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-12 text-gray-400">No clients found</p>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trip Dates</label>
            <input placeholder="e.g. 2026-05-01 to 2026-05-10" value={form.tripDates} onChange={e => setForm({ ...form, tripDates: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinations (comma separated)</label>
            <input value={destInput} onChange={e => setDestInput(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</label>
              <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none bg-white">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" rows={3} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={save} className="flex-1 bg-ctb-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Save</button>
          <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
