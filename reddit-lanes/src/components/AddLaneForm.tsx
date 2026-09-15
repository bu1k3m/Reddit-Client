import { useState, type FormEvent } from "react";
import {
  isValidSubredditName,
  normalizeSubredditName,
  RedditApiError,
  verifySubredditExists,
} from "../api/reddit";

interface AddLaneFormProps {
  existingSubreddits: string[];
  onAdd: (subreddit: string) => void;
}

export function AddLaneForm({ existingSubreddits, onAdd }: AddLaneFormProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const name = normalizeSubredditName(value);

    if (!name) {
      setStatus("error");
      setError("Enter a subreddit name.");
      return;
    }
    if (!isValidSubredditName(name)) {
      setStatus("error");
      setError("Subreddit names use letters, numbers and underscores only.");
      return;
    }
    if (
      existingSubreddits.some((s) => s.toLowerCase() === name.toLowerCase())
    ) {
      setStatus("error");
      setError(`r/${name} already has a lane.`);
      return;
    }

    setStatus("checking");
    setError(null);

    try {
      await verifySubredditExists(name);
      onAdd(name);
      setValue("");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof RedditApiError
          ? err.message
          : "Could not verify that subreddit.",
      );
    }
  }

  return (
    <form className="add-lane" onSubmit={handleSubmit} noValidate>
      <div className="add-lane__field">
        <span className="add-lane__prefix">r/</span>
        <input
          className="add-lane__input"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="subreddit name"
          aria-label="Subreddit name"
          aria-invalid={status === "error"}
          disabled={status === "checking"}
        />
      </div>
      <button
        type="submit"
        className="button button--primary"
        disabled={status === "checking" || value.trim().length === 0}>
        {status === "checking" ? "Checking..." : "Add lane"}
      </button>
      {status === "error" && error && (
        <p className="add-lane__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
