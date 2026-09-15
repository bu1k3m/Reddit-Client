export type SortMode = "hot" | "new" | "top" | "rising";

export const SORT_MODES: SortMode[] = ["hot", "new", "top", "rising"];

export interface LaneConfig {
  id: string;
  subreddit: string;
  sort: SortMode;
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  permalink: string;
  url: string;
  createdUtc: number;
  domain: string;
  isSelf: boolean;
  thumbnail: string | null;
  stickied: boolean;
}

export type LaneStatus = "idle" | "loading" | "error" | "ready";

export interface LaneState {
  status: LaneStatus;
  posts: RedditPost[];
  error: string | null;
  lastUpdated: number | null;
}
