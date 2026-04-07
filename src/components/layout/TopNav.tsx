import { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Plus, Command, Sun, Moon,
  Users, UserCircle, List, Mail, Workflow, Briefcase, CheckSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

const NOTIFS = [
  { id: 'n1', type: 'reply',         color: '#10b981', title: 'Jordan Lee replied to your email',              sub: "Thanks for reaching out! I'd love to learn more...",  time: '2 min ago',   unread: true  },
  { id: 'n2', type: 'qualification', color: '#f59e0b', title: 'AI qualified Marcus Johnson as Hot Lead',        sub: 'Lead score jumped to 94',                             time: '15 min ago',  unread: true  },
  { id: 'n3', type: 'meeting',       color: '#5b6ef9', title: 'Meeting request from Emily Chen',                sub: 'Wants to schedule a 30-min call',                     time: '1 hour ago',  unread: true  },
  { id: 'n4', type: 'campaign',      color: '#f97316', title: "Campaign 'Q1 Fintech Outreach' hit 40% open rate", sub: 'Above your 30% target',                            time: '2 hours ago', unread: false },
  { id: 'n5', type: 'bounce',        color: '#6b7280', title: "3 emails bounced in 'SaaS Scale-Up'",           sub: 'Review recommended',                                  time: '1 day ago',   unread: false },
];

const NEW_ITEMS = [
  { icon: Users,       label: 'New Lead',     shortcut: '⌘L',  path: '/leads?openAdd=true'      },
  { icon: UserCircle,  label: 'New Contact',  shortcut: '⌘C',  path: '/contacts?openAdd=true'   },
  { icon: List,        label: 'New List',     shortcut: '⌘⇧L', path: '/lists?openAdd=true'      },
  { icon: Mail,        label: 'New Campaign', shortcut: '⌘M',  path: '/campaigns?openAdd=true'  },
  { icon: Workflow,    label: 'New Sequence', shortcut: '⌘S',  path: '/sequences'               },
  { icon: Briefcase,   label: 'New Deal',     shortcut: '⌘D',  path: '/pipeline?openAdd=true'   },
  { icon: CheckSquare, label: 'New Task',     shortcut: '⌘T',  path: '/tasks?openAdd=true'      },
];

export default function TopNav() {
  const { setShowCmd } = useApp();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [showNew, setShowNew] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  useEffect(() => {
    if (!showNew) return;
    const handler = (e: MouseEvent) => {
      if (newRef.current && !newRef.current.contains(e.target as Node)) {
        setShowNew(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNew]);

  const unreadCount = NOTIFS.filter(n => n.unread && !readIds.has(n.id)).length;

  const btnStyle = {
    color: 'var(--text-3)',
    borderRadius: '0.5rem',
  };

  return (
    <header
      className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--sidebar-border)' }}
    >
      <div className="flex-1" />

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Cmd+K search */}
        <button
          onClick={() => setShowCmd(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all"
          style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <Search size={12} />
          <span>Search...</span>
          <span
            className="flex items-center gap-0.5 ml-1 font-mono text-[10px] px-1 py-0.5 rounded"
            style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}
          >
            <Command size={9} />K
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={btnStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={btnStyle}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 14,
                  height: 14,
                  borderRadius: 7,
                  background: '#5b6ef9',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '0 2px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 360,
                maxHeight: 480,
                overflowY: 'auto',
                zIndex: 50,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Notifications</span>
                <button
                  onClick={() => setReadIds(new Set(NOTIFS.map(n => n.id)))}
                  style={{ fontSize: 11, color: '#5b6ef9', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              </div>

              {/* Notification items */}
              {NOTIFS.map(n => {
                const isUnread = n.unread && !readIds.has(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setReadIds(s => { const ns = new Set(s); ns.add(n.id); return ns; })}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: isUnread ? 'rgba(91,110,249,0.04)' : 'transparent',
                      borderLeft: isUnread ? '3px solid #5b6ef9' : '3px solid transparent',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: n.color,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 2 }}>{n.sub}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* + New dropdown */}
        <div ref={newRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 transition-all"
            style={{ background: '#5b6ef9', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            title="Cmd+N"
          >
            <Plus size={13} />
            New
          </button>

          {showNew && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 240,
                zIndex: 50,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                padding: '4px 0',
              }}
            >
              {NEW_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.path.split('?')[0]); setShowNew(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '9px 14px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <Icon size={14} style={{ color: '#5b6ef9', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{item.shortcut}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
