import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JoinButton } from "@/components/app/join-button";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { previewInvite } from "@/server/services/circles";

export const metadata: Metadata = { title: "You're invited", robots: { index: false } };

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const circle = await previewInvite(code);
  if (!circle) {
    return (
      <Card variant="key" className="p-7 text-center">
        <h1 className="text-3xl font-extrabold">That invite did not work</h1>
        <p className="mb-6 mt-2 text-ink-soft">The link may be mistyped, or the Founder may have replaced it. Ask for a fresh one.</p>
        <Button asChild variant="secondary"><Link href="/">Back to the homepage</Link></Button>
      </Card>
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    const already = await db.membership.findUnique({ where: { circleId_userId: { circleId: circle.id, userId } }, select: { id: true } });
    if (already) redirect(`/app/c/${circle.id}`);
  }
  const here = `/join/${encodeURIComponent(code)}`;
  return (
    <Card variant="key" tone="decisions" className="p-7 text-center">
      <div className="mb-4 flex justify-center"><EmojiTile feature="directory" emoji="handshake" size="lg" /></div>
      <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">You are invited to</p>
      <h1 className="mt-1 text-3xl font-extrabold">{circle.name}</h1>
      <p className="mt-3 text-ink-soft">{circle.purpose}</p>
      <p className="mt-2 text-sm font-semibold">{circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}</p>
      <div className="mt-6 flex flex-col gap-3">
        {!circle.inviteOpen ? (
          <p role="alert" className="rounded-xl bg-danger-tint px-4 py-2.5 text-sm font-semibold text-danger">Invitations for this circle are paused.</p>
        ) : userId ? (
          <JoinButton code={code} />
        ) : (
          <>
            <Button asChild size="lg"><Link href={`/signup?next=${encodeURIComponent(here)}`}>Create an account to join</Link></Button>
            <Button asChild size="lg" variant="secondary"><Link href={`/login?next=${encodeURIComponent(here)}`}>I already have an account</Link></Button>
          </>
        )}
      </div>
    </Card>
  );
}
