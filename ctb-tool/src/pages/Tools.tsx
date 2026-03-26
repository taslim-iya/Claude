import { useState, useEffect, useMemo } from 'react';
import { store } from '../lib/store';
import { ArrowLeftRight, Clock, Shield, BookOpen, Search } from 'lucide-react';

const visaInfo: Record<string, string> = {
  'United Kingdom': '144-hour visa-free transit available for Beijing, Shanghai, Guangzhou, Chengdu, and other major cities. Standard tourist visa (L visa) valid for 30-90 days. Apply at Chinese embassy/consulate 4 weeks ahead. Passport must be valid 6+ months.',
  'United States': '10-year multiple entry tourist visa (L visa) available. 144-hour visa-free transit in select cities. EVUS registration required after visa issuance. Apply at Chinese embassy or visa application center.',
  'Australia': 'Tourist visa (L visa) required. 10-year multiple entry available. 144-hour transit visa exemption in major cities. Apply through Chinese visa application center in Australia.',
  'Canada': 'Tourist visa (L visa) required. 10-year multiple entry available. 144-hour transit visa exemption. Apply through visa application center.',
  'European Union': 'Tourist visa required for most EU nations. 15-day visa-free for some nationalities. 144-hour transit exemption available. Apply at nearest Chinese embassy.',
  'Japan': '15-day visa-free entry for Japanese passport holders. No visa needed for short tourism trips.',
  'Singapore': '30-day visa-free entry for Singaporean passport holders.',
  'Malaysia': '30-day visa-free entry for Malaysian passport holders (mutual agreement).',
};

const fallbackRates: Record<string, Record<string, number>> = {
  GBP: { CNY: 9.15, USD: 1.27 }, USD: { CNY: 7.24, GBP: 0.79 }, CNY: { GBP: 0.11, USD: 0.14 },
};

export default function ToolsPage() {
  const [phrases] = useState(() => store.phrases.getAll());
  const [phraseSearch, setPhraseSearch] = useState('');
  const [phraseCategory, setPhraseCategory] = useState('all');
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('GBP');
  const [toCurrency, setToCurrency] = useState('CNY');
  const [converted, setConverted] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState('United Kingdom');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ukTime = time.toLocaleString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const cnTime = time.toLocaleString('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const ukDate = time.toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long' });
  const cnDate = time.toLocaleDateString('en-GB', { timeZone: 'Asia/Shanghai', weekday: 'long', day: 'numeric', month: 'long' });

  const convertCurrency = async () => {
    setConverting(true);
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await res.json();
      const rate = data.rates?.[toCurrency];
      if (rate) { setConverted((parseFloat(amount) * rate).toFixed(2)); }
      else { throw new Error('No rate'); }
    } catch {
      const rate = fallbackRates[fromCurrency]?.[toCurrency] || 1;
      setConverted((parseFloat(amount) * rate).toFixed(2));
    } finally {
      setConverting(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency); setToCurrency(fromCurrency); setConverted(null);
  };

  const categories = useMemo(() => Array.from(new Set(phrases.map(p => p.category))), [phrases]);
  const filteredPhrases = useMemo(() => phrases.filter(p => {
    const matchSearch = p.english.toLowerCase().includes(phraseSearch.toLowerCase()) || p.pinyin.toLowerCase().includes(phraseSearch.toLowerCase());
    const matchCat = phraseCategory === 'all' || p.category === phraseCategory;
    return matchSearch && matchCat;
  }), [phrases, phraseSearch, phraseCategory]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quick Tools</h1>
        <p className="text-gray-500 text-sm mt-1">Essential utilities for China travel planning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Currency Converter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ctb-red/10 flex items-center justify-center"><ArrowLeftRight size={16} className="text-ctb-red" /></div>
            Currency Converter
          </h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">From</label>
              <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
                <option value="GBP">GBP</option><option value="USD">USD</option><option value="CNY">CNY</option>
              </select>
            </div>
            <button onClick={swapCurrencies} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-ctb-red transition-colors mb-px">
              <ArrowLeftRight size={16} />
            </button>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">To</label>
              <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
                <option value="CNY">CNY</option><option value="GBP">GBP</option><option value="USD">USD</option>
              </select>
            </div>
            <button onClick={convertCurrency} disabled={converting} className="bg-ctb-red text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors whitespace-nowrap">
              {converting ? '...' : 'Convert'}
            </button>
          </div>
          {converted && (
            <div className="mt-5 bg-gradient-to-r from-gray-50 to-red-50/30 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500">{amount} {fromCurrency} =</p>
              <p className="text-3xl font-extrabold text-ctb-red tracking-tight mt-1">{converted} {toCurrency}</p>
            </div>
          )}
        </div>

        {/* Time Zones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Clock size={16} className="text-blue-600" /></div>
            Time Zones
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50/80 rounded-xl p-5 text-center ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-600 mb-2">United Kingdom</p>
              <p className="text-4xl font-extrabold text-gray-900 tracking-tight font-mono">{ukTime}</p>
              <p className="text-xs text-gray-400 mt-2">{ukDate}</p>
            </div>
            <div className="bg-red-50/50 rounded-xl p-5 text-center ring-1 ring-red-100">
              <p className="text-sm font-semibold text-ctb-red mb-2">China</p>
              <p className="text-4xl font-extrabold text-ctb-red tracking-tight font-mono">{cnTime}</p>
              <p className="text-xs text-gray-400 mt-2">{cnDate}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">China is always UTC+8 (no daylight saving)</p>
        </div>
      </div>

      {/* Visa Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Shield size={16} className="text-emerald-600" /></div>
          Visa Information
        </h2>
        <select value={selectedNationality} onChange={e => setSelectedNationality(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 w-full max-w-xs bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
          {Object.keys(visaInfo).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <div className="bg-emerald-50/50 rounded-xl p-5 ring-1 ring-emerald-100">
          <p className="text-sm text-emerald-900 leading-relaxed">{visaInfo[selectedNationality]}</p>
        </div>
      </div>

      {/* Phrase Book */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ctb-gold/10 flex items-center justify-center"><BookOpen size={16} className="text-ctb-gold" /></div>
          Chinese Phrase Book
        </h2>
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={phraseSearch} onChange={e => setPhraseSearch(e.target.value)} placeholder="Search phrases..." className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
          </div>
          <select value={phraseCategory} onChange={e => setPhraseCategory(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredPhrases.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50/80 rounded-xl p-3.5 hover:bg-gray-100/80 transition-colors ring-1 ring-gray-100">
              <div className="text-2xl min-w-[2.5rem] text-center">{p.chinese}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{p.english}</p>
                <p className="text-xs text-ctb-red font-medium">{p.pinyin}</p>
              </div>
              <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-full ring-1 ring-gray-200 font-medium whitespace-nowrap">{p.category}</span>
            </div>
          ))}
        </div>
        {filteredPhrases.length === 0 && <p className="text-center py-8 text-gray-400">No phrases found</p>}
      </div>
    </div>
  );
}
