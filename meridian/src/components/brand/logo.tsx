import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: a ringed "M" mark and the name. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Meridian home" className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-primary font-display text-lg font-extrabold text-primary-ink shadow-[2px_2px_0_var(--decisions)]"
      >
        M
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">Meridian</span>
    </Link>
  );
}
