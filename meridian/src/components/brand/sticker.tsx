import { TONE_SOFT } from "@/lib/tone";
import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StickerProps {
  children: React.ReactNode;
  tone?: Tone;
  /** Degrees. Stickers sit slightly off-axis. */
  tilt?: number;
  className?: string;
}

/** A small sticker-style badge, e.g. "Invite only" or "Private by default". */
export function Sticker({ children, tone = "decisions", tilt = -3, className }: StickerProps) {
  return (
    <span
      style={{ transform: `rotate(${tilt}deg)` }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold uppercase tracking-wide",
        TONE_SOFT[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
