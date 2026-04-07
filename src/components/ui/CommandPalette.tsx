import { useState, useEffect, useRef } from 'react';
import { Search, Target, Building2, Users, Megaphone, Kanban, CheckSquare, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const staticRoutes = [
  { label:'Dashboard', to:'/dashboard', icon:Search },
  { label:'Leads', to:'/leads', icon:Target },
  { label:'Accounts', to:'/accounts', icon:Building2 },
  { label:'Contacts', to:'/contacts', icon:Users },
  { label:'Campaigns', to:'/campaigns', icon:Megaphone },
  { label:'Pipeline', to:'/pipeline', icon:Kanban },
  { label:'Tasks', to:'/tasks', icon:CheckSquare },
];

export default function CommandPalette() {
  const { showCmd, setShowCmd, contacts, accounts, campaigns } = useApp();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { if (showCmd) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50); } }, [showCmd]);

  if (!showCmd) return null;

  const lq = q.toLowerCase();
  const routes = staticRoutes.filter(r => !q || r.label.toLowerCase().includes(lq));
  const matchContacts = q ? contacts.filter(c => `${c.firstName} ${c.lastName} ${c.accountName}`.toLowerCase().includes(lq)).slice(0,4) : [];
  const matchAccounts = q ? accounts.filter(a => a.name.toLowerCase().includes(lq)).slice(0,3) : [];
  const matchCampaigns = q ? campaigns.filter(c => c.name.toLowerCase().includes(lq)).slice(0,3) : [];

  const go = (path: string) => { navigate(path); setShowCmd(false); };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]" onClick={() => setShowCmd(false)}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />
      <div className="relative w-full max-w-xl mx-4 bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-modal animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1a1a1a]">
          <Search size={15} className="text-[#52525b] flex-shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search leads, accounts, pages…" className="flex-1 bg-transparent text-sm text-white placeholder-[#52525b] outline-none" />
          <kbd className="kbd">ESC</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto py-2">
          {routes.length > 0 && (
            <div>
              <p className="section-title px-4 pt-2 pb-1.5">Pages</p>
              {routes.map(r => { const Icon = r.icon; return (
                <button key={r.to} onClick={() => go(r.to)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left group">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] group-hover:bg-[#222] flex items-center justify-center flex-shrink-0"><Icon size={13} className="text-[#71717a]" /></div>
                  <span className="text-sm text-[#e4e4e7]">{r.label}</span>
                  <ArrowRight size={12} className="ml-auto text-[#333] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );})}
            </div>
          )}
          {matchAccounts.length > 0 && (
            <div>
              <p className="section-title px-4 pt-3 pb-1.5">Accounts</p>
              {matchAccounts.map(a => (
                <button key={a.id} onClick={() => go('/accounts')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-[#71717a] flex-shrink-0">{a.name[0]}</div>
                  <div><p className="text-sm text-[#e4e4e7]">{a.name}</p><p className="text-xs text-[#52525b]">{a.industry}</p></div>
                </button>
              ))}
            </div>
          )}
          {matchContacts.length > 0 && (
            <div>
              <p className="section-title px-4 pt-3 pb-1.5">Contacts</p>
              {matchContacts.map(c => (
                <button key={c.id} onClick={() => go('/contacts')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5b6ef9] to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.firstName[0]}{c.lastName[0]}</div>
                  <div><p className="text-sm text-[#e4e4e7]">{c.firstName} {c.lastName}</p><p className="text-xs text-[#52525b]">{c.title} · {c.accountName}</p></div>
                </button>
              ))}
            </div>
          )}
          {matchCampaigns.length > 0 && (
            <div>
              <p className="section-title px-4 pt-3 pb-1.5">Campaigns</p>
              {matchCampaigns.map(c => (
                <button key={c.id} onClick={() => go('/campaigns')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0"><Megaphone size={12} className="text-[#71717a]" /></div>
                  <p className="text-sm text-[#e4e4e7]">{c.name}</p>
                </button>
              ))}
            </div>
          )}
          {!routes.length && !matchAccounts.length && !matchContacts.length && !matchCampaigns.length && (
            <div className="text-center py-10 text-[#52525b] text-sm">No results for "{q}"</div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-[#1a1a1a] flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#52525b]"><kbd className="kbd">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1.5 text-xs text-[#52525b]"><kbd className="kbd">↵</kbd> open</span>
          <span className="flex items-center gap-1.5 text-xs text-[#52525b]"><kbd className="kbd">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
