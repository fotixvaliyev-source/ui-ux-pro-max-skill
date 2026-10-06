import type { Metadata } from "next";
import { GoalForm } from "@/components/app/goal-forms";
import { Card } from "@/components/ui/card";
import { QUARTER_RE, nearbyQuarters, quarterEnd, quarterLabel, quarterOf, toDateInput } from "@/lib/dates";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Add a goal" };

export default async function NewGoalPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ quarter?: string }> }) {
  const { circleId } = await params;
  const { quarter: raw } = await searchParams;
  await getCircleContext(circleId);
  const now = new Date();
  const quarter = raw && QUARTER_RE.test(raw) ? raw : quarterOf(now);
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold">Add a goal</h1>
      <p className="mb-6 mt-1 text-ink-soft">Make it measurable. Your circle will see it and can help.</p>
      <Card variant="key" tone="goals" className="p-6">
        <GoalForm
          circleId={circleId}
          defaults={{ quarter, deadline: toDateInput(quarterEnd(quarter)) }}
          quarters={nearbyQuarters(now, [quarter]).map((q) => ({ value: q, label: quarterLabel(q) }))}
        />
      </Card>
    </div>
  );
}
