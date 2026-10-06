import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  intro?: string;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

/** Standard marketing section: eyebrow label, big headline, intro, content. */
export function Section({ id, eyebrow, title, intro, children, className, align = "left" }: SectionProps) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl px-5 py-16 md:py-24", className)}>
      <div className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p> : null}
        <h2 className="text-display-lg font-extrabold">{title}</h2>
        {intro ? <p className="mt-4 text-lg text-ink-soft">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}
