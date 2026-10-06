import Image from "next/image";
import { EMOJI, type EmojiName } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EmojiProps {
  name: EmojiName;
  /** Pixel size. Defaults to 1.1em-ish 24px. */
  size?: number;
  /** Accessible label. Omit for purely decorative emoji. */
  label?: string;
  className?: string;
}

/** Twemoji, self-hosted, so emoji look identical on every device. */
export function Emoji({ name, size = 24, label, className }: EmojiProps) {
  return (
    <Image
      src={`/emoji/${EMOJI[name]}.svg`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      width={size}
      height={size}
      unoptimized
      draggable={false}
      className={cn("inline-block shrink-0 select-none align-[-0.2em]", className)}
    />
  );
}
