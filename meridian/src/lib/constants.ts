import { z } from "zod";

/** Each feature owns one color. Keys match the Tailwind color names and CSS variables. */
export const FEATURES = {
  goals: { label: "Goals", emoji: "target" },
  meetings: { label: "Meetings", emoji: "calendar" },
  decisions: { label: "Decisions", emoji: "scales" },
  opps: { label: "Opportunities", emoji: "seedling" },
  projects: { label: "Projects", emoji: "puzzle" },
  library: { label: "Library", emoji: "books" },
  directory: { label: "Directory", emoji: "people" },
} as const;

export type FeatureKey = keyof typeof FEATURES;
export const FEATURE_KEYS = Object.keys(FEATURES) as FeatureKey[];

/** Emoji name -> Twemoji file (codepoints). Files live in public/emoji. */
export const EMOJI = {
  target: "1f3af",
  calendar: "1f5d3",
  scales: "2696",
  seedling: "1f331",
  puzzle: "1f9e9",
  books: "1f4da",
  people: "1f465",
  thumbs: "1f44d",
  bulb: "1f4a1",
  raised: "1f64c",
  fire: "1f525",
  party: "1f389",
  lock: "1f512",
  note: "1f4dd",
  rocket: "1f680",
  compass: "1f9ed",
  sparkles: "2728",
  bell: "1f514",
  home: "1f3e0",
  check: "2705",
  ballot: "1f5f3",
  handshake: "1f91d",
} as const;

export type EmojiName = keyof typeof EMOJI;

/** The only reactions allowed on comments. */
export const REACTIONS = ["thumbs", "target", "bulb", "raised", "fire"] as const satisfies readonly EmojiName[];
export type ReactionKey = (typeof REACTIONS)[number];

/** Circle accent colors a Founder can pick. */
export const CIRCLE_ACCENTS = ["indigo", "coral", "mint", "sky", "lilac", "yellow", "peach"] as const;
export const CADENCES = ["weekly", "biweekly", "monthly"] as const;

export const ROLES = ["FOUNDER", "MEMBER"] as const;
export const GOAL_STATUSES = ["ON_TRACK", "AT_RISK", "DONE"] as const;
export const DECISION_STATUSES = ["ACTIVE", "REVISITED", "REVERSED"] as const;
export const OPPORTUNITY_TYPES = ["JOB_LEAD", "INTRO", "COLLAB", "REFERRAL", "QUESTION"] as const;
export const OPPORTUNITY_STATUSES = ["OPEN", "FILLED", "CLOSED"] as const;
export const RESOURCE_KINDS = ["LINK", "FILE", "NOTE"] as const;
export const COMMENT_TARGETS = ["GOAL", "CHECKIN", "OPPORTUNITY", "CARD", "DECISION", "MEETING"] as const;
export const NOTIFICATION_TYPES = ["ACTION_ITEM", "MEETING", "OPPORTUNITY", "COMMENT", "POLL"] as const;
export const DEFAULT_COLUMNS = ["Backlog", "In progress", "Review", "Done"] as const;

export const roleSchema = z.enum(ROLES);
export const goalStatusSchema = z.enum(GOAL_STATUSES);
export const decisionStatusSchema = z.enum(DECISION_STATUSES);
export const opportunityTypeSchema = z.enum(OPPORTUNITY_TYPES);
export const opportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);
export const resourceKindSchema = z.enum(RESOURCE_KINDS);
export const commentTargetSchema = z.enum(COMMENT_TARGETS);
export const reactionSchema = z.enum(REACTIONS);

export type GoalStatus = (typeof GOAL_STATUSES)[number];
export type DecisionStatus = (typeof DECISION_STATUSES)[number];
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

/** Which feature color each status or type uses. */
export const GOAL_STATUS_STYLE: Record<GoalStatus, { label: string; tone: Tone }> = {
  ON_TRACK: { label: "On track", tone: "opps" },
  AT_RISK: { label: "At risk", tone: "decisions" },
  DONE: { label: "Done", tone: "projects" },
};
export const DECISION_STATUS_STYLE: Record<DecisionStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "opps" },
  REVISITED: { label: "Revisited", tone: "decisions" },
  REVERSED: { label: "Reversed", tone: "goals" },
};
export const OPPORTUNITY_TYPE_STYLE: Record<OpportunityType, { label: string; tone: Tone }> = {
  JOB_LEAD: { label: "Job lead", tone: "meetings" },
  INTRO: { label: "Introduction request", tone: "directory" },
  COLLAB: { label: "Collaboration", tone: "library" },
  REFERRAL: { label: "Client referral", tone: "projects" },
  QUESTION: { label: "Question for the group", tone: "decisions" },
};
export const OPPORTUNITY_STATUS_STYLE: Record<OpportunityStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "Open", tone: "opps" },
  FILLED: { label: "Filled", tone: "projects" },
  CLOSED: { label: "Closed", tone: "neutral" },
};

export type Tone = FeatureKey | "primary" | "neutral" | "danger";

/** Circle accent -> the tone used for its color strip. */
export const ACCENT_TONE: Record<(typeof CIRCLE_ACCENTS)[number], Tone> = {
  indigo: "primary",
  coral: "goals",
  mint: "opps",
  sky: "projects",
  lilac: "library",
  yellow: "decisions",
  peach: "directory",
};
