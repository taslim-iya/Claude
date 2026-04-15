import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Download, Mail, Phone, Globe, Linkedin, Building2, MapPin, Calendar, BarChart3, ChevronDown, ChevronUp, X, Plus, ExternalLink, Sparkles, Eye, Users, TrendingUp, AlertTriangle, CheckCircle, Star, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import SendEmailModal from '../components/ui/SendEmailModal';
import type { Contact } from '../types';

interface ExtAccount {
  id: string; name: string; website: string; domain: string; linkedin: string;
  industry: string; employeeCount: number; revenueBand: string; headquarters: string;
  country: string; description: string; leadScore: number; scoreLabel: string;
  owner: string; source: string; tags: string[]; companyNumber: string;
  sicCode: string; incorporatedYear: string; accountsType: string; accountsTypeLabel: string;
  postcode: string; town: string; county: string; companyAge: number;
  websiteQuality: { score: number; label: string; issues: string[] };
  outreachPositioning: string; insights: string[]; phone: string;
  enrichmentStatus: string; technologies: string[]; lastUpdated: string; createdAt: string;
}

interface ExtContact extends Contact {
  phone: string; linkedin: string;
}

const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  hot: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  qualified: { bg: 'rgba(91,110,249,0.1)', text: '#5b6ef9' },
  nurture: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  low_priority: { bg: 'rgba(107,114,128,0.1)', text: '#6b7280' },
};

const WEB_COLORS: Record<string, { bg: string; text: string }> = {
  Poor: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  Basic: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  Decent: { bg: 'rgba(91,110,249,0.1)', text: '#5b6ef9' },
  Good: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
};

const INDUSTRIES = ['Professional Services','Construction','Management Consultancy','Recruitment & Staffing',
  'IT & Software','Architecture & Engineering','Civil Engineering','Advertising & Marketing','Healthcare','Personal Services'];
const REVENUE_BANDS = ['Under £500K','£500K-2M','£2M-10M','£10M-50M','£50M+'];
const SCORE_LABELS = ['hot','qualified','nurture','low_priority'];
const WEB_LABELS = ['Poor','Basic','Decent','Good'];
const PER_PAGE = 25;

