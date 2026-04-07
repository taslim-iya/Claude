import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, UserCircle, List,
  Mail, Workflow, Inbox, GitBranch, CheckSquare,
  Plug, CreditCard, Settings, ChevronRight, Zap
} from 'lucide-react';

const nav = [
  { section: null, items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'Prospecting', items: [
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/accounts', label: 'Accounts', icon: Building2 },
    { to: '/contacts', label: 'Contacts', icon: UserCircle },
    { to: '/lists', label: 'Lists', icon: List },
  ]},
  { section: 'Outreach', items: [
    { to: '/campaigns', label: 'Campaigns', icon: Mail },
    { to: '/sequences', label: 'Sequences', icon: Workflow },
    { to: '/outreach', label: 'Outreach Center', icon: Inbox },
  ]},
  { section: 'Revenue', items: [
    { to: '/pipeline', label: 'Pipeline', icon: GitBranch },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  ]},
  { section: 'Settings', items: [
    { to: '/integrations', label: 'Integrations', icon: Plug },
    { to: '/billing', label: 'Billing', icon: CreditCard },
    { to: '/team', label: 'Team', icon: Settings },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ]},
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={{ width: 220, minWidth: 220, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      className="h-full flex flex-col overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#5b6ef9' }}>
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-bold text-white text-sm tracking-tight">ProspectIQ</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-5">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to);
                return (
                  <NavLink key={to} to={to}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all relative group"
                    style={{
                      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                      background: active ? 'rgba(91,110,249,0.12)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                        style={{ background: '#5b6ef9' }} />
                    )}
                    <Icon size={15} style={{ color: active ? '#5b6ef9' : 'inherit', flexShrink: 0 }} />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user pill */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>SM</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Sarah Miller</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>Growth Plan</p>
          </div>
          <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
