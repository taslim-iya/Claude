import { NavLink } from 'react-router-dom';
import { BarChart2, Users, Building2, Target, ListChecks, Megaphone, GitBranch, Inbox, Kanban, CheckSquare, Settings, Plug, CreditCard, User, Zap, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { section: 'Main', items: [
    { label: 'Dashboard', to: '/dashboard', icon: BarChart2 },
    { label: 'Leads', to: '/leads', icon: Target },
    { label: 'Accounts', to: '/accounts', icon: Building2 },
    { label: 'Contacts', to: '/contacts', icon: Users },
    { label: 'Lists', to: '/lists', icon: ListChecks },
  ]},
  { section: 'Sales', items: [
    { label: 'Campaigns', to: '/campaigns', icon: Megaphone },
    { label: 'Sequences', to: '/campaigns/sequence', icon: GitBranch },
    { label: 'Outreach', to: '/outreach', icon: Inbox },
    { label: 'Pipeline', to: '/pipeline', icon: Kanban },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  ]},
  { section: 'Settings', items: [
    { label: 'Team', to: '/team', icon: Settings },
    { label: 'Integrations', to: '/integrations', icon: Plug },
    { label: 'Billing', to: '/billing', icon: CreditCard },
    { label: 'Profile', to: '/profile', icon: User },
  ]},
];

export default function Sidebar({ open }: { open: boolean }) {
  return (
    <aside className={clsx('fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 transition-all duration-200', open ? 'w-56' : 'w-14')}>
      {/* Logo */}
      <div className={clsx('flex items-center gap-2.5 border-b border-slate-800 py-3.5', open ? 'px-4' : 'px-3 justify-center')}>
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {open && <span className="text-white font-bold text-sm tracking-tight">ProspectIQ</span>}
      </div>

      {/* Workspace badge */}
      {open && (
        <div className="mx-3 my-2 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-700 transition-colors">
          <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
          <span className="text-slate-300 text-xs font-medium flex-1 truncate">Acme Sales Co</span>
          <ChevronDown size={12} className="text-slate-500" />
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {nav.map(group => (
          <div key={group.section} className="mb-4">
            {open && <p className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">{group.section}</p>}
            <div className="space-y-0.5">
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={!open ? label : undefined}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all',
                    open ? 'px-3 py-2' : 'px-0 py-2 justify-center',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  )}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {open && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User */}
      <div className={clsx('border-t border-slate-800 p-3', open ? '' : 'flex justify-center')}>
        <div className={clsx('flex items-center gap-2', open ? '' : 'justify-center')}>
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">SM</div>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">Sarah Miller</p>
              <p className="text-slate-500 text-xs">Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