export default function Leads() {
  const { toast } = useApp();
  const [accounts, setAccounts] = useState<ExtAccount[]>([]);
  const [contacts, setContacts] = useState<ExtContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailAccount, setDetailAccount] = useState<ExtAccount | null>(null);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [sendContacts, setSendContacts] = useState<Contact[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'age' | 'employees' | 'website'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [fIndustry, setFIndustry] = useState<string[]>([]);
  const [fRevenue, setFRevenue] = useState<string[]>([]);
  const [fScore, setFScore] = useState<string[]>([]);
  const [fWebsite, setFWebsite] = useState<string[]>([]);
  const [fMinAge, setFMinAge] = useState(0);
  const [fMaxAge, setFMaxAge] = useState(25);
  const [fMinEmp, setFMinEmp] = useState(0);
  const [fMaxEmp, setFMaxEmp] = useState(500);
  const [fLocation, setFLocation] = useState('');
  const [fPostcode, setFPostcode] = useState('');
  const [fHasPhone, setFHasPhone] = useState(false);
  const [fWeakWebsite, setFWeakWebsite] = useState(false);
  const [fTags, setFTags] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/data/accounts.json').then(r => r.json()),
      fetch('/data/contacts.json').then(r => r.json()),
    ]).then(([accs, cons]) => {
      setAccounts(accs);
      setContacts(cons);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let res = accounts;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(a => a.name.toLowerCase().includes(q) || a.town.toLowerCase().includes(q) || 
        a.postcode.toLowerCase().includes(q) || a.companyNumber.includes(q) || a.industry.toLowerCase().includes(q) ||
        a.sicCode.includes(q) || a.domain.toLowerCase().includes(q));
    }
    if (fIndustry.length) res = res.filter(a => fIndustry.includes(a.industry));
    if (fRevenue.length) res = res.filter(a => fRevenue.includes(a.revenueBand));
    if (fScore.length) res = res.filter(a => fScore.includes(a.scoreLabel));
    if (fWebsite.length) res = res.filter(a => fWebsite.includes(a.websiteQuality.label));
    if (fMinAge > 0) res = res.filter(a => a.companyAge >= fMinAge);
    if (fMaxAge < 25) res = res.filter(a => a.companyAge <= fMaxAge);
    if (fMinEmp > 0) res = res.filter(a => a.employeeCount >= fMinEmp);
    if (fMaxEmp < 500) res = res.filter(a => a.employeeCount <= fMaxEmp);
    if (fLocation) res = res.filter(a => a.town.toLowerCase().includes(fLocation.toLowerCase()) || a.county.toLowerCase().includes(fLocation.toLowerCase()));
    if (fPostcode) res = res.filter(a => a.postcode.toUpperCase().startsWith(fPostcode.toUpperCase()));
    if (fHasPhone) res = res.filter(a => a.phone);
    if (fWeakWebsite) res = res.filter(a => a.websiteQuality.score < 50);
    if (fTags.length) res = res.filter(a => fTags.some(t => a.tags.includes(t)));

    // Sort
    res = [...res].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'score': cmp = a.leadScore - b.leadScore; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'age': cmp = a.companyAge - b.companyAge; break;
        case 'employees': cmp = a.employeeCount - b.employeeCount; break;
        case 'website': cmp = a.websiteQuality.score - b.websiteQuality.score; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return res;
  }, [accounts, search, fIndustry, fRevenue, fScore, fWebsite, fMinAge, fMaxAge, fMinEmp, fMaxEmp, fLocation, fPostcode, fHasPhone, fWeakWebsite, fTags, sortBy, sortDir]);

  const pageData = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const activeFilters = [fIndustry.length, fRevenue.length, fScore.length, fWebsite.length, fMinAge > 0, fMaxAge < 25, fMinEmp > 0, fMaxEmp < 500, fLocation, fPostcode, fHasPhone, fWeakWebsite, fTags.length].filter(Boolean).length;

  const getContacts = (accId: string) => contacts.filter(c => c.accountId === accId);

  const clearFilters = () => {
    setFIndustry([]); setFRevenue([]); setFScore([]); setFWebsite([]);
    setFMinAge(0); setFMaxAge(25); setFMinEmp(0); setFMaxEmp(500);
    setFLocation(''); setFPostcode(''); setFHasPhone(false); setFWeakWebsite(false); setFTags([]);
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const header = 'Company,Number,Industry,Town,Postcode,Age,Employees,Revenue,Score,Website Quality,Phone,Positioning\n';
    const rows = filtered.slice(0, 10000).map(a =>
      `"${a.name}","${a.companyNumber}","${a.industry}","${a.town}","${a.postcode}",${a.companyAge},${a.employeeCount},"${a.revenueBand}",${a.leadScore},"${a.websiteQuality.label}","${a.phone}","${a.outreachPositioning.replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `prospects-${filtered.length}.csv`; a.click();
  };

  const sendBulkEmail = () => {
    const selAccounts = accounts.filter(a => selected.has(a.id));
    const selContacts = contacts.filter(c => selAccounts.some(a => a.id === c.accountId));
    setSendContacts(selContacts as any);
    setShowSendEmail(true);
  };

  // Stats
  const stats = useMemo(() => ({
    total: filtered.length,
    hot: filtered.filter(a => a.scoreLabel === 'hot').length,
    weakWeb: filtered.filter(a => a.websiteQuality.score < 50).length,
    withPhone: filtered.filter(a => a.phone).length,
    avgScore: filtered.length ? Math.round(filtered.reduce((s, a) => s + a.leadScore, 0) / filtered.length) : 0,
  }), [filtered]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      <span className="ml-2 text-xs" style={{ color: 'var(--text-3)' }}>Loading 9,000+ prospects...</span>
    </div>
  );

  return (
    <div className="p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">Prospects</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{accounts.length.toLocaleString()} companies · {contacts.length.toLocaleString()} contacts</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button onClick={sendBulkEmail} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Mail size={12} /> Email {selected.size} selected
            </button>
          )}
          <button onClick={exportCSV} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Showing', value: stats.total.toLocaleString(), icon: Building2, color: 'var(--primary)' },
          { label: 'Hot Leads', value: stats.hot.toLocaleString(), icon: TrendingUp, color: '#ef4444' },
          { label: 'Weak Websites', value: stats.weakWeb.toLocaleString(), icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Have Phone', value: stats.withPhone.toLocaleString(), icon: Phone, color: '#10b981' },
          { label: 'Avg Score', value: `${stats.avgScore}/100`, icon: BarChart3, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon size={12} style={{ color: s.color }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>{s.label}</span>
            </div>
            <p className="text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="input pl-9 text-xs w-full" placeholder="Search companies, towns, postcodes, SIC codes..." style={{ height: 36 }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-xs px-3 flex items-center gap-1.5 relative" style={{ height: 36 }}>
          <SlidersHorizontal size={13} /> Filters
          {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--primary)' }}>{activeFilters}</span>}
        </button>
        <button onClick={() => setFWeakWebsite(!fWeakWebsite)}
          className="text-xs px-3 flex items-center gap-1.5 rounded-lg border"
          style={{ height: 36, background: fWeakWebsite ? 'rgba(245,158,11,0.1)' : 'var(--surface)', borderColor: fWeakWebsite ? '#f59e0b' : 'var(--border)', color: fWeakWebsite ? '#f59e0b' : 'var(--text-2)' }}>
          <AlertTriangle size={12} /> Weak websites
        </button>
        <button onClick={() => setFHasPhone(!fHasPhone)}
          className="text-xs px-3 flex items-center gap-1.5 rounded-lg border"
          style={{ height: 36, background: fHasPhone ? 'rgba(16,185,129,0.1)' : 'var(--surface)', borderColor: fHasPhone ? '#10b981' : 'var(--border)', color: fHasPhone ? '#10b981' : 'var(--text-2)' }}>
          <Phone size={12} /> Has phone
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>Clear all</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text-3)' }}>Industry</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {INDUSTRIES.map(ind => (
                  <label key={ind} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                    <input type="checkbox" checked={fIndustry.includes(ind)} onChange={() => setFIndustry(f => f.includes(ind) ? f.filter(x=>x!==ind) : [...f,ind])} />
                    {ind}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text-3)' }}>Revenue Band</label>
              {REVENUE_BANDS.map(r => (
                <label key={r} className="flex items-center gap-1.5 text-[11px] cursor-pointer mb-1">
                  <input type="checkbox" checked={fRevenue.includes(r)} onChange={() => setFRevenue(f => f.includes(r) ? f.filter(x=>x!==r) : [...f,r])} />
                  {r}
                </label>
              ))}
              <label className="text-[10px] font-bold block mt-3 mb-1" style={{ color: 'var(--text-3)' }}>Lead Score</label>
              {SCORE_LABELS.map(s => (
                <label key={s} className="flex items-center gap-1.5 text-[11px] cursor-pointer mb-1">
                  <input type="checkbox" checked={fScore.includes(s)} onChange={() => setFScore(f => f.includes(s) ? f.filter(x=>x!==s) : [...f,s])} />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={SCORE_COLORS[s]}>{s.replace('_',' ')}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text-3)' }}>Company Age</label>
              <div className="flex gap-2">
                <input type="number" value={fMinAge} onChange={e=>setFMinAge(+e.target.value)} className="input text-[11px] w-full" placeholder="Min" />
                <input type="number" value={fMaxAge} onChange={e=>setFMaxAge(+e.target.value)} className="input text-[11px] w-full" placeholder="Max" />
              </div>
              <label className="text-[10px] font-bold block mt-3 mb-1" style={{ color: 'var(--text-3)' }}>Employees</label>
              <div className="flex gap-2">
                <input type="number" value={fMinEmp} onChange={e=>setFMinEmp(+e.target.value)} className="input text-[11px] w-full" placeholder="Min" />
                <input type="number" value={fMaxEmp} onChange={e=>setFMaxEmp(+e.target.value)} className="input text-[11px] w-full" placeholder="Max" />
              </div>
              <label className="text-[10px] font-bold block mt-3 mb-1" style={{ color: 'var(--text-3)' }}>Website Quality</label>
              {WEB_LABELS.map(w => (
                <label key={w} className="flex items-center gap-1.5 text-[11px] cursor-pointer mb-1">
                  <input type="checkbox" checked={fWebsite.includes(w)} onChange={() => setFWebsite(f => f.includes(w) ? f.filter(x=>x!==w) : [...f,w])} />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={WEB_COLORS[w]}>{w}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text-3)' }}>Location (town/city)</label>
              <input value={fLocation} onChange={e=>setFLocation(e.target.value)} className="input text-[11px] w-full" placeholder="e.g. London, Manchester" />
              <label className="text-[10px] font-bold block mt-3 mb-1" style={{ color: 'var(--text-3)' }}>Postcode prefix</label>
              <input value={fPostcode} onChange={e=>setFPostcode(e.target.value)} className="input text-[11px] w-full" placeholder="e.g. M, B, SW" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th className="w-8 px-3 py-2.5"><input type="checkbox" onChange={e => {
                  if (e.target.checked) setSelected(new Set(pageData.map(a => a.id)));
                  else setSelected(new Set());
                }} checked={pageData.length > 0 && pageData.every(a => selected.has(a.id))} /></th>
                <th className="px-3 py-2.5 text-left font-medium cursor-pointer" style={{ color: 'var(--text-3)' }} onClick={() => toggleSort('name')}>
                  Company {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium" style={{ color: 'var(--text-3)' }}>Contact</th>
                <th className="px-3 py-2.5 text-left font-medium" style={{ color: 'var(--text-3)' }}>Location</th>
                <th className="px-3 py-2.5 text-left font-medium cursor-pointer" style={{ color: 'var(--text-3)' }} onClick={() => toggleSort('age')}>
                  Est. {sortBy === 'age' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium cursor-pointer" style={{ color: 'var(--text-3)' }} onClick={() => toggleSort('score')}>
                  Score {sortBy === 'score' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium cursor-pointer" style={{ color: 'var(--text-3)' }} onClick={() => toggleSort('website')}>
                  Website {sortBy === 'website' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium" style={{ color: 'var(--text-3)' }}>Phone</th>
                <th className="px-3 py-2.5 text-right font-medium" style={{ color: 'var(--text-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(a => {
                const cons = getContacts(a.id);
                const mainContact = cons[0];
                const sc = SCORE_COLORS[a.scoreLabel] || SCORE_COLORS.low_priority;
                const wc = WEB_COLORS[a.websiteQuality.label] || WEB_COLORS.Basic;
                return (
                  <tr key={a.id} className="group cursor-pointer transition-colors" onClick={() => setDetailAccount(a)}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(a.id)} onChange={() => setSelected(s => {
                        const n = new Set(s); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n;
                      })} />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-[12px] leading-tight">{a.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>{a.industry}</span>
                        <span className="text-[9px] mono" style={{ color: 'var(--text-3)' }}>Est. {a.incorporatedYear} ({a.companyAge}yr) · {a.employeeCount} emp · {a.revenueBand}</span>
                      </div>
                      <a href={a.website} target="_blank" onClick={e => e.stopPropagation()} className="text-[10px] flex items-center gap-1 mt-0.5 hover:underline" style={{ color: 'var(--primary)' }}>
                        <Globe size={9} /> {a.domain} <ExternalLink size={8} />
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      {mainContact ? (
                        <div>
                          <p className="text-[11px] font-medium">{mainContact.firstName} {mainContact.lastName}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{mainContact.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>{mainContact.email}</span>
                            {mainContact.linkedin && <a href={mainContact.linkedin} target="_blank" onClick={e => e.stopPropagation()}><Linkedin size={10} style={{ color: '#0077b5' }} /></a>}
                          </div>
                        </div>
                      ) : <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>No contact</span>}
                      {cons.length > 1 && <span className="text-[9px] font-medium mt-0.5 block" style={{ color: 'var(--primary)' }}>+{cons.length - 1} more</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={10} style={{ color: 'var(--text-3)' }} />
                        <span className="text-[11px]">{a.town}</span>
                      </div>
                      <span className="text-[9px] mono" style={{ color: 'var(--text-3)' }}>{a.postcode}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[12px] font-semibold">{a.incorporatedYear}</span>
                      <span className="text-[9px] ml-1" style={{ color: 'var(--text-3)' }}>({a.companyAge}yr)</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">{a.leadScore}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={sc}>{a.scoreLabel.replace('_',' ')}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={wc}>{a.websiteQuality.label} ({a.websiteQuality.score})</span>
                      {a.websiteQuality.issues.length > 0 && (
                        <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-3)' }}>{a.websiteQuality.issues[0]}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {a.phone ? (
                        <a href={`tel:${a.phone}`} onClick={e => e.stopPropagation()} className="text-[11px] flex items-center gap-1 hover:underline" style={{ color: '#10b981' }}>
                          <Phone size={10} /> {a.phone}
                        </a>
                      ) : <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {mainContact && (
                          <button onClick={() => { setSendContacts([mainContact as any]); setShowSendEmail(true); }}
                            className="p-1 rounded" style={{ color: 'var(--primary)' }} title="Send email">
                            <Mail size={13} />
                          </button>
                        )}
                        {a.linkedin && (
                          <a href={a.linkedin} target="_blank" className="p-1 rounded" style={{ color: '#0077b5' }} title="LinkedIn">
                            <Linkedin size={13} />
                          </a>
                        )}
                        <button onClick={() => setDetailAccount(a)} className="p-1 rounded" style={{ color: 'var(--text-3)' }} title="Details">
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          Page {page + 1} of {totalPages.toLocaleString()} · {filtered.length.toLocaleString()} results
        </p>
        <div className="flex gap-1">
          <button onClick={() => setPage(0)} disabled={page === 0} className="btn-secondary text-[10px] py-1 px-2 disabled:opacity-30">First</button>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-[10px] py-1 px-2 disabled:opacity-30">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary text-[10px] py-1 px-2 disabled:opacity-30">Next</button>
          <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="btn-secondary text-[10px] py-1 px-2 disabled:opacity-30">Last</button>
        </div>
      </div>

      {/* Detail panel */}
      {detailAccount && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailAccount(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-xl bg-[var(--bg)] h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 border-b p-4 flex items-start justify-between" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-sm font-bold">{detailAccount.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] mono" style={{ color: 'var(--text-3)' }}>{detailAccount.companyNumber}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={SCORE_COLORS[detailAccount.scoreLabel]}>{detailAccount.scoreLabel.replace('_',' ')}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>{detailAccount.leadScore}/100</span>
                </div>
              </div>
              <button onClick={() => setDetailAccount(null)}><X size={16} style={{ color: 'var(--text-3)' }} /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Company info */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={Building2} label="Industry" value={detailAccount.industry} />
                <InfoCard icon={Calendar} label="Est." value={`${detailAccount.incorporatedYear} (${detailAccount.companyAge}yr)`} />
                <InfoCard icon={Users} label="Employees" value={`~${detailAccount.employeeCount}`} />
                <InfoCard icon={BarChart3} label="Revenue" value={detailAccount.revenueBand} />
                <InfoCard icon={MapPin} label="Location" value={`${detailAccount.town}, ${detailAccount.county} ${detailAccount.postcode}`} />
                <InfoCard icon={Phone} label="Phone" value={detailAccount.phone || 'Not available'} link={detailAccount.phone ? `tel:${detailAccount.phone}` : ''} />
              </div>

              {/* Website */}
              <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>WEBSITE ANALYSIS</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={WEB_COLORS[detailAccount.websiteQuality.label]}>
                    {detailAccount.websiteQuality.label} — {detailAccount.websiteQuality.score}/100
                  </span>
                </div>
                <a href={detailAccount.website} target="_blank" className="text-xs flex items-center gap-1 mb-2 hover:underline" style={{ color: 'var(--primary)' }}>
                  <Globe size={11} /> {detailAccount.website} <ExternalLink size={9} />
                </a>
                {detailAccount.websiteQuality.issues.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {detailAccount.websiteQuality.issues.map((issue, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                        <AlertTriangle size={8} className="inline mr-0.5" />{issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Outreach positioning */}
              <div className="rounded-lg p-3" style={{ background: 'rgba(91,110,249,0.05)', border: '1px solid rgba(91,110,249,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                  <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>OUTREACH POSITIONING</span>
                </div>
                <p className="text-[12px]" style={{ lineHeight: 1.5 }}>{detailAccount.outreachPositioning}</p>
              </div>

              {/* Insights */}
              <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="text-[10px] font-bold block mb-2" style={{ color: 'var(--text-3)' }}>COMPANY INSIGHTS</span>
                {detailAccount.insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle size={10} className="mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
                    <p className="text-[11px]">{ins}</p>
                  </div>
                ))}
              </div>

              {/* Contacts */}
              <div>
                <span className="text-[10px] font-bold block mb-2" style={{ color: 'var(--text-3)' }}>
                  CONTACTS ({getContacts(detailAccount.id).length})
                </span>
                {getContacts(detailAccount.id).map(con => (
                  <div key={con.id} className="rounded-lg p-3 mb-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold">{con.firstName} {con.lastName}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{con.title} · {con.department}</p>
                      </div>
                      <button onClick={() => { setSendContacts([con as any]); setShowSendEmail(true); }}
                        className="btn-primary text-[9px] py-1 px-2 flex items-center gap-1">
                        <Mail size={9} /> Email
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                      <span style={{ color: 'var(--text-3)' }}>{con.email}</span>
                      {(con as any).phone && <a href={`tel:${(con as any).phone}`} className="flex items-center gap-0.5" style={{ color: '#10b981' }}><Phone size={9} />{(con as any).phone}</a>}
                      {(con as any).linkedin && <a href={(con as any).linkedin} target="_blank" className="flex items-center gap-0.5" style={{ color: '#0077b5' }}><Linkedin size={9} />LinkedIn</a>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {detailAccount.tags.map(t => (
                  <span key={t} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSendEmail && (
        <SendEmailModal
          contact={sendContacts.length === 1 ? sendContacts[0] : null}
          contacts={sendContacts.length > 1 ? sendContacts : undefined}
          onClose={() => { setShowSendEmail(false); setSendContacts([]); }}
        />
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: string }) {
  const inner = (
    <div className="rounded-lg p-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-1 mb-0.5"><Icon size={10} style={{ color: 'var(--text-3)' }} /><span className="text-[9px] font-medium" style={{ color: 'var(--text-3)' }}>{label}</span></div>
      <p className="text-[12px] font-medium">{value}</p>
    </div>
  );
  return link ? <a href={link} className="hover:opacity-80">{inner}</a> : inner;
}
