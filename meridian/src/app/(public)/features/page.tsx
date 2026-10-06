import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Reveal } from "@/components/brand/reveal";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FEATURE_COPY } from "@/components/marketing/content";
import {
  AgendaMock,
  CommentsMock,
  DecisionMock,
  DirectoryMock,
  GoalsMock,
  KanbanMock,
  LibraryMock,
  OpportunityMock,
} from "@/components/marketing/mockups";
import { PageHero } from "@/components/marketing/page-hero";
import type { FeatureKey } from "@/lib/constants";
import { TONE_TINT_BG } from "@/lib/tone";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Features",
  description: "A member directory, goals, meetings, a decision log, an opportunities board, shared projects and a resource library, in one private workspace.",
};

const VISUAL: Record<FeatureKey, ReactNode> = {
  directory: <DirectoryMock />,
  goals: (
    <div className="relative">
      <GoalsMock />
      <CommentsMock className="absolute -bottom-10 -right-4 rotate-2 sm:-right-12" />
    </div>
  ),
  meetings: <AgendaMock />,
  decisions: <DecisionMock />,
  opps: <OpportunityMock />,
  library: <LibraryMock />,
  projects: <KanbanMock />,
};

const ORDER: FeatureKey[] = ["directory", "goals", "meetings", "decisions", "opps", "projects", "library"];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={<>Everything a circle needs. Nothing it <span className="text-primary">doesn&rsquo;t</span>.</>}
        intro="No CRM, no sprints, no permission matrix. Just the tools that make a peer group worth showing up to."
      />
      <div className="mt-8">
        {ORDER.map((key, i) => {
          const f = FEATURE_COPY.find((x) => x.key === key);
          if (!f) return null;
          return (
            <section key={key} id={f.slug} className={cn("scroll-mt-16 border-y-2 border-ink py-16 md:py-24", TONE_TINT_BG[key], i > 0 && "-mt-[2px]")}>
              <div className={cn("mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2", i % 2 === 1 && "lg:[&>div:first-child]:order-2")}>
                <div>
                  <EmojiTile feature={key} size="lg" />
                  <h2 className="mt-5 text-balance text-4xl font-extrabold md:text-5xl">{f.name}</h2>
                  <p className="mt-2 font-display text-xl font-bold">{f.tagline}</p>
                  <p className="mt-4 text-lg text-ink-soft">{f.blurb}</p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {f.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-surface" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <Reveal className="flex justify-center pb-10 lg:pb-0">
                  <div className={cn("w-full max-w-md", i % 2 === 0 ? "lg:rotate-2" : "lg:-rotate-2")}>{VISUAL[key]}</div>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>
      <div className="pt-24">
        <CtaBanner />
      </div>
    </>
  );
}
