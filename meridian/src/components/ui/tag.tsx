import type { Tone } from "@/lib/constants";
import { TONE_SOFT, TONE_SOLID } from "@/lib/tone";
import { cn } from "@/lib/utils";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Small rounded label: expertise tags, opportunity types, feature labels. */
export function Tag({ tone = "neutral", className, ...props }: TagProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold", TONE_SOFT[tone], className)}
      {...props}
    />
  );
}

/** Status pill with a leading dot: On track, At risk, Done, Active, Open... */
export function Pill({ tone = "neutral", className, children, ...props }: TagProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold", TONE_SOFT[tone], className)}
      {...props}
    >
      <span aria-hidden className={cn("h-2 w-2 rounded-full", TONE_SOLID[tone])} />
      {children}
    </span>
  );
}
