import { Search, Bell, Plus, Command } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  title?: string;
}

export default function TopNav({ title }: Props) {
  const { setShowCmd } = useApp();

  return (
    <header className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

      {title && (
        <h1 className="text-sm font-semibold text-white">{title}</h1>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Cmd+K trigger */}
        <button
          onClick={() => setShowCmd(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <Search size={12} />
          <span>Search...</span>
          <span className="flex items-center gap-0.5 ml-2 font-mono text-[10px] px-1 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
            <Command size={9} />K
          </span>
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#5b6ef9' }} />
        </button>

        {/* New lead shortcut */}
        <button
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: '#5b6ef9', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#4a5de8'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#5b6ef9'}
          title="Cmd+N">
          <Plus size={13} />
          New
        </button>
      </div>
    </header>
  );
}
