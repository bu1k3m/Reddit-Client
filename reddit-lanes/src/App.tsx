import { useState, type DragEvent } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { AddLaneForm } from "./components/AddLaneForm";
import { Lane } from "./components/Lane";
import type { LaneConfig, SortMode } from "./types";

const STORAGE_KEY = "reddit-lanes.lanes.v1";

const DEFAULT_LANES: LaneConfig[] = [
  { id: "default-1", subreddit: "programming", sort: "hot" },
  { id: "default-2", subreddit: "webdev", sort: "new" },
];

function createLaneId(subreddit: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${subreddit.toLowerCase()}-${random}`;
}

export default function App() {
  const [lanes, setLanes] = useLocalStorage<LaneConfig[]>(
    STORAGE_KEY,
    DEFAULT_LANES,
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  function handleAdd(subreddit: string) {
    setLanes((prev) => [
      ...prev,
      { id: createLaneId(subreddit), subreddit, sort: "hot" },
    ]);
  }

  function handleRemove(id: string) {
    setLanes((prev) => prev.filter((lane) => lane.id !== id));
  }

  function handleSortChange(id: string, sort: SortMode) {
    setLanes((prev) =>
      prev.map((lane) => (lane.id === id ? { ...lane, sort } : lane)),
    );
  }

  function reorder(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setLanes((prev) => {
      const next = [...prev];
      const from = next.findIndex((lane) => lane.id === sourceId);
      const to = next.findIndex((lane) => lane.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function dragPropsFor(lane: LaneConfig) {
    return {
      draggable: true,
      isDragging: draggingId === lane.id,
      isDropTarget: dropTargetId === lane.id && draggingId !== lane.id,
      onDragStart: (e: DragEvent<HTMLDivElement>) => {
        setDraggingId(lane.id);
        e.dataTransfer.effectAllowed = "move";
      },
      onDragOver: (e: DragEvent<HTMLDivElement>) => {
        if (!draggingId || draggingId === lane.id) return;
        e.preventDefault();
        setDropTargetId(lane.id);
      },
      onDrop: (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggingId) reorder(draggingId, lane.id);
        setDraggingId(null);
        setDropTargetId(null);
      },
      onDragEnd: () => {
        setDraggingId(null);
        setDropTargetId(null);
      },
    };
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__eyebrow">
            <span>Reddit / live reader</span>
            <span className="app-header__pulse" aria-hidden="true" />
            <span>Local workspace</span>
          </div>
          <div className="app-header__title-row">
            <span className="app-header__mark">Reddit CL</span>
            <span className="app-header__count">
              {lanes.length} {lanes.length === 1 ? "lane" : "lanes"}
            </span>
          </div>
        </div>
        <AddLaneForm
          existingSubreddits={lanes.map((lane) => lane.subreddit)}
          onAdd={handleAdd}
        />
      </header>

      <main className="board">
        {lanes.length === 0 ? (
          <div className="board__empty">
            <p>No lanes yet.</p>
            <p className="board__empty-sub">
              Add a subreddit above to start watching it.
            </p>
          </div>
        ) : (
          lanes.map((lane) => (
            <Lane
              key={lane.id}
              lane={lane}
              onRemove={handleRemove}
              onSortChange={handleSortChange}
              dragProps={dragPropsFor(lane)}
            />
          ))
        )}
      </main>
    </div>
  );
}
