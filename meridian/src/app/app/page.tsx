import Link from "next/link";
import { redirect } from "next/navigation";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";

export default async function AppIndex() {
  const user = await requireUser();
  const first = await db.membership.findFirst({ where: { userId: user.id }, orderBy: { joinedAt: "asc" }, select: { circleId: true } });
  if (first) redirect(`/app/c/${first.circleId}`);
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <EmojiTile feature="directory" emoji="compass" size="lg" />
      <h1 className="text-3xl font-extrabold">No circles yet</h1>
      <p className="text-ink-soft">Start your own, or join one with an invite code from a peer.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/app/circles/new">Create a circle</Link></Button>
        <Button asChild variant="secondary"><Link href="/app/join">Join with a code</Link></Button>
      </div>
    </div>
  );
}
