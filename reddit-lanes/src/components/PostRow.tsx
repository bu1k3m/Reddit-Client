import type { RedditPost } from "../types";
import { formatCount, formatTimeAgo } from "../lib/format";
import { ArrowUpIcon, CommentIcon } from "./icons";

interface PostRowProps {
  post: RedditPost;
}

export function PostRow({ post }: PostRowProps) {
  const externalHref = post.isSelf ? post.permalink : post.url;

  return (
    <li className="post-row">
      <div className="post-row__score" aria-hidden="true">
        <ArrowUpIcon size={11} />
        <span>{formatCount(post.score)}</span>
      </div>
      <div className="post-row__body">
        <a
          className="post-row__title"
          href={externalHref}
          target="_blank"
          rel="noreferrer">
          {post.title}
        </a>
        <div className="post-row__meta">
          <span className="post-row__meta-item">u/{post.author}</span>
          <a
            className="post-row__meta-item post-row__meta-link"
            href={post.permalink}
            target="_blank"
            rel="noreferrer">
            <CommentIcon size={11} />
            {formatCount(post.numComments)}
          </a>
          <span className="post-row__meta-item">{post.domain}</span>
          <span className="post-row__meta-item">
            {formatTimeAgo(post.createdUtc)}
          </span>
        </div>
      </div>
    </li>
  );
}
