"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ContentResult {
  id: string;
  type: "image" | "video" | "music";
  source: "unsplash" | "pexels" | "pixabay";
  title: string;
  thumbnail: string;
  previewUrl: string;
  downloadUrl: string;
  author: string;
  authorUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  tags?: string[];
  sourceUrl: string;
}

const TRAVEL_SUGGESTIONS = [
  "tropical beach sunset",
  "mountain hiking trail",
  "ancient temple ruins",
  "aerial drone cityscape",
  "underwater coral reef",
  "northern lights aurora",
  "desert sand dunes",
  "european cobblestone street",
  "japanese cherry blossom",
  "safari wildlife animals",
  "cruise ship ocean",
  "hot air balloon landscape",
];

const SOURCE_COLORS: Record<string, string> = {
  unsplash: "bg-neutral-800",
  pexels: "bg-emerald-700",
  pixabay: "bg-green-700",
};

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="shimmer aspect-[4/3] w-full" />
      <div className="p-3 space-y-2">
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

function ContentCard({
  item,
  onPreview,
}: {
  item: ContentResult;
  onPreview: (item: ContentResult) => void;
}) {
  return (
    <div className="content-card fade-in rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col">
      {/* Thumbnail */}
      <button
        onClick={() => onPreview(item)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-black/20 cursor-pointer"
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Type badge */}
        {item.type === "video" && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.8A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.31l9.9-5.89a1.5 1.5 0 000-2.62L6.3 2.8z" />
            </svg>
            {formatDuration(item.duration) || "Video"}
          </span>
        )}
        {/* Source badge */}
        <span
          className={`absolute top-2 right-2 ${SOURCE_COLORS[item.source]} text-white text-xs px-2 py-0.5 rounded-full capitalize`}
        >
          {item.source}
        </span>
        {/* Resolution */}
        {item.width && item.height && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white/80 text-[10px] px-1.5 py-0.5 rounded">
            {item.width}×{item.height}
          </span>
        )}
      </button>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          by{" "}
          <a
            href={item.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--color-primary)]"
          >
            {item.author}
          </a>
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-[var(--color-border)] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-2 rounded-lg transition-colors"
          >
            Download
          </a>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-medium bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)] py-2 rounded-lg transition-colors"
          >
            View Source
          </a>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  item,
  onClose,
}: {
  item: ContentResult;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full bg-[var(--color-surface)] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg cursor-pointer"
        >
          ×
        </button>
        {item.type === "video" ? (
          <video
            src={item.downloadUrl}
            controls
            autoPlay
            className="w-full max-h-[70vh] object-contain bg-black"
          />
        ) : (
          <img
            src={item.previewUrl}
            alt={item.title}
            className="w-full max-h-[70vh] object-contain bg-black"
          />
        )}
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              by {item.author} · {item.source}
              {item.width && item.height
                ? ` · ${item.width}×${item.height}`
                : ""}
              {item.duration ? ` · ${formatDuration(item.duration)}` : ""}
            </p>
          </div>
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState("all");
  const [source, setSource] = useState("all");
  const [results, setResults] = useState<ContentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [preview, setPreview] = useState<ContentResult | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(
    async (searchQuery: string, pageNum: number = 1, append = false) => {
      if (!searchQuery.trim()) return;

      if (pageNum === 1) {
        setLoading(true);
        setResults([]);
      } else {
        setLoadingMore(true);
      }
      setSearched(true);
      setApiStatus(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          type: contentType,
          source,
          page: String(pageNum),
        });
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();

        if (data.count === 0 && pageNum === 1) {
          setApiStatus(
            "No results found. Make sure your API keys are configured in .env.local"
          );
        }

        if (append) {
          setResults((prev) => [...prev, ...data.results]);
        } else {
          setResults(data.results || []);
        }
        setPage(pageNum);
      } catch {
        setApiStatus("Search failed. Check that the server is running.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [contentType, source]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query, 1);
  };

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    search(suggestion, 1);
  };

  const loadMore = () => {
    search(query, page + 1, true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">
                ContentFinder
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Search free stock images & videos for your travel content
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search for content... e.g. "tropical beach sunset"'
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">
                Type:
              </span>
              {["all", "image", "video"].map((t) => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    contentType === t
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {t === "all" ? "All" : t === "image" ? "Images" : "Videos"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">
                Source:
              </span>
              {["all", "unsplash", "pexels", "pixabay"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors capitalize cursor-pointer ${
                    source === s
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {s === "all" ? "All Sources" : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Welcome / Suggestions */}
        {!searched && (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold mb-3">
              Find the perfect content for your travels
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-xl mx-auto">
              Search across Unsplash, Pexels, and Pixabay for free stock images
              and videos. Get direct download links for your travel content.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {TRAVEL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-sm bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {apiStatus && (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <p>{apiStatus}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Showing {results.length} results for &quot;{query}&quot;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onPreview={setPreview}
                />
              ))}
            </div>

            {/* Load more */}
            <div className="text-center py-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text)] px-8 py-3 rounded-xl font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          </>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && !apiStatus && (
          <div className="text-center py-16">
            <p className="text-lg text-[var(--color-text-muted)]">
              No results found for &quot;{query}&quot;
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              Try different keywords or change your filters.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-text-muted)]">
        <p>
          Content sourced from{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            className="underline"
          >
            Unsplash
          </a>
          ,{" "}
          <a href="https://pexels.com" target="_blank" className="underline">
            Pexels
          </a>
          , and{" "}
          <a href="https://pixabay.com" target="_blank" className="underline">
            Pixabay
          </a>
          . Please respect each platform&apos;s license terms when using
          downloaded content.
        </p>
      </footer>

      {/* Preview modal */}
      {preview && (
        <PreviewModal item={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
