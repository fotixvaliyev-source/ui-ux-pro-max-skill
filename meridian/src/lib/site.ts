/** Canonical origin for absolute URLs (Open Graph, sitemap). Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Meridian";
export const SITE_TAGLINE = "Your circle, finally organized.";
export const SITE_DESCRIPTION = "A private workspace for small groups of experienced professionals: goals, meetings, decisions, introductions and shared resources, in one invite-only place.";
