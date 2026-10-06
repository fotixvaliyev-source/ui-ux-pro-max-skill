import type { Metadata } from "next";
import { DecisionForm } from "@/components/app/decision-forms";
import { Card } from "@/components/ui/card";
import { toDateInput } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Log a decision" };

export default async function NewDecisionPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ meeting?: string }> }) {
  const { circleId } = await params;
  const { meeting } = await searchParams;
  const { user } = await getCircleContext(circleId);
  const members = await loadMembers(circleId);
  // Only link to a meeting that really belongs to this circle.
  const linked = meeting ? await db.meeting.findFirst({ where: { id: meeting, circleId }, select: { id: true, title: true } }) : null;
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold">Log a decision</h1>
      <p className="mb-6 mt-1 text-ink-soft">{linked ? `From the meeting "${linked.title}".` : "Write it down while it is fresh."}</p>
      <Card variant="key" tone="decisions" className="p-6">
        <DecisionForm
          circleId={circleId}
          members={members.map((m) => ({ userId: m.userId, name: m.name }))}
          defaults={{ decidedOn: toDateInput(new Date()), involved: [user.id], meetingId: linked?.id }}
        />
      </Card>
    </div>
  );
}
