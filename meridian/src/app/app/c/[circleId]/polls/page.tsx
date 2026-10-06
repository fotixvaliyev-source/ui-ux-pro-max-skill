import type { Metadata } from "next";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { PollCard, PollForm } from "@/components/app/poll-parts";
import { Card } from "@/components/ui/card";
import { getCircleContext } from "@/server/guards";
import { listPolls } from "@/server/services/polls";

export const metadata: Metadata = { title: "Polls" };

export default async function PollsPage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const polls = await listPolls(user.id, circleId);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <EmojiTile feature="directory" emoji="ballot" />
        <div>
          <h1 className="text-3xl font-extrabold">Polls</h1>
          <p className="text-ink-soft">Quick calls that need a vote. Results show once you have voted.</p>
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Polls" className="flex flex-col gap-4">
          {polls.length === 0 ? (
            <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
              <EmojiTile feature="directory" emoji="ballot" size="lg" />
              <p className="font-display text-xl font-bold">No polls yet</p>
              <p className="max-w-md text-ink-soft">Dates, venues, topics. Ask the group and get an answer without a thread of replies.</p>
            </div>
          ) : (
            polls.map((p) => (
              <PollCard key={p.id} circleId={circleId} poll={{ id: p.id, question: p.question, closed: p.closed, closesIso: p.closesAt?.toISOString() ?? null, myOptionId: p.myOptionId, totalVotes: p.totalVotes, options: p.options, canDelete: isFounder || p.authorId === user.id }} />
            ))
          )}
        </section>
        <Card variant="key" tone="primary" className="p-5">
          <h2 className="mb-3 font-display text-lg font-bold">Ask the circle</h2>
          <PollForm circleId={circleId} />
        </Card>
      </div>
    </div>
  );
}
