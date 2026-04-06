import { Bell, Search, Plus, ChevronDown, Menu } from 'lucide-react';

export default function TopNav({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="h-13 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-10" style={{height:'52px'}}>
      <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0">
        <Menu size={17} />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search leads, accounts, campaigns..."
          className="w-full pl-8 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer group">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">SM</div>
          <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
