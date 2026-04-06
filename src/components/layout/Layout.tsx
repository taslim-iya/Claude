import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={open} />
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-200 ${open ? 'ml-56' : 'ml-14'}`}>
        <TopNav onToggle={() => setOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
