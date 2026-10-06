import type { EmojiName, FeatureKey } from "@/lib/constants";

export interface NavItem {
  href: string; // relative to /app/c/[circleId]
  label: string;
  emoji: EmojiName;
  feature: FeatureKey | "primary";
}

/** Circle navigation. Entries are added as each area ships. */
export const CIRCLE_NAV: NavItem[] = [
  { href: "", label: "Home", emoji: "home", feature: "primary" },
  { href: "/goals", label: "Goals", emoji: "target", feature: "goals" },
  { href: "/meetings", label: "Meetings", emoji: "calendar", feature: "meetings" },
  { href: "/decisions", label: "Decisions", emoji: "scales", feature: "decisions" },
  { href: "/tasks", label: "Tasks", emoji: "check", feature: "primary" },
  { href: "/members", label: "Members", emoji: "people", feature: "directory" },
  { href: "/settings", label: "Settings", emoji: "compass", feature: "primary" },
];
