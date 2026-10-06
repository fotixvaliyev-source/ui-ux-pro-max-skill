import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoalForm } from "@/components/app/goal-forms";
import { Card } from "@/components/ui/card";
import { nearbyQuarters, quarterLabel, toDateInput } from "@/lib/dates";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Edit goal" };

export default async function EditGoalPage({ params }: { params: Promise<{ circleId: string; goalId: string }> }) {
  const { circleId, goalId } = await params;
  const { user } = await getCircleContext(circleId);
  const goal = await db.goal.findFirst({ where: { id: goalId, circleId } });
  if (!goal || goal.ownerId !== user.id) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-extrabold">Edit goal</h1>
      <Card variant="key" tone="goals" className="p-6">
        <GoalForm
          circleId={circleId}
          goalId={goal.id}
          defaults={{ title: goal.title, description: goal.description, target: goal.target, deadline: toDateInput(goal.deadline), quarter: goal.quarter, status: goal.status }}
          quarters={nearbyQuarters(new Date(), [goal.quarter]).map((q) => ({ value: q, label: quarterLabel(q) }))}
        />
      </Card>
    </div>
  );
}
