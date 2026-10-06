import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunityForm } from "@/components/app/opportunity-parts";
import { Card } from "@/components/ui/card";
import { parseTags } from "@/lib/tags";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditOpportunityPage({ params }: { params: Promise<{ circleId: string; postId: string }> }) {
  const { circleId, postId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const p = await db.opportunity.findFirst({ where: { id: postId, circleId } });
  if (!p || (p.authorId !== user.id && !isFounder)) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-extrabold">Edit post</h1>
      <Card variant="key" tone="opps" className="p-6">
        <OpportunityForm circleId={circleId} postId={p.id} defaults={{ type: p.type, title: p.title, description: p.description, tags: parseTags(p.tags).join(", "), status: p.status }} />
      </Card>
    </div>
  );
}
