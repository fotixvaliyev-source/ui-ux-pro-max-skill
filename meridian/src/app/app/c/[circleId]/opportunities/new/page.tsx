import type { Metadata } from "next";
import { OpportunityForm } from "@/components/app/opportunity-parts";
import { Card } from "@/components/ui/card";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "New post" };

export default async function NewOpportunityPage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  await getCircleContext(circleId);
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold">Post to the board</h1>
      <p className="mb-6 mt-1 text-ink-soft">Everyone in the circle is notified.</p>
      <Card variant="key" tone="opps" className="p-6"><OpportunityForm circleId={circleId} /></Card>
    </div>
  );
}
