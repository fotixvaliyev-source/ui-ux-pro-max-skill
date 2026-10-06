import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const COLS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "mailto:hello@meridian.example", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-ink-soft">Your circle, finally organized. A private workspace for peers who back each other.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {COLS.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="font-display font-bold hover:text-primary">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-ink-soft">
          Emoji by Twemoji, licensed CC-BY 4.0. Built for people who keep their promises.
        </p>
      </div>
    </footer>
  );
}
