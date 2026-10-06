import type { Tone } from "@/lib/constants";

/** Static class maps so Tailwind can see every class name. */
export const TONE_SOFT: Record<Tone, string> = {
  goals: "bg-goals-tint text-goals-text",
  meetings: "bg-meetings-tint text-meetings-text",
  decisions: "bg-decisions-tint text-decisions-text",
  opps: "bg-opps-tint text-opps-text",
  projects: "bg-projects-tint text-projects-text",
  library: "bg-library-tint text-library-text",
  directory: "bg-directory-tint text-directory-text",
  primary: "bg-primary-soft text-primary-soft-ink",
  neutral: "bg-line text-ink",
  danger: "bg-danger-tint text-danger",
};

export const TONE_SOLID: Record<Tone, string> = {
  goals: "bg-goals",
  meetings: "bg-meetings",
  decisions: "bg-decisions",
  opps: "bg-opps",
  projects: "bg-projects",
  library: "bg-library",
  directory: "bg-directory",
  primary: "bg-primary",
  neutral: "bg-ink-soft",
  danger: "bg-danger",
};

/** Sets --accent so .card-key and .card-soft pick up the tone color. */
export const TONE_ACCENT: Record<Tone, string> = {
  goals: "[--accent:var(--goals)]",
  meetings: "[--accent:var(--meetings)]",
  decisions: "[--accent:var(--decisions)]",
  opps: "[--accent:var(--opps)]",
  projects: "[--accent:var(--projects)]",
  library: "[--accent:var(--library)]",
  directory: "[--accent:var(--directory)]",
  primary: "[--accent:var(--primary)]",
  neutral: "[--accent:var(--line)]",
  danger: "[--accent:var(--danger)]",
};

/** Solid color as text/fill color, for decorative SVGs. */
export const TONE_FILL: Record<Tone, string> = {
  goals: "text-goals",
  meetings: "text-meetings",
  decisions: "text-decisions",
  opps: "text-opps",
  projects: "text-projects",
  library: "text-library",
  directory: "text-directory",
  primary: "text-primary",
  neutral: "text-ink-soft",
  danger: "text-danger",
};
