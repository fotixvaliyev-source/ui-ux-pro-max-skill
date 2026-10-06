import { db } from "@/server/db";
import { UserError } from "@/server/access";
import { COMMENT_TARGETS } from "@/lib/constants";

export interface CommentTarget {
  type: (typeof COMMENT_TARGETS)[number];
  id: string;
}

export interface ResolvedTarget {
  /** Who gets notified about comments on it (null if nobody owns it). */
  ownerId: string | null;
  /** Short noun phrase for notification text. */
  label: string;
  href: string;
}

/**
 * Confirms the target exists *inside this circle* and says who owns it.
 * Comments and reactions can never attach to something from another circle.
 */
export async function resolveTarget(circleId: string, target: CommentTarget): Promise<ResolvedTarget> {
  const missing = new UserError("That item could not be found.");
  const base = `/app/c/${circleId}`;
  switch (target.type) {
    case "GOAL": {
      const g = await db.goal.findFirst({ where: { id: target.id, circleId }, select: { ownerId: true, title: true } });
      if (!g) throw missing;
      return { ownerId: g.ownerId, label: "your goal", href: `${base}/goals/${target.id}` };
    }
    case "CHECKIN": {
      const c = await db.checkIn.findFirst({ where: { id: target.id, goal: { circleId } }, select: { authorId: true, goalId: true } });
      if (!c) throw missing;
      return { ownerId: c.authorId, label: "your check-in", href: `${base}/goals/${c.goalId}` };
    }
    case "OPPORTUNITY": {
      const o = await db.opportunity.findFirst({ where: { id: target.id, circleId }, select: { authorId: true } });
      if (!o) throw missing;
      return { ownerId: o.authorId, label: "your post", href: `${base}/opportunities#post-${target.id}` };
    }
    case "CARD": {
      const c = await db.projectCard.findFirst({ where: { id: target.id, circleId }, select: { ownerId: true } });
      if (!c) throw missing;
      return { ownerId: c.ownerId, label: "your card", href: `${base}/projects` };
    }
    case "DECISION": {
      const d = await db.decision.findFirst({ where: { id: target.id, circleId }, select: { createdById: true } });
      if (!d) throw missing;
      return { ownerId: d.createdById, label: "your decision", href: `${base}/decisions` };
    }
    case "MEETING": {
      const m = await db.meeting.findFirst({ where: { id: target.id, circleId }, select: { createdById: true } });
      if (!m) throw missing;
      return { ownerId: m.createdById, label: "your meeting", href: `${base}/meetings/${target.id}` };
    }
  }
}
