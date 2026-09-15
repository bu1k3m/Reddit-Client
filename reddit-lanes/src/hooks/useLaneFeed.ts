import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSubredditPosts, RedditApiError } from "../api/reddit";
import type { LaneState, SortMode } from "../types";

const INITIAL_STATE: LaneState = {
  status: "idle",
  posts: [],
  error: null,
  lastUpdated: null,
};

export function useLaneFeed(subreddit: string, sort: SortMode) {
  const [state, setState] = useState<LaneState>(INITIAL_STATE);
  const requestId = useRef(0);
  const loadedKey = useRef<string | null>(null);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const posts = await fetchSubredditPosts(subreddit, sort);
      if (currentRequest !== requestId.current) return;
      setState({
        status: "ready",
        posts,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      const message =
        err instanceof RedditApiError
          ? err.message
          : "Something went wrong while loading this lane.";
      setState((prev) => ({ ...prev, status: "error", error: message }));
    }
  }, [subreddit, sort]);

  useEffect(() => {
    const key = `${subreddit}:${sort}`;
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    load();
  }, [load, subreddit, sort]);

  return { ...state, refresh: load };
}
