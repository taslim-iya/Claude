import { useState, useMemo } from 'react';
import { store, generateId } from '../lib/store';
import Modal from '../components/Modal';
import { Plus, Search, Star, Utensils, Landmark, Target, Moon, ShoppingBag } from 'lucide-react';

const categories = ['food', 'culture', 'activity', 'nightlife', 'shopping'];
const categoryConfig: Record<string, { icon: typeof Star; color: string }> = {
  food: { icon: Utensils, color: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200' },
  culture: { icon: Landmark, color: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200' },
  activity: { icon: Target, color: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' },
  nightlife: { icon: Moon, color: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
  shopping: { icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
};

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState(() => store.experiences.getAll());
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', category: 'food', description: '', priceRange: '', tips: '', rating: 4 });

  const cities = useMemo(() => Array.from(new Set(experiences.map(e => e.city))), [experiences]);
  const filtered = useMemo(() => experiences.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'all' || e.city === cityFilter;
    const matchCat = catFilter === 'all' || e.category === catFilter;
    return matchSearch && matchCity && matchCat;
  }), [experiences, search, cityFilter, catFilter]);

  const addExperience = () => {
    const updated = [...experiences, { id: generateId(), ...form }];
    store.experiences.save(updated);
    setExperiences(updated);
    setShowAdd(false);
    setForm({ name: '', city: '', category: 'food', description: '', priceRange: '', tips: '', rating: 4 });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Experiences</h1>
          <p className="text-gray-500 text-sm mt-1">{experiences.length} curated experiences</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-ctb-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2">
          <Plus size={16} /> Add Experience
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search experiences..." className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(e => {
          const cfg = categoryConfig[e.category] || categoryConfig.activity;
          const Icon = cfg.icon;
          return (
            <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= e.rating ? 'text-ctb-gold fill-ctb-gold' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{e.name}</h3>
              <p className="text-xs font-semibold text-ctb-red mb-2">{e.city} &middot; {e.category}</p>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{e.description}</p>
              <div className="bg-gray-50/80 rounded-xl p-3.5 space-y-1.5">
                <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Price:</span> {e.priceRange}</p>
                <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Tips:</span> {e.tips}</p>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-center py-12 text-gray-400">No experiences found</p>}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Experience">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Range</label>
              <input value={form.priceRange} onChange={e => setForm({ ...form, priceRange: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setForm({ ...form, rating: s })} className="p-0.5"><Star size={22} className={`${s <= form.rating ? 'text-ctb-gold fill-ctb-gold' : 'text-gray-300'} transition-colors`} /></button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tips</label>
            <textarea value={form.tips} onChange={e => setForm({ ...form, tips: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" rows={2} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={addExperience} className="flex-1 bg-ctb-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Add</button>
          <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
