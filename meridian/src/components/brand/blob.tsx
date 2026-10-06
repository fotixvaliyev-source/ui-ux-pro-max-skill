import type { Tone } from "@/lib/constants";
import { TONE_FILL } from "@/lib/tone";
import { cn } from "@/lib/utils";

const SHAPES = [
  "M44.7,-58.4C57.9,-49.6,68.5,-36,72.3,-20.9C76.1,-5.8,73.1,10.8,65.6,24.2C58.1,37.6,46.1,47.8,32.6,55.4C19.1,63,4.1,68,-11.9,67.6C-27.9,67.2,-44.9,61.4,-56.2,49.6C-67.5,37.8,-73.1,20,-72.4,3C-71.7,-14,-64.7,-30.2,-53.5,-39.3C-42.3,-48.4,-27,-50.4,-12.1,-55.3C2.8,-60.2,31.5,-67.2,44.7,-58.4Z",
  "M39.9,-52.6C51.1,-44.6,59,-31.6,63.3,-17.2C67.6,-2.8,68.3,13,61.7,25.1C55.1,37.2,41.2,45.6,27.1,52.4C13,59.2,-1.3,64.4,-15.7,62.2C-30.1,60,-44.6,50.4,-54,37.2C-63.4,24,-67.7,7.2,-64.4,-7.6C-61.1,-22.4,-50.2,-35.2,-37.8,-43C-25.4,-50.8,-11.5,-53.6,1.8,-55.9C15.1,-58.2,28.7,-60.6,39.9,-52.6Z",
] as const;

interface BlobProps {
  tone?: Tone;
  shape?: 0 | 1;
  className?: string;
}

/** Decorative colored blob. Always aria-hidden and non-interactive. */
export function Blob({ tone = "primary", shape = 0, className }: BlobProps) {
  return (
    <svg
      aria-hidden
      viewBox="-100 -100 200 200"
      className={cn("pointer-events-none absolute opacity-60 blur-[1px]", className)}
    >
      <path d={SHAPES[shape]} className={cn("fill-current", TONE_FILL[tone])} />
    </svg>
  );
}
