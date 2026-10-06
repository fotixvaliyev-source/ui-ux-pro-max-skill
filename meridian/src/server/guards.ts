import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { ForbiddenError, requireMemberFor, type CircleContext, type SessionUser } from "@/server/access";

export { ForbiddenError, UserError } from "@/server/access";
export type { CircleContext, SessionUser } from "@/server/access";

/** The signed-in user, or a redirect to /login. Use at the top of every page and action. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const user = await db.user.findUnique({ where: { id }, select: { id: true, email: true, name: true } });
  if (!user) redirect("/login");
  return user;
}

/**
 * Verifies the signed-in user belongs to the circle (and is a Founder when required)
 * before anything is read or changed. Throws ForbiddenError otherwise.
 */
export async function requireMember(circleId: string, opts: { founder?: boolean } = {}): Promise<CircleContext> {
  const user = await requireUser();
  return requireMemberFor(user, circleId, opts);
}

/** For pages: members get the context, everyone else gets a 404 (the circle's existence is not revealed). */
export async function getCircleContext(circleId: string, opts: { founder?: boolean } = {}): Promise<CircleContext> {
  try {
    return await requireMember(circleId, opts);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }
}
