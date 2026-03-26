import { useState } from 'react';
import { store, generateId } from '../lib/store';
import type { Itinerary, DayPlan } from '../lib/types';
import Modal from '../components/Modal';
import { Plus, ArrowLeft, Sparkles, FileText, FileDown, MapPin, Calendar, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const demoActivities: Record<string, string[]> = {
  Beijing: ['Visit the Forbidden City and Tiananmen Square', 'Explore the Great Wall at Mutianyu section', 'Walk through traditional Hutong alleys', 'Visit Temple of Heaven at sunrise', 'Explore 798 Art District'],
  Shanghai: ['Walk along The Bund at sunset', 'Visit Yu Garden and Old City', 'Explore French Concession neighborhood', 'Shop on Nanjing Road', 'Day trip to Zhujiajiao Water Town'],
  Guangzhou: ['Morning dim sum at a traditional tea house', 'Visit Chen Clan Academy', 'Pearl River night cruise', 'Explore Shamian Island'],
  Shenzhen: ['Visit OCT Loft Creative Park', 'Explore Dafen Oil Painting Village', 'Shopping at Luohu Commercial City'],
  Chengdu: ['Giant Panda Research Base (arrive at 7am)', 'Explore Jinli Ancient Street', 'Sichuan opera face-changing show', 'Traditional tea house in People\'s Park'],
  "Xi'an": ['Terracotta Warriors with private guide', 'Bike ride on the ancient City Wall', 'Muslim Quarter street food walk', 'Big Wild Goose Pagoda'],
};
const demoRestaurants: Record<string, string[]> = {
  Beijing: ['Da Dong Roast Duck', 'TRB Hutong (fine dining)', 'Lost Heaven (Yunnan cuisine)'],
  Shanghai: ['Din Tai Fung (xiaolongbao)', 'Mr & Mrs Bund', 'Yang\'s Fried Dumplings'],
  Guangzhou: ['Guangzhou Restaurant (dim sum)', 'Panxi Restaurant'],
  Shenzhen: ['Coastal seafood restaurants in Shekou'],
  Chengdu: ['Haidilao Hot Pot', 'Chen Mapo Tofu'],
  "Xi'an": ['Muslim Quarter street stalls', 'Defachang Dumpling Banquet'],
};

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState(() => store.itineraries.getAll());
  const [clients] = useState(() => store.clients.getAll());
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Itinerary | null>(null);
  const [form, setForm] = useState({ title: '', clientId: '', cities: '', startDate: '', endDate: '' });
  const [aiLoading, setAiLoading] = useState(false);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unassigned';

  const createItinerary = () => {
    const cities = form.cities.split(',').map(c => c.trim()).filter(Boolean);
    const newIt: Itinerary = {
      id: generateId(), title: form.title, clientId: form.clientId, cities, startDate: form.startDate, endDate: form.endDate, status: 'draft', days: [], createdAt: new Date().toISOString(),
    };
    const updated = [...itineraries, newIt];
    store.itineraries.save(updated);
    setItineraries(updated);
    setShowCreate(false);
    setForm({ title: '', clientId: '', cities: '', startDate: '', endDate: '' });
    setSelected(newIt);
  };

  const aiAutoFill = () => {
    if (!selected) return;
    setAiLoading(true);
    setTimeout(() => {
      const start = new Date(selected.startDate);
      const end = new Date(selected.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysPerCity = Math.ceil(totalDays / (selected.cities.length || 1));
      const days: DayPlan[] = [];
      for (let i = 0; i < totalDays; i++) {
        const cityIdx = Math.min(Math.floor(i / daysPerCity), selected.cities.length - 1);
        const city = selected.cities[cityIdx] || 'Beijing';
        const date = new Date(start); date.setDate(date.getDate() + i);
        const acts = demoActivities[city] || demoActivities['Beijing'];
        const meals = demoRestaurants[city] || demoRestaurants['Beijing'];
        days.push({
          day: i + 1, date: date.toISOString().split('T')[0], city,
          activities: acts.slice((i * 2) % acts.length, ((i * 2) % acts.length) + 3),
          transport: 'Private driver / Metro', accommodation: '4-star hotel in city center',
          meals: ['Hotel breakfast', meals[i % meals.length], meals[(i + 1) % meals.length]],
          notes: i === 0 ? 'Arrival day - take it easy' : i === totalDays - 1 ? 'Departure day' : 'Download WeChat and Alipay before arrival',
        });
      }
      const updatedIt = { ...selected, days };
      const all = itineraries.map(it => it.id === selected.id ? updatedIt : it);
      store.itineraries.save(all);
      setItineraries(all);
      setSelected(updatedIt);
      setAiLoading(false);
    }, 1200);
  };

  const updateDay = (dayIdx: number, field: string, value: string | string[]) => {
    if (!selected) return;
    const days = [...selected.days];
    days[dayIdx] = { ...days[dayIdx], [field]: value };
    const updated = { ...selected, days };
    setSelected(updated);
    const all = itineraries.map(it => it.id === selected.id ? updated : it);
    store.itineraries.save(all);
    setItineraries(all);
  };

  const exportPDF = () => {
    if (!selected) return;
    const clientName = getClientName(selected.clientId);
    const doc = new jsPDF();
    doc.setFillColor(26, 26, 26); doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor('#B41414'); doc.setFontSize(36); doc.text('CHINA TRAVEL BUDDY', 105, 80, { align: 'center' });
    doc.setTextColor('#C8A84E'); doc.setFontSize(14); doc.text('Your Journey, Our Expertise', 105, 95, { align: 'center' });
    doc.setDrawColor('#B41414'); doc.setLineWidth(1); doc.line(40, 110, 170, 110);
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.text(selected.title, 105, 135, { align: 'center' });
    doc.setFontSize(14); doc.text(`Prepared for: ${clientName}`, 105, 155, { align: 'center' });
    doc.text(selected.cities.join(' \u2192 '), 105, 170, { align: 'center' });
    doc.text(`${selected.startDate} to ${selected.endDate}`, 105, 185, { align: 'center' });
    selected.days.forEach(day => {
      doc.addPage();
      doc.setFillColor(180, 20, 20); doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text(`Day ${day.day} - ${day.city}`, 15, 17);
      doc.setFontSize(10); doc.text(day.date, 195, 17, { align: 'right' });
      let y = 35; doc.setTextColor(26, 26, 26); doc.setFontSize(12); doc.text('Activities', 15, y); y += 7;
      doc.setFontSize(10); day.activities.forEach(a => { doc.text(`\u2022 ${a}`, 20, y); y += 6; }); y += 5;
      autoTable(doc, {
        startY: y, head: [['Category', 'Details']],
        body: [['Transport', day.transport], ['Accommodation', day.accommodation], ['Meals', day.meals.join(', ')], ['Notes', day.notes]],
        headStyles: { fillColor: [180, 20, 20] }, alternateRowStyles: { fillColor: [252, 245, 245] },
        margin: { left: 15, right: 15 }, styles: { fontSize: 9, cellPadding: 4 },
      });
    });
    doc.save(`${selected.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const exportDOCX = async () => {
    if (!selected) return;
    const clientName = getClientName(selected.clientId);
    const borderNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const borders = { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone };
    const makeRow = (label: string, value: string) => new TableRow({
      children: [
        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: 'B41414' })] })] }),
        new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [new TextRun({ text: value, size: 18 })] })] }),
      ],
    });
    const dayParagraphs: (Paragraph | Table)[] = [];
    selected.days.forEach(day => {
      dayParagraphs.push(
        new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: `Day ${day.day} - ${day.city}`, bold: true, size: 32, color: 'B41414' })] }),
        new Paragraph({ children: [new TextRun({ text: day.date, size: 20, color: '666666' })] }),
        new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Activities', bold: true, size: 24 })] }),
      );
      day.activities.forEach(act => dayParagraphs.push(new Paragraph({ children: [new TextRun({ text: `  \u2022  ${act}`, size: 20 })] })));
      dayParagraphs.push(new Paragraph({ spacing: { before: 200 }, children: [] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [makeRow('Transport', day.transport), makeRow('Accommodation', day.accommodation), makeRow('Meals', day.meals.join(', ')), makeRow('Notes', day.notes)] }),
      );
    });
    const doc = new Document({
      sections: [
        { children: [
          new Paragraph({ spacing: { before: 3000 }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CHINA TRAVEL BUDDY', bold: true, size: 56, color: 'B41414' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: selected.title, bold: true, size: 40 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: `Prepared for: ${clientName}`, size: 24 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: selected.cities.join(' \u2192 '), size: 24, color: 'B41414' })] }),
        ]},
        { children: dayParagraphs },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${selected.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
  };

  if (selected) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 group"><ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to list</button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selected.title}</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span className="font-medium">{getClientName(selected.clientId)}</span> &middot;
              <span className="flex items-center gap-1"><MapPin size={12} /> {selected.cities.join(' \u2192 ')}</span> &middot;
              <span className="flex items-center gap-1"><Calendar size={12} /> {selected.startDate} to {selected.endDate}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={aiAutoFill} disabled={aiLoading} className="bg-gradient-to-r from-ctb-gold to-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-amber-200">
              <Sparkles size={16} /> {aiLoading ? 'Generating...' : 'AI Auto-Fill'}
            </button>
            <button onClick={exportPDF} className="bg-ctb-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-200">
              <FileText size={16} /> PDF
            </button>
            <button onClick={exportDOCX} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200">
              <FileDown size={16} /> DOCX
            </button>
          </div>
        </div>
        {selected.days.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <Sparkles size={48} className="mx-auto text-ctb-gold mb-4" />
            <p className="text-gray-500 mb-4">No days planned yet. Use AI Auto-Fill to generate a full itinerary!</p>
            <button onClick={aiAutoFill} disabled={aiLoading} className="bg-gradient-to-r from-ctb-gold to-amber-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-amber-200">
              {aiLoading ? 'Generating...' : 'Generate Itinerary with AI'}
            </button>
          </div>
        )}
        <div className="space-y-4">
          {selected.days.map((day, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-ctb-red to-red-700 text-white px-6 py-3.5 flex justify-between items-center">
                <span className="font-bold text-base">Day {day.day} &mdash; {day.city}</span>
                <span className="text-sm opacity-80 font-medium">{day.date}</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Activities</label>
                  <textarea value={day.activities.join('\n')} onChange={e => updateDay(idx, 'activities', e.target.value.split('\n'))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1.5 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" rows={3} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Meals</label>
                  <textarea value={day.meals.join('\n')} onChange={e => updateDay(idx, 'meals', e.target.value.split('\n'))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1.5 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" rows={3} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Transport</label>
                  <input value={day.transport} onChange={e => updateDay(idx, 'transport', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1.5 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Accommodation</label>
                  <input value={day.accommodation} onChange={e => updateDay(idx, 'accommodation', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1.5 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
                  <input value={day.notes} onChange={e => updateDay(idx, 'notes', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1.5 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Itineraries</h1>
          <p className="text-gray-500 text-sm mt-1">{itineraries.length} itineraries</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-ctb-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2">
          <Plus size={16} /> New Itinerary
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {itineraries.map(it => (
          <div key={it.id} onClick={() => setSelected(it)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-ctb-red/20 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-900 group-hover:text-ctb-red transition-colors">{it.title}</h3>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-ctb-red transition-colors" />
            </div>
            <p className="text-sm text-gray-500 mb-2">{getClientName(it.clientId)}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {it.cities.join(' \u2192 ')}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Calendar size={10} /> {it.startDate} to {it.endDate}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold ring-1 ring-blue-200">{it.status}</span>
              <span className="text-xs text-gray-400">{it.days.length} days planned</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Itinerary">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trip Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</label>
            <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none bg-white">
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cities (comma separated)</label>
            <input value={form.cities} onChange={e => setForm({ ...form, cities: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={createItinerary} className="flex-1 bg-ctb-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Create</button>
          <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
