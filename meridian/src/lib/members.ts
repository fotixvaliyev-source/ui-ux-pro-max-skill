import { db } from "@/server/db";
import type { MemberView } from "@/components/app/member-card";

/** All members of a circle as directory entries. Caller must already have verified membership. */
export async function loadMembers(circleId: string): Promise<MemberView[]> {
  const rows = await db.membership.findMany({
    where: { circleId },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    include: { user: { include: { profile: true } } },
  });
  return rows.map((m) => ({
    userId: m.userId,
    name: m.user.name ?? m.user.email,
    role: m.role,
    headline: m.user.profile?.headline ?? null,
    currentRole: m.user.profile?.currentRole ?? null,
    company: m.user.profile?.company ?? null,
    industry: m.user.profile?.industry ?? null,
    bio: m.user.profile?.bio ?? null,
    linkedinUrl: m.user.profile?.linkedinUrl ?? null,
    expertise: m.user.profile?.expertise ?? "[]",
    workingOn: m.workingOn,
    canHelpWith: m.canHelpWith,
    lookingFor: m.lookingFor,
  }));
}

/** Simple, predictable matcher for the directory search box. */
export function matchesQuery(m: MemberView, q: string): boolean {
  const hay = [m.name, m.headline, m.currentRole, m.company, m.industry, m.workingOn, m.canHelpWith, m.lookingFor, m.expertise]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}
