import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DecisionForm } from "@/components/app/decision-forms";
import { Card } from "@/components/ui/card";
import { toDateInput } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Edit decision" };

export default async function EditDecisionPage({ params }: { params: Promise<{ circleId: string; decisionId: string }> }) {
  const { circleId, decisionId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const d = await db.decision.findFirst({ where: { id: decisionId, circleId }, include: { involved: true } });
  if (!d || (d.createdById !== user.id && !isFounder)) notFound();
  const members = await loadMembers(circleId);
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-extrabold">Edit decision</h1>
      <Card variant="key" tone="decisions" className="p-6">
        <DecisionForm
          circleId={circleId}
          decisionId={d.id}
          members={members.map((m) => ({ userId: m.userId, name: m.name }))}
          defaults={{ title: d.title, context: d.context, decidedOn: toDateInput(d.decidedOn), status: d.status, involved: d.involved.map((p) => p.userId), meetingId: d.meetingId ?? undefined }}
        />
      </Card>
    </div>
  );
}
