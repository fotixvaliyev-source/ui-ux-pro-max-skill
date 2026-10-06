import { Blob } from "@/components/brand/blob";
import type { Tone } from "@/lib/constants";

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  tone?: Tone;
}

/** Header for inner marketing pages. */
export function PageHero({ eyebrow, title, intro, tone = "library" }: PageHeroProps) {
  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Blob tone={tone} className="-right-24 -top-28 -z-10 h-96 w-96" />
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 md:pt-24">
        <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="max-w-3xl text-display-xl font-extrabold">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft sm:text-xl">{intro}</p>
      </div>
    </header>
  );
}
