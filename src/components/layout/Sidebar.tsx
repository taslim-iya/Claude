import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, Users, Building2, UserCircle, List,
  Mail, Workflow, Inbox, BarChart2, Activity,
  GitBranch, CheckSquare, AlertOctagon, Zap,
  Plug, CreditCard, Settings, ChevronRight, Target,
  Sparkles, UserCheck, Calendar, LogOut
} from 'lucide-react';

const nav = [
  { section: null, items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'Prospecting', items: [
    { to: '/leads',    label: 'Leads',    icon: Users },
    { to: '/accounts', label: 'Accounts', icon: Building2 },
    { to: '/contacts', label: 'Contacts', icon: UserCircle },
    { to: '/lists',    label: 'Lists',    icon: List },
  ]},
  { section: 'Outreach', items: [
    { to: '/campaigns',    label: 'Campaigns',      icon: Mail },
    { to: '/sequences',    label: 'Sequences',      icon: Workflow },
    { to: '/outreach',     label: 'Outreach Center',icon: Inbox },
    { to: '/analytics',    label: 'Analytics',      icon: BarChart2 },
    { to: '/email-health', label: 'Email Health',   icon: Activity },
    { to: '/bounces',      label: 'Bounces',        icon: AlertOctagon },
  ]},
  { section: 'Revenue', items: [
    { to: '/pipeline', label: 'Pipeline', icon: GitBranch },
    { to: '/tasks',    label: 'Tasks',    icon: CheckSquare },
  ]},
  { section: 'Intelligence', items: [
    { to: '/ai-automation',    label: 'AI Automation',    icon: Sparkles },
    { to: '/ai-qualification', label: 'Qualification',    icon: UserCheck },
    { to: '/meetings',         label: 'Meetings',         icon: Calendar },
  ]},
  { section: 'Settings', items: [
    { to: '/lead-scoring',  label: 'Lead Scoring', icon: Target },
    { to: '/integrations',  label: 'Integrations', icon: Plug },
    { to: '/billing',       label: 'Billing',      icon: CreditCard },
    { to: '/team',          label: 'Team',         icon: Settings },
    { to: '/profile',       label: 'Profile',      icon: UserCircle },
  ]},
];

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const location = useLocation();
  const { profile, currentPlan } = useApp();

  return (
    <aside style={{ width: 224, minWidth: 224, background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)', transition: 'background-color 300ms ease, border-color 300ms ease' }}
      className="h-full flex flex-col overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow"
          style={{ background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>
          <Zap size={14} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>ProspectIQ</span>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 pb-4 space-y-5">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <p className="section-title px-2 mb-1.5">{group.section}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to);
                return (
                  <NavLink key={to} to={to}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all relative"
                    style={{
                      color: active ? '#5b6ef9' : 'var(--text-3)',
                      background: active ? 'var(--accent-dim)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; } }}>
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                        style={{ background: '#5b6ef9' }} />
                    )}
                    <Icon size={15} style={{ flexShrink: 0, color: active ? '#5b6ef9' : 'inherit' }} />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User pill */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all"
          style={{ background: 'var(--surface-2)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>
            {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{profile.name || 'Your Account'}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>{currentPlan} Plan</p>
          </div>
          <ChevronRight size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        </div>
      </div>

      {onLogout && (
        <div className="px-3 pb-3">
          <button onClick={onLogout}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
