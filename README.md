# lanes

Project roadmap: https://roadmap.sh/projects/reddit-client

A browser based Reddit reader. Add subreddits as side by side lanes, sort each
one independently, and keep the layout between sessions.

## Stack

React, TypeScript, and Vite. The Vite development server proxies Reddit's
public JSON endpoints so browser CORS restrictions do not block requests.

## Running it

```
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static bundle in
`dist/`. The included proxy applies during `npm run dev`; a production host
needs an equivalent server-side proxy for `/api/reddit`.

## How it works

- `src/api/reddit.ts` wraps `/api/reddit/r/{subreddit}/about.json` for
  existence checks and `/api/reddit/r/{subreddit}/{sort}.json` for post
  listings. Vite forwards these same-origin requests to Reddit during local
  development.
- Adding a lane validates the subreddit first (catching typos, private
  subreddits and bans) before creating it.
- Each lane manages its own fetch lifecycle (`src/hooks/useLaneFeed.ts`):
  loading, error with retry, and empty results are handled per lane, so one
  bad subreddit does not affect the others.
- Lane configuration (subreddit name, sort mode, order) is persisted to
  `localStorage` and restored on reload.
- Lanes can be reordered by dragging their header.

## Known limits

- Reddit's public JSON endpoints are rate limited per IP. Adding many lanes
  or refreshing rapidly can trigger a 429, which is surfaced as an error
  message on the affected lane with a retry button.
- Only listing data is used (title, author, score, comment count, domain,
  timestamp). Fetching full comment trees would need extra endpoints and
  is not wired up.
- No authentication, so no voting, saving or NSFW content unlocking.
