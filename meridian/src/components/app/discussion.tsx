"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/form";
import { Emoji } from "@/components/brand/emoji";
import { initialState } from "@/lib/action-state";
import { useActionState } from "react";
import { addCommentAction, deleteCommentAction, toggleReactionAction } from "@/server/actions/comments";
import { timeAgo } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ActionForm, FormMessage, SubmitButton } from "./form-parts";

export interface ReactionView {
  key: "thumbs" | "target" | "bulb" | "raised" | "fire";
  count: number;
  mine: boolean;
}

const REACTION_LABEL: Record<ReactionView["key"], string> = {
  thumbs: "Thumbs up",
  target: "On target",
  bulb: "Good idea",
  raised: "Celebrate",
  fire: "On fire",
};

/** Five fixed reactions. Optimistic: the count moves instantly and the server confirms. */
export function ReactionBar({ circleId, on, id, reactions }: { circleId: string; on: string; id: string; reactions: ReactionView[] }) {
  const [optimistic, setOptimistic] = useOptimistic(reactions, (state, key: ReactionView["key"]) =>
    state.map((r) => (r.key === key ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) } : r)),
  );
  const [, start] = useTransition();
  const router = useRouter();
  return (
    <div role="group" aria-label="Reactions" className="flex flex-wrap gap-1.5">
      {optimistic.map((r) => (
        <button
          key={r.key}
          type="button"
          aria-pressed={r.mine}
          aria-label={`${REACTION_LABEL[r.key]}${r.count ? `, ${r.count}` : ""}`}
          onClick={() =>
            start(async () => {
              setOptimistic(r.key);
              await toggleReactionAction(circleId, on, id, r.key);
              router.refresh();
            })
          }
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full border-2 px-2.5 text-xs font-bold transition-colors",
            r.mine ? "border-ink bg-primary-soft text-primary-soft-ink" : "border-line text-ink-soft hover:border-ink",
          )}
        >
          <Emoji name={r.key} size={16} />
          {r.count > 0 ? <span>{r.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export interface CommentView {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string; // ISO
  reactions: ReactionView[];
}

interface DiscussionProps {
  circleId: string;
  targetType: string;
  targetId: string;
  comments: CommentView[];
  viewerId: string;
  isFounder: boolean;
  /** Reactions on the target itself (the goal, card, post...). Omit to hide the bar. */
  targetReactions?: ReactionView[];
}

export function Discussion({ circleId, targetType, targetId, comments, viewerId, isFounder, targetReactions }: DiscussionProps) {
  const [state, action] = useActionState(addCommentAction.bind(null, circleId, targetType, targetId), initialState);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <section aria-label="Discussion" className="flex flex-col gap-5">
      {targetReactions ? <ReactionBar circleId={circleId} on={targetType} id={targetId} reactions={targetReactions} /> : null}
      <h2 className="font-display text-xl font-extrabold">Comments {comments.length ? <span className="text-ink-soft">({comments.length})</span> : null}</h2>
      {comments.length === 0 ? <p className="text-ink-soft">No comments yet. A short word from a peer goes a long way.</p> : null}
      <ul className="flex flex-col gap-4">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar name={c.authorName} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="font-semibold">{c.authorName}</p>
                <time dateTime={c.createdAt} className="text-xs text-ink-soft">{timeAgo(new Date(c.createdAt))}</time>
                {c.authorId === viewerId || isFounder ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm("Delete this comment?")) return;
                      start(async () => {
                        const r = await deleteCommentAction(circleId, c.id);
                        setError(r.ok ? "" : (r.error ?? "Could not delete."));
                        if (r.ok) router.refresh();
                      });
                    }}
                    className="ml-auto text-xs font-semibold text-ink-soft hover:text-danger"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
              <div className="mt-2"><ReactionBar circleId={circleId} on="comment" id={c.id} reactions={c.reactions} /></div>
            </div>
          </li>
        ))}
      </ul>
      {error ? <p role="alert" className="rounded-xl bg-danger-tint px-4 py-2.5 text-sm font-semibold text-danger">{error}</p> : null}
      <ActionForm action={action} state={state} resetOnSuccess className="flex flex-col gap-3">
        <label htmlFor={`comment-${targetId}`} className="sr-only">Add a comment</label>
        <Textarea id={`comment-${targetId}`} name="body" placeholder="Add a comment" maxLength={2000} required />
        <FormMessage state={state} />
        <div><SubmitButton size="sm" pending="Posting...">Post comment</SubmitButton></div>
      </ActionForm>
    </section>
  );
}

