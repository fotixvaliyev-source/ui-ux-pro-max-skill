import type { z } from "zod";
import { db } from "@/server/db";
import { ForbiddenError, UserError, membershipOrThrow } from "@/server/access";
import { serializeTags, parseTags } from "@/lib/tags";
import { OPPORTUNITY_TYPE_STYLE, type OpportunityStatus, type OpportunityType } from "@/lib/constants";
import { notifyCircle } from "@/server/services/notifications";
import type { opportunitySchema } from "@/server/validation/projects";

type Input = z.output<typeof opportunitySchema>;

export async function createOpportunity(actorId: string, circleId: string, input: Input): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  const post = await db.opportunity.create({
    data: { circleId, authorId: actorId, type: input.type, title: input.title, description: input.description, tags: serializeTags(input.tags), status: "OPEN" },
    select: { id: true },
  });
  const author = await db.user.findUnique({ where: { id: actorId }, select: { name: true } });
  const href = `/app/c/${circleId}/opportunities#post-${post.id}`;
  await notifyCircle(actorId, circleId, { type: "OPPORTUNITY", title: `New ${OPPORTUNITY_TYPE_STYLE[input.type].label.toLowerCase()}: ${input.title}`, href });
  await db.activity.create({ data: { circleId, actorId, verb: "opportunity", summary: `${author?.name ?? "Someone"} posted: ${input.title}`, href } });
  return post;
}

async function postForChange(actorId: string, circleId: string, id: string) {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const post = await db.opportunity.findFirst({ where: { id, circleId } });
  if (!post) throw new UserError("That post could not be found.");
  if (post.authorId !== actorId && !isFounder) throw new ForbiddenError("Only the author or a Founder can change a post.");
  return post;
}

export async function updateOpportunity(actorId: string, circleId: string, id: string, input: Input): Promise<void> {
  await postForChange(actorId, circleId, id);
  await db.opportunity.update({ where: { id }, data: { type: input.type, title: input.title, description: input.description, tags: serializeTags(input.tags), status: input.status } });
}

export async function setOpportunityStatus(actorId: string, circleId: string, id: string, status: OpportunityStatus): Promise<void> {
  await postForChange(actorId, circleId, id);
  await db.opportunity.update({ where: { id }, data: { status } });
}

export async function deleteOpportunity(actorId: string, circleId: string, id: string): Promise<void> {
  await postForChange(actorId, circleId, id);
  const comments = await db.comment.findMany({ where: { circleId, targetType: "OPPORTUNITY", targetId: id }, select: { id: true } });
  await db.$transaction([
    db.reaction.deleteMany({ where: { circleId, OR: [{ scope: `OPPORTUNITY:${id}` }, { commentId: { in: comments.map((c) => c.id) } }] } }),
    db.comment.deleteMany({ where: { id: { in: comments.map((c) => c.id) } } }),
    db.opportunity.delete({ where: { id } }),
  ]);
}

export interface OpportunityFilter {
  type?: OpportunityType | string;
  status?: string;
  tag?: string;
  q?: string;
}

export async function listOpportunities(actorId: string, circleId: string, f: OpportunityFilter = {}) {
  await membershipOrThrow(actorId, circleId);
  const rows = await db.opportunity.findMany({
    where: { circleId, ...(f.type ? { type: f.type } : {}), ...(f.status ? { status: f.status } : {}) },
    orderBy: { createdAt: "desc" },
  });
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((r) => {
    if (f.tag && !parseTags(r.tags).includes(f.tag)) return false;
    const hay = `${r.title} ${r.description}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
