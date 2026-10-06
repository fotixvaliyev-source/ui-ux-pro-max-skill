import type { FeatureKey } from "@/lib/constants";

export interface FeatureCopy {
  key: FeatureKey;
  name: string;
  slug: string;
  tagline: string;
  blurb: string;
  points: string[];
}

/** One entry per feature, shared by the landing page and /features. */
export const FEATURE_COPY: FeatureCopy[] = [
  {
    key: "directory",
    name: "Member directory",
    slug: "directory",
    tagline: "Know who can help with what.",
    blurb: "Every member gets a real profile: what they are working on, what they can help with, what they need.",
    points: [
      "Headline, role, company and expertise tags",
      "Working on, can help with, looking for",
      "Search and filter by expertise",
      "A LinkedIn link, if they want one",
    ],
  },
  {
    key: "goals",
    name: "Goals and check-ins",
    slug: "goals",
    tagline: "Say it out loud. Then follow up.",
    blurb: "Quarterly goals with a measurable target, a deadline and an honest status. Short check-ins keep them alive.",
    points: [
      "Title, target, deadline, status: On track, At risk or Done",
      "Check-ins: what progressed, what is blocked, what help is needed",
      "One view of every member's goals",
      "Peer comments and a small set of reactions",
    ],
  },
  {
    key: "meetings",
    name: "Meetings and action items",
    slug: "meetings",
    tagline: "Meetings that leave something behind.",
    blurb: "Plan the agenda, keep shared notes in markdown, record decisions, and hand out action items with owners and dates.",
    points: [
      "Agenda, location or video link, shared notes",
      "Action items with an owner and a due date",
      "Items land on the shared board and in each owner's My tasks",
      "A searchable archive of past meetings",
    ],
  },
  {
    key: "decisions",
    name: "Decision log",
    slug: "decisions",
    tagline: "Decisions you can actually find later.",
    blurb: "Write down what was decided, why, and who was in the room. Mark it Active, Revisited or Reversed as things change.",
    points: [
      "The decision, the context and the reasoning",
      "Date and who was involved",
      "Status that keeps up with reality",
      "Search and filter across the whole log",
    ],
  },
  {
    key: "opps",
    name: "Opportunities board",
    slug: "opportunities",
    tagline: "Leads and intros, out in the open.",
    blurb: "Post a job lead, ask for an introduction, offer a collaboration, refer a client, or ask the group a question.",
    points: [
      "Five post types, each with its own color",
      "Tags and a status: Open, Filled or Closed",
      "Members respond and comment on the post",
      "New posts notify the circle",
    ],
  },
  {
    key: "library",
    name: "Resource library",
    slug: "library",
    tagline: "The good stuff, saved once.",
    blurb: "Links, files and notes, each with a short line on why it is useful. Searchable by tag.",
    points: [
      "Links, files and notes in one place",
      "A required “why this is useful”",
      "Tag and search",
      "Nothing lost in a scroll-back",
    ],
  },
  {
    key: "projects",
    name: "Shared projects",
    slug: "projects",
    tagline: "A small board for shared work.",
    blurb: "A Kanban board for what the group is building together. Four editable columns, drag and drop, no ceremony.",
    points: [
      "Cards with owner, due date, label, checklist and comments",
      "Backlog, In progress, Review, Done (rename them)",
      "Smooth drag and drop",
      "Polls for the quick calls that need a vote",
    ],
  },
];

export const USE_CASES = [
  "Founder circles",
  "Alumni networks",
  "Executive peer groups",
  "Study groups",
  "Side ventures",
] as const;

export const PROBLEMS = [
  {
    before: "Scattered chats",
    now: "One home",
    text: "Advice lives in four group chats, two email threads and someone's notes app. Meridian gives the circle a single place.",
    tone: "meetings",
  },
  {
    before: "Forgotten commitments",
    now: "Owned action items",
    text: "“I'll send that over” has an owner and a date, and shows up in their task list.",
    tone: "goals",
  },
  {
    before: "Unrecorded decisions",
    now: "A decision log",
    text: "What did we decide in March, and why? Search it. Stop relitigating it.",
    tone: "decisions",
  },
  {
    before: "No one tracking progress",
    now: "Goals with check-ins",
    text: "Quarterly goals, honest statuses, short check-ins. Progress you can see without chasing anyone.",
    tone: "opps",
  },
] as const;

