import { store } from '../lib/store';
import { Users, Plane, Mail, Headphones, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors: Record<string, string> = {
  inquiry: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  planning: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  booked: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'on-trip': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  completed: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
};

export default function Dashboard() {
  const clients = store.clients.getAll();
  const support = store.support.getAll();
  const totalClients = clients.length;
  const activeTrips = clients.filter(c => c.status === 'on-trip').length;
  const pendingInquiries = clients.filter(c => c.status === 'inquiry').length;
  const openTickets = support.filter(s => s.status === 'open').length;

  const upcomingTrips = clients
    .filter(c => ['booked', 'planning'].includes(c.status))
    .sort((a, b) => a.tripDates.localeCompare(b.tripDates));

  const recentActivity = [
    ...clients.map(c => ({ type: 'client' as const, text: `${c.name} - Status: ${c.status}`, date: c.createdAt, name: c.name })),
    ...support.map(s => ({ type: 'support' as const, text: `Support: ${s.description.slice(0, 60)}...`, date: s.timestamp, name: s.clientName })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const stats = [
    { label: 'Total Clients', value: totalClients, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Trips', value: activeTrips, icon: Plane, color: 'from-ctb-red to-red-700', bg: 'bg-red-50' },
    { label: 'Pending Inquiries', value: pendingInquiries, icon: Mail, color: 'from-ctb-gold to-amber-600', bg: 'bg-amber-50' },
    { label: 'Open Tickets', value: openTickets, icon: Headphones, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here's your travel business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-ctb-red" /> Recent Activity
            </h2>
            <Link to="/clients" className="text-xs font-medium text-ctb-red hover:text-red-700">View all</Link>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'client' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {item.type === 'client' ? <Users size={14} /> : <Headphones size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-ctb-gold" /> Upcoming Trips
            </h2>
            <Link to="/itineraries" className="text-xs font-medium text-ctb-red hover:text-red-700">View all</Link>
          </div>
          <div className="space-y-1">
            {upcomingTrips.map(client => (
              <div key={client.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {client.destinations.join(', ')} &middot; {client.tripDates}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[client.status] || ''}`}>
                  {client.status}
                </span>
              </div>
            ))}
            {upcomingTrips.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No upcoming trips</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
