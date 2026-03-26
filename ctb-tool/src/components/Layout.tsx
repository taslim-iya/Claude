import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
