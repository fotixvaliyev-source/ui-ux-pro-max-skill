import { Sticker } from "@/components/brand/sticker";
import { CountUp } from "@/components/brand/count-up";
import { Reveal } from "@/components/brand/reveal";
import { PRINCIPLES } from "./content";
import { Section } from "./section";

const TILTS = [-3, 2, -2, 3] as const;

const STATS = [
  { value: 6, label: "tools in one place" },
  { value: 8, label: "character invite codes" },
  { value: 2, label: "export formats" },
  { value: 0, label: "ads, ever" },
] as const;

export function Principles() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Section
        eyebrow="Principles"
        title={<>Rules we <span className="text-primary">keep</span>.</>}
        intro="A private workspace only works if it stays private. These are not features. They are promises."
        className="px-0 py-0 md:py-0"
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.06}>
              <li className="flex flex-col items-start gap-3 rounded-panel border-2 border-ink bg-surface p-6">
                <Sticker tone={p.tone} tilt={TILTS[i] ?? 0}>{p.label}</Sticker>
                <p className="text-lg">{p.text}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>
      <dl className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-card bg-primary-soft p-5 text-center text-primary-soft-ink">
            <dd className="font-display text-5xl font-extrabold">
              <CountUp to={s.value} />
            </dd>
            <dt className="mt-1 text-sm font-semibold">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
