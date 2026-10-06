import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingForm } from "@/components/app/meeting-forms";
import { Card } from "@/components/ui/card";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Edit meeting" };

export default async function EditMeetingPage({ params }: { params: Promise<{ circleId: string; meetingId: string }> }) {
  const { circleId, meetingId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const m = await db.meeting.findFirst({ where: { id: meetingId, circleId }, include: { agenda: { orderBy: { position: "asc" } } } });
  if (!m || (m.createdById !== user.id && !isFounder)) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-extrabold">Edit meeting</h1>
      <Card variant="key" tone="meetings" className="p-6">
        <MeetingForm
          circleId={circleId}
          meetingId={m.id}
          defaults={{ title: m.title, startsAtIso: m.startsAt.toISOString(), location: m.location, videoUrl: m.videoUrl, agenda: m.agenda.map((a) => a.text) }}
        />
      </Card>
    </div>
  );
}