export const STEPS = [
  {
    title: "Create a circle",
    text: "Name it, write one line about what it is for, and pick a cadence and a color. That takes about a minute.",
    detail: "You become the Founder: you manage members, edit settings and can delete the circle.",
  },
  {
    title: "Invite your peers",
    text: "Share a private link or an 8-character code. Nobody can find the circle or join without one.",
    detail: "Each member fills in a profile once and it follows them into every circle they join.",
  },
  {
    title: "Run it with structure",
    text: "Set goals, schedule the meeting, log the decision, assign the action item. The circle keeps its own memory.",
    detail: "The circle home shows the next meeting, your open tasks and a short weekly summary.",
  },
] as const;

export const SCENARIOS = [
  {
    id: "founders",
    label: "Founder circles",
    title: "Eight founders, one Tuesday call",
    text: "Each founder posts a quarterly goal and checks in before the call. The call opens on blockers, not updates. Advice given becomes a logged decision, and an intro promised becomes an action item with a name on it.",
    uses: ["Goals and check-ins", "Decision log", "Opportunities board"],
    tone: "goals",
  },
  {
    id: "alumni",
    label: "Alumni networks",
    title: "A cohort that stays useful after graduation",
    text: "Twenty alumni across six time zones. The directory shows who knows what. Job leads and intros go on the board instead of into a mass email, and a quarterly poll picks the next gathering.",
    uses: ["Member directory", "Opportunities board", "Polls"],
    tone: "directory",
  },
  {
    id: "execs",
    label: "Executive peer groups",
    title: "Six leaders, confidential by default",
    text: "A monthly session with a fixed agenda. Notes stay inside the circle, decisions are recorded with the reasoning, and the library holds the frameworks people actually reuse.",
    uses: ["Meetings and notes", "Decision log", "Resource library"],
    tone: "meetings",
  },
  {
    id: "study",
    label: "Study groups",
    title: "A reading group that finishes the book",
    text: "Weekly cadence, one agenda item per chapter, and the best articles saved with a line on why they matter. The Kanban board tracks the group project.",
    uses: ["Meetings and agenda", "Resource library", "Shared projects"],
    tone: "library",
  },
  {
    id: "ventures",
    label: "Side ventures",
    title: "Three friends building something on weekends",
    text: "A small board for what is in progress, a log for the calls that shaped the product, and goals that keep the weekend project from drifting.",
    uses: ["Shared projects", "Decision log", "Goals and check-ins"],
    tone: "projects",
  },
] as const;

export const PRINCIPLES = [
  { label: "Private by default", text: "Everything inside a circle is visible only to its members.", tone: "opps" },
  { label: "Invitation only", text: "No public circles, no search, no strangers.", tone: "meetings" },
  { label: "No ads", text: "Not now, not later. The product is the product.", tone: "decisions" },
  { label: "You own your data", text: "Export decisions, notes and action items whenever you like.", tone: "goals" },
] as const;

export const FAQ = [
  {
    q: "Who can join a circle?",
    a: "Only people who have been invited. A Founder shares a private link or an 8-character code, and anyone who has it can join. Circles are never listed or searchable.",
  },
  {
    q: "How do invitations work?",
    a: "Every circle has an invite link and a code. Share either with the people you want. The Founder can pause invitations at any time and can remove a member from the circle.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Circle content is visible only to that circle's members, every request is checked against membership, and we do not run ads or sell data. The privacy page explains the details in plain language.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Export a circle's decisions, meeting notes and action items as Markdown or CSV at any time.",
  },
  {
    q: "Is it free?",
    a: "Meridian is free while it is in early access. If pricing ever changes, existing circles will hear about it well before anything does.",
  },
] as const;
