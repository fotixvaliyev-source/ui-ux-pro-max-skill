import type { Circle, Membership } from "@prisma/client";
import { db } from "@/server/db";

/** Authorization primitives with no framework imports, so they can be unit tested against a real database. */

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this circle.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** An expected, user-facing failure (bad code, paused invites...). Message is safe to show. */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface CircleContext {
  user: SessionUser;
  circle: Circle;
  membership: Membership;
  isFounder: boolean;
}

/** A missing membership is never allowed; Founder-only needs the FOUNDER role. */
export function assertAccess(membership: Membership | null, opts: { founder?: boolean } = {}): Membership {
  if (!membership) throw new ForbiddenError();
  if (opts.founder && membership.role !== "FOUNDER") throw new ForbiddenError("Only a Founder can do that.");
  return membership;
}

/** Loads the membership by (circle, user) and asserts it. The one door every circle read/write goes through. */
export async function membershipOrThrow(userId: string, circleId: string, opts: { founder?: boolean } = {}) {
  const row = await db.membership.findUnique({
    where: { circleId_userId: { circleId, userId } },
    include: { circle: true },
  });
  assertAccess(row, opts);
  if (!row) throw new ForbiddenError();
  const { circle, ...membership } = row;
  return { circle, membership, isFounder: membership.role === "FOUNDER" };
}

export async function requireMemberFor(user: SessionUser, circleId: string, opts: { founder?: boolean } = {}): Promise<CircleContext> {
  const { circle, membership, isFounder } = await membershipOrThrow(user.id, circleId, opts);
  return { user, circle, membership, isFounder };
}
