import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/brand/reveal";
import { PROBLEMS } from "./content";
import { Section } from "./section";

export function Problem() {
  return (
    <Section
      eyebrow="The problem"
      title={<>Good groups, <span className="text-goals-text">messy</span> follow-through.</>}
      intro="Smart people meet, agree on things, and then lose them. Here is what usually goes wrong, and what changes."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {PROBLEMS.map((p, i) => (
          <Reveal key={p.before} delay={i * 0.08}>
            <Card variant="soft" tone={p.tone} className="h-full overflow-hidden">
              <div className="border-b-2 border-dashed border-line bg-bg px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">Before</p>
                <p className="font-display text-xl font-bold line-through decoration-danger decoration-2">{p.before}</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">With Meridian</p>
                <p className="mb-2 font-display text-2xl font-extrabold">{p.now}</p>
                <p className="text-ink-soft">{p.text}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
