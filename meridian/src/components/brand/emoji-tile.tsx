import { FEATURES, type EmojiName, type FeatureKey } from "@/lib/constants";
import { TONE_SOLID } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { Emoji } from "./emoji";

const SIZES = { sm: "h-9 w-9 rounded-xl", md: "h-12 w-12 rounded-2xl", lg: "h-16 w-16 rounded-[20px]" } as const;
const GLYPH = { sm: 20, md: 26, lg: 36 } as const;

interface EmojiTileProps {
  feature: FeatureKey;
  /** Override the feature's default emoji. */
  emoji?: EmojiName;
  size?: keyof typeof SIZES;
  className?: string;
}

/** The colored icon tile each feature owns. */
export function EmojiTile({ feature, emoji, size = "md", className }: EmojiTileProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border-2 border-ink",
        TONE_SOLID[feature],
        SIZES[size],
        className,
      )}
    >
      <Emoji name={emoji ?? FEATURES[feature].emoji} size={GLYPH[size]} />
    </span>
  );
}
