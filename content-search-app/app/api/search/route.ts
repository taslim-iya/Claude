import { NextRequest, NextResponse } from "next/server";

export interface ContentResult {
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

async function searchUnsplash(
  query: string,
  page: number,
  perPage: number
): Promise<ContentResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Client-ID ${key}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.results || []).map((photo: any) => ({
    id: `unsplash-${photo.id}`,
    type: "image" as const,
    source: "unsplash" as const,
    title: photo.description || photo.alt_description || "Untitled",
    thumbnail: photo.urls.small,
    previewUrl: photo.urls.regular,
    downloadUrl: photo.links.download,
    author: photo.user.name,
    authorUrl: photo.user.links.html,
    width: photo.width,
    height: photo.height,
    tags: (photo.tags || []).map((t: any) => t.title).slice(0, 5),
    sourceUrl: photo.links.html,
  }));
}

async function searchPexelsPhotos(
  query: string,
  page: number,
  perPage: number
): Promise<ContentResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    { headers: { Authorization: key } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.photos || []).map((photo: any) => ({
    id: `pexels-photo-${photo.id}`,
    type: "image" as const,
    source: "pexels" as const,
    title: photo.alt || "Untitled",
    thumbnail: photo.src.medium,
    previewUrl: photo.src.large,
    downloadUrl: photo.src.original,
    author: photo.photographer,
    authorUrl: photo.photographer_url,
    width: photo.width,
    height: photo.height,
    sourceUrl: photo.url,
  }));
}

async function searchPexelsVideos(
  query: string,
  page: number,
  perPage: number
): Promise<ContentResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    { headers: { Authorization: key } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.videos || []).map((video: any) => {
    const bestFile =
      video.video_files?.find(
        (f: any) => f.quality === "hd" || f.quality === "sd"
      ) || video.video_files?.[0];
    return {
      id: `pexels-video-${video.id}`,
      type: "video" as const,
      source: "pexels" as const,
      title: video.url?.split("/").pop()?.replace(/-/g, " ") || "Untitled",
      thumbnail: video.image,
      previewUrl: video.image,
      downloadUrl: bestFile?.link || "",
      author: video.user.name,
      authorUrl: video.user.url,
      width: video.width,
      height: video.height,
      duration: video.duration,
      sourceUrl: video.url,
    };
  });
}

async function searchPixabayImages(
  query: string,
  page: number,
  perPage: number
): Promise<ContentResult[]> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&image_type=all`
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.hits || []).map((img: any) => ({
    id: `pixabay-img-${img.id}`,
    type: "image" as const,
    source: "pixabay" as const,
    title: img.tags || "Untitled",
    thumbnail: img.webformatURL,
    previewUrl: img.largeImageURL,
    downloadUrl: img.largeImageURL,
    author: img.user,
    authorUrl: `https://pixabay.com/users/${img.user}-${img.user_id}/`,
    width: img.imageWidth,
    height: img.imageHeight,
    tags: img.tags?.split(", ").slice(0, 5),
    sourceUrl: img.pageURL,
  }));
}

async function searchPixabayVideos(
  query: string,
  page: number,
  perPage: number
): Promise<ContentResult[]> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.hits || []).map((vid: any) => {
    const best = vid.videos?.large || vid.videos?.medium || vid.videos?.small;
    return {
      id: `pixabay-vid-${vid.id}`,
      type: "video" as const,
      source: "pixabay" as const,
      title: vid.tags || "Untitled",
      thumbnail: `https://i.vimeocdn.com/video/${vid.picture_id}_640x360.jpg`,
      previewUrl: best?.url || "",
      downloadUrl: best?.url || "",
      author: vid.user,
      authorUrl: `https://pixabay.com/users/${vid.user}-${vid.user_id}/`,
      width: best?.width,
      height: best?.height,
      duration: vid.duration,
      tags: vid.tags?.split(", ").slice(0, 5),
      sourceUrl: vid.pageURL,
    };
  });
}

async function searchPixabayMusic(
  query: string,
  page: number,
  perPage: number
): Promise<ContentResult[]> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [];

  // Pixabay doesn't have a public music API endpoint, but we can use their audio search
  // For now, we'll skip music as Pixabay's music API requires different authentication
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const contentType = searchParams.get("type") || "all"; // all, image, video
  const source = searchParams.get("source") || "all"; // all, unsplash, pexels, pixabay
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = 15;

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  const searches: Promise<ContentResult[]>[] = [];

  const wantImages = contentType === "all" || contentType === "image";
  const wantVideos = contentType === "all" || contentType === "video";

  if (wantImages && (source === "all" || source === "unsplash")) {
    searches.push(searchUnsplash(query, page, perPage));
  }
  if (wantImages && (source === "all" || source === "pexels")) {
    searches.push(searchPexelsPhotos(query, page, perPage));
  }
  if (wantVideos && (source === "all" || source === "pexels")) {
    searches.push(searchPexelsVideos(query, page, perPage));
  }
  if (wantImages && (source === "all" || source === "pixabay")) {
    searches.push(searchPixabayImages(query, page, perPage));
  }
  if (wantVideos && (source === "all" || source === "pixabay")) {
    searches.push(searchPixabayVideos(query, page, perPage));
  }

  const results = await Promise.allSettled(searches);
  const allContent: ContentResult[] = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  // Shuffle results so sources are interleaved
  const shuffled = allContent.sort(() => Math.random() - 0.5);

  return NextResponse.json({
    query,
    type: contentType,
    source,
    page,
    count: shuffled.length,
    results: shuffled,
  });
}
