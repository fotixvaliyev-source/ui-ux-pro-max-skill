import { Reveal } from "@/components/brand/reveal";
import { STEPS } from "./content";
import { Section } from "./section";
import { cn } from "@/lib/utils";

const TONES = ["bg-goals", "bg-decisions", "bg-opps"] as const;

export function Steps({ withDetail = false }: { withDetail?: boolean }) {
  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title={<>Three steps. Then <span className="text-primary">momentum</span>.</>}
      intro="No setup marathon. You can have a circle running before your next call."
    >
      <ol className="grid gap-6 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1}>
            <li className="relative h-full rounded-panel border-2 border-ink bg-surface p-7 pt-14">
              <span
                aria-hidden
                className={cn(
                  "absolute -top-6 left-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink font-display text-3xl font-extrabold text-[#1b1a2e] shadow-[3px_3px_0_var(--ink)]",
                  TONES[i],
                  i === 1 ? "rotate-3" : "-rotate-3",
                )}
              >
                {i + 1}
              </span>
              <h3 className="mb-2 text-2xl font-extrabold">{s.title}</h3>
              <p className="text-ink-soft">{s.text}</p>
              {withDetail ? <p className="mt-3 text-sm font-medium">{s.detail}</p> : null}
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
