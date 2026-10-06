import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Reveal } from "@/components/brand/reveal";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { STEPS } from "@/components/marketing/content";
import { AgendaMock, CreateCircleMock, GoalsMock, InviteMock } from "@/components/marketing/mockups";
import { PageHero } from "@/components/marketing/page-hero";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How it works",
  description: "Create a circle, invite your peers, and run it with structure. Three steps, about a minute to start.",
};

const VISUALS: ReactNode[] = [
  <CreateCircleMock key="a" />,
  <InviteMock key="b" />,
  <div key="c" className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
    <GoalsMock className="sm:-rotate-2" />
    <AgendaMock className="sm:mt-10 sm:rotate-2" />
  </div>,
];

const BARS = ["bg-goals", "bg-decisions", "bg-opps"] as const;

const RHYTHM = [
  { when: "Before the call", what: "Members post a short check-in on their goals. The agenda is already there." },
  { when: "During the call", what: "One person takes notes in markdown. Decisions and action items are written as they happen." },
  { when: "After the call", what: "Action items land in each owner's task list. The decision log has the reasoning for next time." },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        tone="opps"
        title={<>From &ldquo;we should&rdquo; to <span className="text-primary">&ldquo;we did&rdquo;</span>.</>}
        intro="Three steps to start, and a simple rhythm once you are running."
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-24 px-5 py-16">
        {STEPS.map((s, i) => (
          <Reveal key={s.title}>
            <section className={cn("grid items-center gap-10 lg:grid-cols-2", i % 2 === 1 && "lg:[&>div:first-child]:order-2")}>
              <div>
                <span
                  aria-hidden
                  className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink font-display text-4xl font-extrabold text-[#1b1a2e] shadow-[3px_3px_0_var(--ink)]", BARS[i])}
                >
                  {i + 1}
                </span>
                <h2 className="mt-5 text-display-lg font-extrabold">{s.title}</h2>
                <p className="mt-4 text-lg text-ink-soft">{s.text}</p>
                <p className="mt-3 font-medium">{s.detail}</p>
              </div>
              <div className="flex justify-center">{VISUALS[i]}</div>
            </section>
          </Reveal>
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="mb-8 text-display-lg font-extrabold">The <span className="text-primary">rhythm</span> of a good circle</h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {RHYTHM.map((r) => (
            <li key={r.when} className="rounded-panel border-2 border-ink bg-surface p-6">
              <p className="font-display text-xl font-extrabold">{r.when}</p>
              <p className="mt-2 text-ink-soft">{r.what}</p>
            </li>
          ))}
        </ol>
      </section>
      <CtaBanner />
    </>
  );
}
