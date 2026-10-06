import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberCard } from "@/components/app/member-card";
import { Button } from "@/components/ui/button";
import { loadMembers } from "@/lib/members";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Member" };

export default async function MemberPage({ params }: { params: Promise<{ circleId: string; userId: string }> }) {
  const { circleId, userId } = await params;
  const { user } = await getCircleContext(circleId);
  const member = (await loadMembers(circleId)).find((m) => m.userId === userId);
  if (!member) notFound();
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <Link href={`/app/c/${circleId}/members`} className="text-sm font-bold text-primary hover:underline">&larr; All members</Link>
      <MemberCard member={member} circleId={circleId} full />
      {member.userId === user.id ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="sm"><Link href={`/app/c/${circleId}/members/edit`}>Edit what I share in this circle</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/app/settings">Edit my profile</Link></Button>
        </div>
      ) : null}
    </div>
  );
}
