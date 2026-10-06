import type { z } from "zod";
import { db } from "@/server/db";
import { ForbiddenError, UserError, membershipOrThrow } from "@/server/access";
import { notifyCircle } from "@/server/services/notifications";
import type { pollSchema } from "@/server/validation/projects";

type Input = z.output<typeof pollSchema>;

export async function createPoll(actorId: string, circleId: string, input: Input): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  const poll = await db.poll.create({
    data: { circleId, authorId: actorId, question: input.question, closesAt: input.closesAt ?? null, options: { create: input.options.map((text, position) => ({ text, position })) } },
    select: { id: true },
  });
  await notifyCircle(actorId, circleId, { type: "POLL", title: `New poll: ${input.question}`, href: `/app/c/${circleId}/polls#poll-${poll.id}` });
  return poll;
}

export function isClosed(poll: { closesAt: Date | null }, now = new Date()): boolean {
  return poll.closesAt !== null && poll.closesAt.getTime() <= now.getTime();
}

/** One vote per member (also enforced by a unique index). Voting after the deadline is refused. */
export async function vote(actorId: string, circleId: string, pollId: string, optionId: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  const poll = await db.poll.findFirst({ where: { id: pollId, circleId }, include: { options: { select: { id: true } } } });
  if (!poll) throw new UserError("That poll could not be found.");
  if (isClosed(poll)) throw new UserError("Voting on this poll has closed.");
  if (!poll.options.some((o) => o.id === optionId)) throw new UserError("That option is not part of this poll.");
  const existing = await db.pollVote.findUnique({ where: { pollId_userId: { pollId, userId: actorId } } });
  if (existing) throw new UserError("You have already voted on this poll.");
  try {
    await db.pollVote.create({ data: { pollId, optionId, userId: actorId } });
  } catch {
    throw new UserError("You have already voted on this poll.");
  }
}

export async function deletePoll(actorId: string, circleId: string, pollId: string): Promise<void> {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const poll = await db.poll.findFirst({ where: { id: pollId, circleId } });
  if (!poll) throw new UserError("That poll could not be found.");
  if (poll.authorId !== actorId && !isFounder) throw new ForbiddenError("Only the author or a Founder can delete a poll.");
  await db.poll.delete({ where: { id: pollId } });
}

export interface PollView {
  id: string;
  question: string;
  authorId: string;
  closesAt: Date | null;
  closed: boolean;
  myOptionId: string | null;
  totalVotes: number;
  /** Counts are null until the viewer has voted or the poll is closed. */
  options: { id: string; text: string; votes: number | null; mine: boolean }[];
}

/** Results stay hidden from members who have not voted, unless the poll has closed. */
export async function listPolls(actorId: string, circleId: string, now = new Date()): Promise<PollView[]> {
  await membershipOrThrow(actorId, circleId);
  const polls = await db.poll.findMany({
    where: { circleId },
    orderBy: { createdAt: "desc" },
    include: { options: { orderBy: { position: "asc" }, include: { _count: { select: { votes: true } } } }, votes: { select: { userId: true, optionId: true } } },
  });
  return polls.map((p) => {
    const mine = p.votes.find((v) => v.userId === actorId)?.optionId ?? null;
    const closed = isClosed(p, now);
    const reveal = mine !== null || closed;
    return {
      id: p.id, question: p.question, authorId: p.authorId, closesAt: p.closesAt, closed, myOptionId: mine,
      totalVotes: reveal ? p.votes.length : 0,
      options: p.options.map((o) => ({ id: o.id, text: o.text, votes: reveal ? o._count.votes : null, mine: o.id === mine })),
    };
  });
}
