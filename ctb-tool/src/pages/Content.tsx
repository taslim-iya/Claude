import { useState } from 'react';
import { store, generateId } from '../lib/store';
import type { SavedContent } from '../lib/types';
import { Search, Bookmark, Sparkles, Link2, Video, BrainCircuit, Settings, Loader2, X, Wand2, ExternalLink, Trash2 } from 'lucide-react';

interface AiContentSuggestion {
  id: string;
  title: string;
  description: string;
  platform: string;
  searchQuery: string;
  contentType: string;
  whyRelevant: string;
}

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

const platformColors: Record<string, string> = {
  YouTube: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  TikTok: 'bg-gray-900 text-white',
  Instagram: 'bg-pink-50 text-pink-700 ring-1 ring-pink-200',
  Twitter: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  Blog: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
};

function getApiKey(): string {
  return localStorage.getItem('ctb_ai_api_key') || '';
}
function setApiKey(key: string) {
  localStorage.setItem('ctb_ai_api_key', key);
}
function getApiProvider(): string {
  return localStorage.getItem('ctb_ai_provider') || 'anthropic';
}
function setApiProvider(provider: string) {
  localStorage.setItem('ctb_ai_provider', provider);
}

async function callAI(prompt: string): Promise<string> {
  const key = getApiKey();
  const provider = getApiProvider();
  if (!key) throw new Error('No API key configured');

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${res.status} - ${err}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${res.status} - ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

export default function ContentPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof demoResults>([]);
  const [saved, setSaved] = useState(() => store.content.getAll());
  const [tab, setTab] = useState<'ai-discover' | 'search' | 'saved'>('ai-discover');
  const [searching, setSearching] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');

  // AI discover state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiContentSuggestion[]>([]);
  const [aiError, setAiError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(() => getApiKey());
  const [tempProvider, setTempProvider] = useState(() => getApiProvider());
  // AI caption generation state
  const [captionLoading, setCaptionLoading] = useState<string | null>(null);

  const hasApiKey = !!getApiKey();

  const aiDiscover = async () => {
    if (!aiPrompt.trim()) return;
    if (!hasApiKey) { setShowSettings(true); return; }

    setAiLoading(true);
    setAiError('');
    setAiSuggestions([]);

    try {
      const prompt = `You are a content strategist for China Travel Buddy (CTB), a UK-based China travel consultancy. Based on the following content brief, suggest 6-8 specific pieces of content to find or create for social media.

Content Brief: "${aiPrompt}"

For each suggestion, provide:
- title: A specific, compelling title
- description: 2-3 sentence description of what this content should cover
- platform: Best platform (YouTube, TikTok, Instagram, Twitter, or Blog)
- searchQuery: An exact search query to find similar existing content online
- contentType: Type (e.g. "vlog", "guide", "listicle", "review", "behind-the-scenes", "tips", "reaction", "compilation")
- whyRelevant: One sentence on why this would perform well for a China travel audience

Return ONLY a valid JSON array of objects. No markdown, no code fences, just the JSON array.`;

      const response = await callAI(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Omit<AiContentSuggestion, 'id'>[];
        setAiSuggestions(parsed.map(s => ({ ...s, id: generateId() })));
      } else {
        throw new Error('Could not parse AI response');
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAiLoading(false);
    }
  };

  const saveSuggestion = (s: AiContentSuggestion) => {
    const item: SavedContent = {
      id: generateId(), title: s.title,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(s.searchQuery)}`,
      thumbnail: '', channel: `AI: ${s.contentType}`, views: s.platform,
      status: 'saved', captions: {}, addedAt: new Date().toISOString(),
    };
    const updated = [...saved, item];
    store.content.save(updated);
    setSaved(updated);
  };

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

  const deleteContent = (id: string) => {
    const updated = saved.filter(s => s.id !== id);
    store.content.save(updated);
    setSaved(updated);
  };

  const generateCaptions = async (id: string) => {
    const item = saved.find(s => s.id === id);
    if (!item) return;

    // If we have an API key, use AI for real captions
    if (hasApiKey) {
      setCaptionLoading(id);
      try {
        const prompt = `You are a social media manager for China Travel Buddy (CTB), a UK-based China travel consultancy. Generate social media captions for this content:

Title: "${item.title}"
Channel: ${item.channel}

Generate captions for 3 platforms. Each caption should be engaging, include relevant emojis, and include hashtags. Keep the CTB brand voice: knowledgeable, friendly, passionate about China travel.

Return ONLY a JSON object with these keys: "instagram", "tiktok", "twitter". Each value is the caption string. No markdown, no code fences.`;

        const response = await callAI(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const captions = JSON.parse(jsonMatch[0]);
          const updated = saved.map(s => s.id === id ? { ...s, captions } : s);
          store.content.save(updated);
          setSaved(updated);
        }
      } catch {
        // Fall back to template captions
        fallbackCaptions(id, item.title);
      } finally {
        setCaptionLoading(null);
      }
    } else {
      fallbackCaptions(id, item.title);
    }
  };

  const fallbackCaptions = (id: string, title: string) => {
    const captions = {
      instagram: `\ud83c\udde8\ud83c\uddf3 ${title} | Have you experienced this? Drop a \u2764\ufe0f if China is on your bucket list! #ChinaTravel #TravelChina #CTB #ExploreChina`,
      tiktok: `POV: You're exploring China and find THIS \ud83e\udd2f #chinatravel #travelchina #ctb #bucketlist #fyp`,
      twitter: `${title} \ud83c\udde8\ud83c\uddf3\n\nChina never stops surprising us. This is why we do what we do.\n\n#ChinaTravel #CTB`,
    };
    const updated = saved.map(s => s.id === id ? { ...s, captions } : s);
    store.content.save(updated);
    setSaved(updated);
  };

  const saveSettings = () => {
    setApiKey(tempApiKey);
    setApiProvider(tempProvider);
    setShowSettings(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Content Bank</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered content discovery and management</p>
        </div>
        <button onClick={() => { setTempApiKey(getApiKey()); setTempProvider(getApiProvider()); setShowSettings(true); }}
          className={`p-2.5 rounded-xl transition-colors ${hasApiKey ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ring-1 ring-emerald-200' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 ring-1 ring-orange-200'}`}
          title={hasApiKey ? 'AI Connected' : 'Configure AI API Key'}>
          <Settings size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('ai-discover')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'ai-discover' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <BrainCircuit size={14} /> AI Discover
        </button>
        <button onClick={() => setTab('search')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'search' ? 'bg-ctb-red text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Search size={14} /> Search
        </button>
        <button onClick={() => setTab('saved')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'saved' ? 'bg-ctb-red text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Bookmark size={14} /> Saved ({saved.length})
        </button>
      </div>

      {/* AI Discover Tab */}
      {tab === 'ai-discover' && (
        <>
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl border border-violet-100 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 flex-shrink-0">
                <BrainCircuit size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">AI Content Discovery</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Describe the type of content you want and AI will suggest specific videos, posts, and content ideas tailored for China Travel Buddy's social media.
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) aiDiscover(); }}
                  placeholder="e.g. I need content about hidden food spots in Chengdu for our Instagram and TikTok. Focus on street food that tourists wouldn't normally find, spicy dishes, and authentic Sichuan experiences..."
                  className="w-full border border-violet-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 focus:outline-none bg-white/80 backdrop-blur-sm resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">
                    {hasApiKey
                      ? <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> AI Connected ({getApiProvider() === 'anthropic' ? 'Claude' : 'OpenAI'})</span>
                      : <button onClick={() => setShowSettings(true)} className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2">Configure API key to enable AI</button>
                    }
                  </p>
                  <button
                    onClick={aiDiscover}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-violet-200 flex items-center gap-2"
                  >
                    {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Discovering...</> : <><Wand2 size={14} /> Discover Content</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {aiError && (
            <div className="bg-red-50 rounded-xl p-4 mb-6 ring-1 ring-red-200 flex items-start gap-3">
              <X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-xs text-red-600 mt-0.5">{aiError}</p>
              </div>
            </div>
          )}

          {aiSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-violet-500" /> AI Suggestions ({aiSuggestions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiSuggestions.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${platformColors[s.platform] || 'bg-gray-100 text-gray-600'}`}>
                        {s.platform}
                      </span>
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full ring-1 ring-violet-200">
                        {s.contentType}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 leading-snug">{s.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{s.description}</p>
                    <div className="bg-violet-50/50 rounded-lg p-3 mb-4 ring-1 ring-violet-100">
                      <p className="text-xs text-violet-700"><span className="font-semibold">Why it works:</span> {s.whyRelevant}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveSuggestion(s)} className="flex-1 bg-gradient-to-r from-ctb-gold to-amber-500 text-white py-2 rounded-xl text-xs font-semibold hover:from-amber-500 hover:to-amber-600 transition-all flex items-center justify-center gap-1">
                        <Bookmark size={12} /> Save to Bank
                      </button>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s.searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
                      >
                        <ExternalLink size={12} /> Search YouTube
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!aiLoading && aiSuggestions.length === 0 && !aiError && (
            <div className="text-center py-12">
              <BrainCircuit size={48} className="mx-auto text-violet-200 mb-4" />
              <p className="text-gray-400 text-sm">Describe the content you're looking for and AI will generate tailored suggestions</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  'Trending China street food content for TikTok',
                  'Educational Great Wall content for YouTube',
                  'Luxury travel in Shanghai for Instagram',
                  'Budget backpacking China tips and guides',
                ].map(ex => (
                  <button
                    key={ex}
                    onClick={() => setAiPrompt(ex)}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-500 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Search Tab */}
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

      {/* Saved Tab */}
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
                    <div className="flex items-center gap-2">
                      <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[s.status] || ''}`}>
                        <option value="saved">Saved</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="posted">Posted</option>
                      </select>
                      <button onClick={() => deleteContent(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
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
                    <button onClick={() => generateCaptions(s.id)} disabled={captionLoading === s.id} className="mt-3 text-sm font-semibold text-ctb-gold hover:text-amber-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50">
                      {captionLoading === s.id ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate AI Captions</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {saved.length === 0 && <p className="text-center py-12 text-gray-400">No saved content yet. Use AI Discover or Search to find content.</p>}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Settings size={18} /> AI Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Provider</label>
                <select value={tempProvider} onChange={e => setTempProvider(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 focus:outline-none">
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  placeholder={tempProvider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 font-mono focus:ring-2 focus:ring-violet-200 focus:border-violet-400 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Your key is stored locally in your browser only. Never sent anywhere except the AI provider.</p>
              </div>
              <div className="bg-violet-50/50 rounded-xl p-4 ring-1 ring-violet-100">
                <p className="text-xs text-violet-700">
                  <span className="font-semibold">What AI powers:</span> Content discovery suggestions based on your descriptions, smart social media caption generation, and content strategy recommendations.
                </p>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={saveSettings} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200">Save</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
