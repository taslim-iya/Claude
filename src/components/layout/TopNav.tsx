import { Search, Bell, Plus, Command, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export default function TopNav() {
  const { setShowCmd } = useApp();
  const { theme, toggle } = useTheme();

  const btnStyle = {
    color: 'var(--text-3)',
    borderRadius: '0.5rem',
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--sidebar-border)' }}>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Cmd+K search */}
        <button onClick={() => setShowCmd(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all"
          style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
          <Search size={12} />
          <span>Search...</span>
          <span className="flex items-center gap-0.5 ml-1 font-mono text-[10px] px-1 py-0.5 rounded"
            style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
            <Command size={9} />K
          </span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={btnStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={btnStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        {/* New lead */}
        <button className="btn-primary text-xs" title="Cmd+N">
          <Plus size={13} />New
        </button>
      </div>
    </header>
  );
}
