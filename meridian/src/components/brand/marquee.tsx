import { Emoji } from "./emoji";
import type { EmojiName } from "@/lib/constants";

interface MarqueeProps {
  items: readonly string[];
  emoji?: EmojiName;
}

/** A slow, endless strip. Duplicated once so the loop is seamless; the copy is hidden from screen readers. */
export function Marquee({ items, emoji = "sparkles" }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-8 whitespace-nowrap font-display text-xl font-bold sm:text-2xl">
          {item}
          <Emoji name={emoji} size={20} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-decisions py-4 text-[#1b1a2e]">
      <div className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
