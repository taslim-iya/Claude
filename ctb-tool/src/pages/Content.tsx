import { useState } from 'react';
import { store, generateId } from '../lib/store';
import type { SavedContent } from '../lib/types';
import { Search, Bookmark, Sparkles, Link2, Video } from 'lucide-react';

const demoResults = [
  { videoId: 'demo1', title: 'Ultimate China Street Food Tour - Beijing', channel: 'Food Ranger', views: '5.2M' },
  { videoId: 'demo2', title: 'Great Wall of China - Everything You Need to Know', channel: 'Lost LeBlanc', views: '3.8M' },
  { videoId: 'demo3', title: 'Shanghai in 48 Hours - Travel Guide', channel: 'Kara & Nate', views: '2.1M' },
  { videoId: 'demo4', title: 'Chengdu Panda Base & Sichuan Food Vlog', channel: 'Mark Wiens', views: '4.5M' },
  { videoId: 'demo5', title: "Xi'an Terracotta Warriors - Full Experience", channel: 'Rick Steves', views: '1.9M' },
  { videoId: 'demo6', title: "Chinese Night Markets You Can't Miss", channel: 'Strictly Dumpling', views: '6.7M' },
  { videoId: 'demo7', title: 'How to Travel China on a Budget', channel: 'Gabriel Traveler', views: '890K' },
  { videoId: 'demo8', title: 'Top 10 Hidden Gems in China', channel: 'Indigo Traveller', views: '1.5M' },
];

const statusColors: Record<string, string> = {
  saved: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  scheduled: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  posted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

export default function ContentPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof demoResults>([]);
  const [saved, setSaved] = useState(() => store.content.getAll());
  const [tab, setTab] = useState<'search' | 'saved'>('search');
  const [searching, setSearching] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');

  const searchVideos = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = demoResults.filter(r => r.title.toLowerCase().includes(q) || r.channel.toLowerCase().includes(q));
      setResults(filtered.length > 0 ? filtered : demoResults);
      setSearching(false);
    }, 600);
  };

  const saveVideo = (r: typeof demoResults[0]) => {
    const item: SavedContent = {
      id: generateId(), title: r.title, url: `https://youtube.com/watch?v=${r.videoId}`,
      thumbnail: '', channel: r.channel, views: r.views, status: 'saved', captions: {}, addedAt: new Date().toISOString(),
    };
    const updated = [...saved, item];
    store.content.save(updated);
    setSaved(updated);
  };

  const addManual = () => {
    if (!manualUrl) return;
    const item: SavedContent = {
      id: generateId(), title: manualTitle || manualUrl, url: manualUrl,
      thumbnail: '', channel: 'Manual', views: 'N/A', status: 'saved', captions: {}, addedAt: new Date().toISOString(),
    };
    const updated = [...saved, item];
    store.content.save(updated);
    setSaved(updated);
    setManualUrl(''); setManualTitle('');
  };

  const updateStatus = (id: string, status: string) => {
    const updated = saved.map(s => s.id === id ? { ...s, status } : s);
    store.content.save(updated);
    setSaved(updated);
  };

  const generateCaptions = (id: string) => {
    const item = saved.find(s => s.id === id);
    if (!item) return;
    const captions = {
      instagram: `\ud83c\udde8\ud83c\uddf3 ${item.title} | Have you experienced this? Drop a \u2764\ufe0f if China is on your bucket list! #ChinaTravel #TravelChina #CTB #ExploreChina`,
      tiktok: `POV: You're exploring China and find THIS \ud83e\udd2f #chinatravel #travelchina #ctb #bucketlist #fyp`,
      twitter: `${item.title} \ud83c\udde8\ud83c\uddf3\n\nChina never stops surprising us. This is why we do what we do.\n\n#ChinaTravel #CTB`,
    };
    const updated = saved.map(s => s.id === id ? { ...s, captions } : s);
    store.content.save(updated);
    setSaved(updated);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Content Bank</h1>
        <p className="text-gray-500 text-sm mt-1">Discover and manage video content for social media</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('search')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'search' ? 'bg-ctb-red text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Search size={14} /> Search
        </button>
        <button onClick={() => setTab('saved')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'saved' ? 'bg-ctb-red text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Bookmark size={14} /> Saved ({saved.length})
        </button>
      </div>

      {tab === 'search' && (
        <>
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchVideos()} placeholder="Search videos (e.g. China street food, Great Wall tips)" className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
            </div>
            <button onClick={searchVideos} disabled={searching} className="bg-ctb-red text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-200">
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {results.map(r => (
                <div key={r.videoId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <Video size={32} className="text-gray-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-ctb-red border-b-[6px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{r.title}</h3>
                    <p className="text-xs text-gray-500">{r.channel} &middot; {r.views} views</p>
                    <button onClick={() => saveVideo(r)} className="mt-3 w-full bg-gradient-to-r from-ctb-gold to-amber-500 text-white py-2 rounded-xl text-xs font-semibold hover:from-amber-500 hover:to-amber-600 transition-all flex items-center justify-center gap-1">
                      <Bookmark size={12} /> Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Link2 size={16} className="text-ctb-red" /> Add Video Manually</h3>
            <div className="flex gap-3">
              <input value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="Paste URL (YouTube, TikTok, etc.)" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
              <input value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Title (optional)" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ctb-red/20 focus:border-ctb-red focus:outline-none" />
              <button onClick={addManual} className="bg-ctb-red text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Add</button>
            </div>
          </div>
        </>
      )}

      {tab === 'saved' && (
        <div className="space-y-4">
          {saved.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-36 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Video size={24} className="text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{s.title}</h3>
                      <p className="text-sm text-gray-500">{s.channel} &middot; {s.views} views</p>
                    </div>
                    <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[s.status] || ''}`}>
                      <option value="saved">Saved</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="posted">Posted</option>
                    </select>
                  </div>

                  {Object.keys(s.captions).length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {Object.entries(s.captions).map(([platform, caption]) => (
                        <div key={platform} className="bg-gray-50/80 rounded-xl p-3">
                          <span className="text-[10px] font-bold text-ctb-red uppercase tracking-wider">{platform}</span>
                          <p className="text-xs text-gray-700 mt-1 leading-relaxed">{caption}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => generateCaptions(s.id)} className="mt-3 text-sm font-semibold text-ctb-gold hover:text-amber-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                      <Sparkles size={14} /> Generate AI Captions
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {saved.length === 0 && <p className="text-center py-12 text-gray-400">No saved content yet. Search and save videos above.</p>}
        </div>
      )}
    </div>
  );
}
