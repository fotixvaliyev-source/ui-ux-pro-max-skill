import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Circle home" };

// Placeholder: the full circle home (next meeting, tasks, feed, summary) ships in Phase 7.
export default async function CircleHome({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { circle } = await getCircleContext(circleId);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-extrabold">{circle.name}</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-soft">{circle.purpose}</p>
      </div>
      <Card variant="soft" className="p-6">
        <p className="font-display text-lg font-bold">Your circle is ready</p>
        <p className="mt-1 text-ink-soft">Meet your peers in Members. Goals, meetings and decisions are on their way.</p>
      </Card>
    </div>
  );
}
