import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, FileText, Headphones, Star, Film, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/itineraries', label: 'Itineraries', icon: Map },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/support', label: 'Support', icon: Headphones },
  { href: '/experiences', label: 'Experiences', icon: Star },
  { href: '/content', label: 'Content Bank', icon: Film },
  { href: '/tools', label: 'Quick Tools', icon: Wrench },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-ctb-dark min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 border-r border-gray-800/50`}>
      <div className={`p-4 border-b border-gray-800/50 ${collapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ctb-red to-red-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-red-900/30">
            CTB
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">China Travel</h1>
              <p className="text-ctb-gold text-xs font-semibold tracking-wider uppercase">Buddy</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-3 px-2">
        <div className={`${collapsed ? '' : 'px-2'} mb-2`}>
          {!collapsed && <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-2">Navigation</p>}
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-0.5 ${
                isActive
                  ? 'bg-ctb-red text-white font-medium shadow-lg shadow-red-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 py-2 rounded-lg hover:bg-white/5 transition-colors text-xs"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
        </button>
        {!collapsed && <p className="text-gray-600 text-[10px] text-center mt-2">CTB Internal Tool v2.0</p>}
      </div>
    </aside>
  );
}
