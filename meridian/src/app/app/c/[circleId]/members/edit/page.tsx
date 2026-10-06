import type { Metadata } from "next";
import { EditCircleProfileForm } from "@/components/app/simple-forms";
import { Card } from "@/components/ui/card";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Edit my circle profile" };

export default async function EditCircleProfilePage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { membership } = await getCircleContext(circleId);
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-extrabold">What I share here</h1>
      <p className="mb-6 mt-1 text-ink-soft">Only members of this circle see these. Your main profile is edited under My profile.</p>
      <Card variant="soft" tone="directory" className="p-6">
        <EditCircleProfileForm circleId={circleId} defaults={membership} />
      </Card>
    </div>
  );
}
