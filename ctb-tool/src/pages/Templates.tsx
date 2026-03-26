import { useState } from 'react';
import { store, generateId } from '../lib/store';
import type { Template } from '../lib/types';
import { ArrowLeft, Copy, MapPin, ChevronRight } from 'lucide-react';

export default function TemplatesPage() {
  const [templates] = useState(() => store.templates.getAll());
  const [selected, setSelected] = useState<Template | null>(null);
  const [cloning, setCloning] = useState(false);

  const cloneToItinerary = (template: Template) => {
    setCloning(true);
    const today = new Date();
    const endDate = new Date(today); endDate.setDate(endDate.getDate() + template.duration - 1);
    const days = template.days.map((d, i) => {
      const date = new Date(today); date.setDate(date.getDate() + i);
      return { ...d, date: date.toISOString().split('T')[0] };
    });
    const itineraries = store.itineraries.getAll();
    itineraries.push({
      id: generateId(), title: `${template.title} (from template)`, clientId: '', cities: template.cities,
      startDate: today.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0],
      status: 'draft', days, createdAt: new Date().toISOString(),
    });
    store.itineraries.save(itineraries);
    setCloning(false);
    alert('Itinerary created from template! Check the Itineraries page.');
  };

  if (selected) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 group"><ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to templates</button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selected.title}</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2"><MapPin size={12} /> {selected.cities.join(' \u2192 ')} &middot; {selected.duration} days</p>
          </div>
          <button onClick={() => cloneToItinerary(selected)} disabled={cloning} className="bg-ctb-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-200">
            <Copy size={16} /> {cloning ? 'Creating...' : 'Clone to New Itinerary'}
          </button>
        </div>
        <p className="text-gray-600 mb-6 bg-white rounded-2xl p-5 border border-gray-100">{selected.description}</p>
        <div className="space-y-4">
          {selected.days.map((day, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-ctb-red to-red-700 text-white px-6 py-3.5">
                <span className="font-bold">Day {day.day} &mdash; {day.city}</span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Activities</h4>
                  <ul className="text-sm text-gray-700 space-y-1.5">{day.activities.map((a, i) => <li key={i} className="flex items-start gap-2"><span className="text-ctb-red mt-0.5">&bull;</span> {a}</li>)}</ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Meals</h4>
                  <ul className="text-sm text-gray-700 space-y-1.5">{day.meals.map((m, i) => <li key={i} className="flex items-start gap-2"><span className="text-ctb-gold mt-0.5">&bull;</span> {m}</li>)}</ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Transport</h4>
                  <p className="text-sm text-gray-700">{day.transport}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Accommodation</h4>
                  <p className="text-sm text-gray-700">{day.accommodation}</p>
                </div>
                {day.notes && (
                  <div className="col-span-2 bg-amber-50/50 rounded-xl p-3 ring-1 ring-amber-100">
                    <h4 className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Notes</h4>
                    <p className="text-sm text-amber-800">{day.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Itinerary Templates</h1>
        <p className="text-gray-500 text-sm mt-1">Pre-built trip plans ready to customize</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="bg-gradient-to-br from-ctb-red via-red-700 to-red-800 text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-bold text-lg relative">{t.title}</h3>
              <p className="text-sm opacity-80 mt-1 relative">{t.cities.join(' \u2192 ')} &middot; {t.duration} days</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-5 line-clamp-2">{t.description}</p>
              <div className="flex gap-2">
                <button onClick={() => setSelected(t)} className="flex-1 border border-ctb-red text-ctb-red py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                  View <ChevronRight size={14} />
                </button>
                <button onClick={() => cloneToItinerary(t)} disabled={cloning} className="flex-1 bg-ctb-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1">
                  <Copy size={14} /> Clone
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
