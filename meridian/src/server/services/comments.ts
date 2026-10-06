import { db } from "@/server/db";
import { membershipOrThrow, ForbiddenError, UserError } from "@/server/access";
import type { CommentTarget } from "@/server/services/targets";
import { resolveTarget } from "@/server/services/targets";
import { notify } from "@/server/services/notifications";
import { REACTIONS, type ReactionKey } from "@/lib/constants";

export async function addComment(actorId: string, circleId: string, target: CommentTarget, body: string): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  const resolved = await resolveTarget(circleId, target);
  const comment = await db.comment.create({
    data: { circleId, authorId: actorId, targetType: target.type, targetId: target.id, body },
    select: { id: true },
  });
  const author = await db.user.findUnique({ where: { id: actorId }, select: { name: true } });
  // Notify the owner of the goal/card/post, and anyone else who already commented in the thread.
  const prior = await db.comment.findMany({ where: { circleId, targetType: target.type, targetId: target.id }, select: { authorId: true } });
  const recipients = [resolved.ownerId, ...prior.map((c) => c.authorId)].filter((id): id is string => Boolean(id));
  await notify(actorId, recipients, {
    circleId,
    type: "COMMENT",
    title: `${author?.name ?? "Someone"} commented on ${resolved.label}`,
    href: resolved.href,
  });
  return comment;
}

export async function deleteComment(actorId: string, circleId: string, commentId: string): Promise<void> {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const comment = await db.comment.findFirst({ where: { id: commentId, circleId } });
  if (!comment) throw new UserError("That comment could not be found.");
  if (comment.authorId !== actorId && !isFounder) throw new ForbiddenError("You can only delete your own comments.");
  await db.$transaction([db.reaction.deleteMany({ where: { commentId } }), db.comment.delete({ where: { id: commentId } })]);
}

export type ReactionTarget = { kind: "comment"; id: string } | { kind: "target"; target: CommentTarget };

/** Toggles one of the five allowed reactions on a comment or on a target (goal, card...). Returns the new state. */
export async function toggleReaction(actorId: string, circleId: string, on: ReactionTarget, key: ReactionKey): Promise<{ active: boolean }> {
  await membershipOrThrow(actorId, circleId);
  if (!(REACTIONS as readonly string[]).includes(key)) throw new UserError("That reaction is not available.");

  let scope: string;
  let data: { commentId?: string; targetType?: string; targetId?: string };
  if (on.kind === "comment") {
    const comment = await db.comment.findFirst({ where: { id: on.id, circleId }, select: { id: true } });
    if (!comment) throw new UserError("That comment could not be found.");
    scope = `C:${on.id}`;
    data = { commentId: on.id };
  } else {
    await resolveTarget(circleId, on.target);
    scope = `${on.target.type}:${on.target.id}`;
    data = { targetType: on.target.type, targetId: on.target.id };
  }

  const existing = await db.reaction.findUnique({ where: { userId_scope_key: { userId: actorId, scope, key } } });
  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
    return { active: false };
  }
  await db.reaction.create({ data: { circleId, userId: actorId, scope, key, ...data } });
  return { active: true };
}

export interface ReactionSummary {
  key: ReactionKey;
  count: number;
  mine: boolean;
}

export function summarizeReactions(rows: { key: string; userId: string }[], viewerId: string): ReactionSummary[] {
  return REACTIONS.map((key) => {
    const matching = rows.filter((r) => r.key === key);
    return { key, count: matching.length, mine: matching.some((r) => r.userId === viewerId) };
  });
}

export interface ThreadComment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
  reactions: ReactionSummary[];
}

export async function loadThread(viewerId: string, circleId: string, target: CommentTarget) {
  await membershipOrThrow(viewerId, circleId);
  await resolveTarget(circleId, target);
  const comments = await db.comment.findMany({
    where: { circleId, targetType: target.type, targetId: target.id },
    orderBy: { createdAt: "asc" },
    include: { reactions: { select: { key: true, userId: true } } },
  });
  const authors = await db.user.findMany({ where: { id: { in: [...new Set(comments.map((c) => c.authorId))] } }, select: { id: true, name: true, email: true } });
  const nameOf = new Map(authors.map((a) => [a.id, a.name ?? a.email]));
  const targetReactions = await db.reaction.findMany({ where: { circleId, scope: `${target.type}:${target.id}` }, select: { key: true, userId: true } });
  const thread: ThreadComment[] = comments.map((c) => ({
    id: c.id,
    authorId: c.authorId,
    authorName: nameOf.get(c.authorId) ?? "Former member",
    body: c.body,
    createdAt: c.createdAt,
    reactions: summarizeReactions(c.reactions, viewerId),
  }));
  return { comments: thread, reactions: summarizeReactions(targetReactions, viewerId) };
}
