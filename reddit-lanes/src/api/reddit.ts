import type { RedditPost, SortMode } from "../types";

const BASE = "/api/reddit";

export class RedditApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "RedditApiError";
    this.status = status;
  }
}

const SUBREDDIT_NAME_PATTERN = /^[a-zA-Z0-9_]{2,21}$/;
const inFlightRequests = new Map<string, Promise<any>>();

export function normalizeSubredditName(input: string): string {
  return input
    .trim()
    .replace(/^\/?r\//i, "")
    .replace(/\/$/, "");
}

export function isValidSubredditName(name: string): boolean {
  return SUBREDDIT_NAME_PATTERN.test(name);
}

async function requestJson(
  url: string,
  forbiddenMessage = "Reddit denied this request.",
): Promise<any> {
  const existingRequest = inFlightRequests.get(url);
  if (existingRequest) return existingRequest;

  const request = requestJsonUncached(url, forbiddenMessage);
  inFlightRequests.set(url, request);
  try {
    return await request;
  } finally {
    if (inFlightRequests.get(url) === request) {
      inFlightRequests.delete(url);
    }
  }
}

async function requestJsonUncached(
  url: string,
  forbiddenMessage: string,
): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new RedditApiError(
      "Could not reach Reddit. Check your connection and try again.",
    );
  }

  if (response.status === 404) {
    throw new RedditApiError("That subreddit does not exist.", 404);
  }
  if (response.status === 403) {
    throw new RedditApiError(forbiddenMessage, 403);
  }
  if (response.status === 429) {
    throw new RedditApiError(
      "Reddit is rate limiting this browser. Wait a moment and try again.",
      429,
    );
  }
  if (!response.ok) {
    throw new RedditApiError(
      `Reddit returned an error (status ${response.status}).`,
      response.status,
    );
  }

  return response.json();
}

/**
 * Confirms a subreddit exists and is readable before a lane is created for it.
 */
export async function verifySubredditExists(subreddit: string): Promise<void> {
  const data = await requestJson(
    `${BASE}/r/${subreddit}/about.json?raw_json=1`,
    "Reddit denied access. That subreddit may be private or banned.",
  );

  if (data?.kind !== "t5" || !data?.data?.name) {
    throw new RedditApiError("That subreddit does not exist.", 404);
  }
  if (data.data.subreddit_type === "private") {
    throw new RedditApiError("That subreddit is private.", 403);
  }
}

function mapPost(child: any): RedditPost {
  const post = child.data;
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    subreddit: post.subreddit,
    score: post.score,
    numComments: post.num_comments,
    permalink: `https://www.reddit.com${post.permalink}`,
    url: post.url,
    createdUtc: post.created_utc,
    domain: post.domain,
    isSelf: post.is_self,
    thumbnail:
      post.thumbnail && post.thumbnail.startsWith("http")
        ? post.thumbnail
        : null,
    stickied: Boolean(post.stickied),
  };
}

export async function fetchSubredditPosts(
  subreddit: string,
  sort: SortMode,
  limit = 25,
): Promise<RedditPost[]> {
  const data = await requestJson(
    `${BASE}/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`,
    "Reddit denied access to this feed. The subreddit may be private, banned, or Reddit may be blocking this request.",
  );

  const children = data?.data?.children;
  if (!Array.isArray(children)) {
    throw new RedditApiError("Reddit returned an unexpected response.");
  }

  return children.map(mapPost).filter((post) => !post.stickied);
}
