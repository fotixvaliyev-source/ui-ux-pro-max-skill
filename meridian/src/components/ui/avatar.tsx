import type { Tone } from "@/lib/constants";
import { TONE_SOFT } from "@/lib/tone";
import { cn } from "@/lib/utils";

const PALETTE: Tone[] = ["goals", "meetings", "decisions", "opps", "projects", "library", "directory"];
const SIZES = { sm: "h-7 w-7 text-[10px]", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" } as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Colored initials. The color is derived from the name so it stays stable. */
export function Avatar({ name, size = "md", className }: { name: string; size?: keyof typeof SIZES; className?: string }) {
  const hash = [...name].reduce((n, c) => n + c.charCodeAt(0), 0);
  const tone = PALETTE[hash % PALETTE.length] ?? "primary";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-surface font-display font-bold",
        TONE_SOFT[tone],
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
