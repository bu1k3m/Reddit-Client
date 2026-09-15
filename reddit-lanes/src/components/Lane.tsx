import type { DragEvent } from "react";
import { SORT_MODES, type LaneConfig, type SortMode } from "../types";
import { useLaneFeed } from "../hooks/useLaneFeed";
import { PostRow } from "./PostRow";
import { LaneSkeleton } from "./LaneSkeleton";
import {
  AlertIcon,
  ChevronDownIcon,
  CloseIcon,
  GripIcon,
  RefreshIcon,
} from "./icons";

interface LaneProps {
  lane: LaneConfig;
  onRemove: (id: string) => void;
  onSortChange: (id: string, sort: SortMode) => void;
  dragProps: {
    draggable: boolean;
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDrop: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    isDropTarget: boolean;
  };
}

export function Lane({ lane, onRemove, onSortChange, dragProps }: LaneProps) {
  const { status, posts, error, lastUpdated, refresh } = useLaneFeed(
    lane.subreddit,
    lane.sort,
  );

  const {
    draggable,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragging,
    isDropTarget,
  } = dragProps;

  return (
    <section
      className={[
        "lane",
        isDragging ? "lane--dragging" : "",
        isDropTarget ? "lane--drop-target" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onDragOver={onDragOver}
      onDrop={onDrop}>
      <header
        className="lane__header"
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}>
        <span className="lane__grip" aria-hidden="true">
          <GripIcon />
        </span>
        <h2 className="lane__title">
          <a
            href={`https://www.reddit.com/r/${lane.subreddit}`}
            target="_blank"
            rel="noreferrer">
            r/{lane.subreddit}
          </a>
        </h2>
        <div className="lane__controls">
          <div className="lane__select-wrap">
            <select
              className="lane__select"
              value={lane.sort}
              onChange={(e) =>
                onSortChange(lane.id, e.target.value as SortMode)
              }
              aria-label={`Sort r/${lane.subreddit} by`}>
              {SORT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={10} />
          </div>
          <button
            type="button"
            className="lane__icon-button"
            onClick={() => refresh()}
            title="Refresh lane"
            aria-label={`Refresh r/${lane.subreddit}`}>
            <RefreshIcon />
          </button>
          <button
            type="button"
            className="lane__icon-button"
            onClick={() => onRemove(lane.id)}
            title="Remove lane"
            aria-label={`Remove r/${lane.subreddit} lane`}>
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className="lane__body">
        {status === "loading" && posts.length === 0 && <LaneSkeleton />}

        {status === "error" && (
          <div className="lane__message lane__message--error">
            <AlertIcon />
            <p>{error}</p>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => refresh()}>
              Try again
            </button>
          </div>
        )}

        {status === "ready" && posts.length === 0 && (
          <div className="lane__message">
            <p>No posts found in this lane right now.</p>
          </div>
        )}

        {posts.length > 0 && (
          <ul className="lane__list">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </ul>
        )}
      </div>

      <footer className="lane__footer">
        {lastUpdated
          ? `Updated ${new Date(lastUpdated).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Not loaded yet"}
      </footer>
    </section>
  );
}
