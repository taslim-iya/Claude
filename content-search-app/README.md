# ContentFinder

Search and download free stock images and videos from multiple platforms — built for travel content creators.

## Features

- **Multi-platform search** — searches Unsplash, Pexels, and Pixabay simultaneously
- **Content type filters** — filter by images or videos
- **Source filters** — search specific platforms or all at once
- **Direct download links** — one-click downloads for every result
- **Preview modal** — click any result to see a full-size preview
- **Travel-focused** — quick search suggestions tailored for travel content

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get API keys (all free)

| Platform | Sign up | Free tier |
|----------|---------|-----------|
| Unsplash | https://unsplash.com/developers | 50 requests/hour |
| Pexels   | https://www.pexels.com/api/ | 200 requests/hour |
| Pixabay  | https://pixabay.com/api/docs/ | 100 requests/minute |

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Type keywords like "tropical beach sunset" or "mountain hiking drone"
2. Use the **Type** filter to show only images or videos
3. Use the **Source** filter to search specific platforms
4. Click any result thumbnail to preview it full-size
5. Click **Download** to open the direct download link
6. Click **View Source** to see the original page on the platform

## License

Content downloaded through this app is subject to each platform's license:
- **Unsplash**: [Unsplash License](https://unsplash.com/license) — free for commercial use, no attribution required
- **Pexels**: [Pexels License](https://www.pexels.com/license/) — free for commercial use, no attribution required
- **Pixabay**: [Pixabay License](https://pixabay.com/service/license-summary/) — free for commercial use, no attribution required
