import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/app/resource-parts";
import { Card } from "@/components/ui/card";
import { parseTags } from "@/lib/tags";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Edit resource" };

export default async function EditResourcePage({ params }: { params: Promise<{ circleId: string; resourceId: string }> }) {
  const { circleId, resourceId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const r = await db.resource.findFirst({ where: { id: resourceId, circleId } });
  if (!r || (r.authorId !== user.id && !isFounder)) notFound();
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-3xl font-extrabold">Edit resource</h1>
      <Card variant="key" tone="library" className="p-6">
        <ResourceForm circleId={circleId} resourceId={r.id} defaults={{ kind: r.kind, title: r.title, whyUseful: r.whyUseful, url: r.url ?? "", body: r.body ?? "", tags: parseTags(r.tags).join(", ") }} />
      </Card>
    </div>
  );
}
