import type { Metadata } from "next";
import { DeleteCircleForm, InvitePanel, LeaveCircleButton, MemberAdminList } from "@/components/app/circle-admin";
import { EditCircleForm } from "@/components/app/simple-forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadMembers } from "@/lib/members";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Circle settings" };

function Block({ title, intro, children, tone }: { title: string; intro?: string; children: React.ReactNode; tone?: "danger" }) {
  return (
    <Card variant={tone === "danger" ? "key" : "soft"} tone={tone === "danger" ? "danger" : "primary"} className="p-6">
      <h2 className="text-xl font-extrabold">{title}</h2>
      {intro ? <p className="mb-4 mt-1 text-sm text-ink-soft">{intro}</p> : <div className="mb-4" />}
      {children}
    </Card>
  );
}

export default async function CircleSettingsPage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { circle, user, isFounder } = await getCircleContext(circleId);
  const members = isFounder ? await loadMembers(circleId) : [];
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-extrabold">Circle settings</h1>

      {isFounder ? (
        <>
          <Block title="Details" intro="The name, purpose, cadence and accent color members see.">
            <EditCircleForm circleId={circle.id} defaults={{ name: circle.name, purpose: circle.purpose, cadence: circle.cadence, accent: circle.accent }} />
          </Block>
          <Block title="Invite people" intro="Share the link or the code. Only people who have it can join.">
            <InvitePanel circleId={circle.id} code={circle.inviteCode} open={circle.inviteOpen} />
          </Block>
          <Block title="Members and roles" intro="Founders manage members and settings. Everyone else is a Member.">
            <MemberAdminList circleId={circle.id} members={members.map((m) => ({ userId: m.userId, name: m.name, role: m.role, isSelf: m.userId === user.id }))} />
          </Block>
        </>
      ) : (
        <Block title="About this circle">
          <p className="text-ink-soft">{circle.purpose}</p>
          <p className="mt-3 text-sm text-ink-soft">Only a Founder can change settings or invite people.</p>
        </Block>
      )}

      <Block title="Export your data" intro="Decisions, meeting notes and action items are yours. Download them any time.">
        <div className="flex flex-wrap gap-3">
          <Button asChild size="sm"><a href={`/api/circles/${circle.id}/export?format=md`}>Everything as Markdown</a></Button>
          <Button asChild size="sm" variant="secondary"><a href={`/api/circles/${circle.id}/export?format=csv&dataset=decisions`}>Decisions (CSV)</a></Button>
          <Button asChild size="sm" variant="secondary"><a href={`/api/circles/${circle.id}/export?format=csv&dataset=notes`}>Meeting notes (CSV)</a></Button>
          <Button asChild size="sm" variant="secondary"><a href={`/api/circles/${circle.id}/export?format=csv&dataset=actions`}>Action items (CSV)</a></Button>
        </div>
      </Block>

      <Block title="Leave circle" intro="You will lose access to everything in it until someone invites you again.">
        <LeaveCircleButton circleId={circle.id} />
      </Block>

      {isFounder ? (
        <Block title="Delete circle" intro="This permanently removes the circle and everything in it for every member. It cannot be undone." tone="danger">
          <DeleteCircleForm circleId={circle.id} circleName={circle.name} />
        </Block>
      ) : null}
    </div>
  );
}
