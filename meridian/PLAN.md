# Meridian — Build Plan

*Your circle, finally organized.*

Meridian is a private workspace for small groups of experienced professionals. Serious substance, creative packaging. This plan covers folder structure, database schema, pages, the palette and fonts, and the phase order. **No code is written until this plan is approved.**

The app lives in `meridian/` so it stays separate from the existing UI UX Pro Max skill files in this repo.

---

## 1. Decisions I am making (please confirm or override)

| Topic | Decision | Why |
|---|---|---|
| Emoji set | **Twemoji** SVGs, self-hosted in `public/emoji/`, rendered by an `<Emoji>` component | Identical on every device, no network dependency. License CC-BY 4.0, credited in the footer and README. |
| Enums | **No Prisma enums.** Status/type fields are `String`, validated by Zod constants in `src/lib/constants.ts` | Keeps one schema working on both SQLite and PostgreSQL. |
| Tags / lists | Stored as a JSON string via a small `tags.ts` helper (`parseTags` / `serializeTags`) | Same reason. A search box does substring match. Fine for circles of 5 to 30 people. |
| Markdown | `react-markdown` with HTML disabled, so notes are safe by default | No XSS from shared notes. |
| Files in library | Links and notes in v1. File upload is stored on local disk in dev and requires a storage adapter in production (documented in README). | Vercel has no persistent disk. I will build an `UploadAdapter` interface with a local adapter and leave S3/Blob as a documented extension. |
| Auth | Auth.js v5, Credentials (email + password, bcrypt) always on. Google and LinkedIn enabled only if their env vars are present. Database sessions via the Prisma adapter, with JWT sessions for Credentials as Auth.js requires. | Matches the brief. |
| Authorization | One helper, `requireMember(circleId, { founder?: boolean })`, called first in every server action and route handler. Never trust a circle id from the client without it. | Core code rule. |
| Realtime | None. Revalidate on action. | Keeps it simple. |
| Email | None. Invites are links and codes. Notifications are in-app only. | Per brief. |
| Test target | Vitest on authorization helper, invite code logic, Zod schemas, action item to task fan-out, notification creation, export builders, poll voting rules | "Critical server logic". |

---

## 2. Palette (design tokens)

Everything is defined once as CSS variables in `globals.css` and mapped in `tailwind.config.ts`. Contrast ratios below are targets. Phase 1 includes a `scripts/check-contrast.ts` that fails the build if any text/background token pair drops below WCAG AA (4.5:1 body, 3:1 large text and UI).

### Core (light)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FFF9F0` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Cards |
| `--ink` | `#1B1A2E` | Text and thick borders |
| `--ink-soft` | `#4A4863` | Secondary text |
| `--line` | `#E8E0D0` | Hairlines |
| `--primary` | `#4B3BD6` | Indigo-violet. Buttons, links, focus ring |
| `--primary-ink` | `#FFFFFF` | Text on primary |
| `--primary-soft` | `#ECE9FF` | Primary tint |

### Feature colors

Each feature owns three tones: **solid** (icon tile, accents), **tint** (card or tag background), and **text** (readable on its tint).

| Feature | Solid | Tint | Text on tint | Emoji tile |
|---|---|---|---|---|
| Goals (coral) | `#FF6B5A` | `#FFE4DF` | `#9A2A1C` | 🎯 |
| Meetings (indigo) | `#5B4BE8` | `#E6E3FF` | `#3A2DB0` | 🗓️ |
| Decisions (yellow) | `#FFC933` | `#FFF1BF` | `#6B4E00` | ⚖️ |
| Opportunities (mint) | `#3DD6A4` | `#D5F6EA` | `#0B6B4C` | 🌱 |
| Projects (sky) | `#4DB8FF` | `#DAF0FF` | `#0A5A8F` | 🧩 |
| Library (lilac) | `#B58CFF` | `#EDE2FF` | `#5B2FA8` | 📚 |
| Directory (peach) | `#FFA77A` | `#FFE6D6` | `#8A3F14` | 👥 |

Status pills reuse the set: On track = mint, At risk = yellow, Done = sky. Active / Revisited / Reversed = mint / yellow / coral. Open / Filled / Closed = mint / sky / neutral.

### Dark mode

Same token names, softer values, vibrant but not glowing.

| Token | Hex |
|---|---|
| `--bg` | `#14132A` |
| `--surface` | `#1F1E3A` |
| `--ink` | `#F5F1E8` |
| `--ink-soft` | `#B9B6D3` |
| `--line` | `#34325A` |
| `--primary` | `#9B8CFF` (with `#14132A` text on it) |

Feature solids shift about 10% lighter, tints become 18% opacity solids over the surface, and tint text uses the light variants (for example coral text `#FFB4A8`). Toggle in the navbar and app header. Defaults to the system setting. No flash on load.

### Details

- Radius: 16px (cards), 24px (hero and large panels), 999px (pills).
- Key elements get a 2px ink border plus a hard colored offset shadow (`4px 4px 0 feature-solid`). Quiet elements get a soft colored blur shadow.
- Backgrounds: blob SVGs plus a subtle dot grid and grain overlay (CSS and inline SVG, no images).
- Motion: Framer Motion with `prefers-reduced-motion` respected everywhere.

---

## 3. Typography

| Role | Font | Source |
|---|---|---|
| Headings | **Bricolage Grotesque** (variable, 600 to 800) | `next/font/google`, self-hosted |
| Body | **Inter** (variable, 400 to 600) | `next/font/google` |
| Mono (small use) | system mono | none |

Public headlines are large (clamp 2.75rem to 5.5rem) with one word highlighted or hand-underlined via a `<Highlight>` component. Inside the app, headings are smaller and calmer.

---

## 4. Folder structure

```
meridian/
├── PLAN.md
├── README.md
├── package.json
├── tailwind.config.ts
├── components.json                 # shadcn/ui
├── .env.example
├── vitest.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                     # Phase 8
│   └── migrations/
├── public/
│   ├── emoji/                      # Twemoji SVGs (only the ones used)
│   └── og/                         # Open Graph images
├── scripts/
│   └── check-contrast.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx          # Navbar + Footer
│   │   │   ├── page.tsx            # /
│   │   │   ├── features/page.tsx
│   │   │   ├── how-it-works/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   └── privacy/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── join/[code]/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── app/
│   │   │   ├── layout.tsx          # app shell, circle switcher
│   │   │   ├── page.tsx            # redirect to last circle
│   │   │   ├── tasks/page.tsx      # My tasks (all circles)
│   │   │   ├── notifications/page.tsx
│   │   │   ├── settings/page.tsx   # my profile
│   │   │   ├── circles/new/page.tsx
│   │   │   └── c/[circleId]/
│   │   │       ├── page.tsx        # Circle home
│   │   │       ├── members/page.tsx
│   │   │       ├── members/[userId]/page.tsx
│   │   │       ├── goals/page.tsx
│   │   │       ├── goals/[goalId]/page.tsx
│   │   │       ├── meetings/page.tsx
│   │   │       ├── meetings/[meetingId]/page.tsx
│   │   │       ├── decisions/page.tsx
│   │   │       ├── opportunities/page.tsx
│   │   │       ├── projects/page.tsx
│   │   │       ├── polls/page.tsx
│   │   │       ├── library/page.tsx
│   │   │       └── settings/page.tsx   # Founder only: members, invites, export, delete
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── circles/[circleId]/export/route.ts   # md and csv
│   │   ├── not-found.tsx           # "This page missed the meeting 🗓️"
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                     # shadcn, customized: button, card, input, textarea, select, dialog, tabs, accordion, tag, pill, badge...
│   │   ├── brand/                  # Emoji, Logo, Highlight, Sticker, Blob, DotGrid, Marquee, CountUp, Reveal
│   │   ├── marketing/              # Hero, ProblemCards, FeatureCards, Steps, Scenarios, Principles, Faq, CtaBanner, product mockups
│   │   └── app/                    # AppShell, CircleSwitcher, MemberCard, GoalCard, MeetingCard, KanbanBoard, PollCard, CommentThread, ReactionBar, EmptyState...
│   ├── server/
│   │   ├── db.ts                   # Prisma client
│   │   ├── auth.ts                 # Auth.js config
│   │   ├── guards.ts               # requireUser, requireMember, requireFounder
│   │   ├── actions/                # one file per domain: circles, goals, meetings, decisions, ...
│   │   ├── services/               # pure logic: invites, notifications, export, polls, tasks
│   │   └── validation/             # Zod schemas per domain
│   ├── lib/
│   │   ├── constants.ts            # statuses, post types, colors, reaction set
│   │   ├── tags.ts
│   │   ├── dates.ts
│   │   └── utils.ts
│   └── tests/                      # Vitest
└── next.config.mjs
```

---

## 5. Database schema (Prisma, SQLite and PostgreSQL compatible)

`provider` is switched through a single line plus `DATABASE_URL`. README documents the swap. No enums, no native-only types. Primary keys are `cuid()` strings.

```prisma
generator client { provider = "prisma-client-js" }
datasource db   { provider = "sqlite"  url = env("DATABASE_URL") }  // "postgresql" in production

// ── Auth and people ─────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?                 // null for OAuth-only users
  name          String?
  image         String?
  emailVerified DateTime?
  onboardedAt   DateTime?
  createdAt     DateTime  @default(now())
  profile       Profile?
  accounts      Account[]
  sessions      Session[]
  memberships   Membership[]
  notifications Notification[]
}
model Account { /* Auth.js standard fields, @@unique([provider, providerAccountId]) */ }
model Session { /* Auth.js standard fields */ }
model VerificationToken { /* Auth.js standard fields */ }

model Profile {                         // global, shown in every circle
  userId       String  @id
  headline     String?
  currentRole  String?
  company      String?
  industry     String?
  bio          String?
  linkedinUrl  String?
  expertise    String  @default("[]")   // JSON string[]
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ── Circles ─────────────────────────────────────────────────────
model Circle {
  id          String   @id @default(cuid())
  name        String
  purpose     String
  cadence     String?                    // weekly | biweekly | monthly
  accent      String   @default("indigo")// one of the palette keys
  inviteCode  String   @unique           // 8 chars, unambiguous alphabet
  inviteOpen  Boolean  @default(true)    // Founder can pause invites
  createdAt   DateTime @default(now())
  members     Membership[]
  // relations to every circle-scoped model below, all onDelete: Cascade
}
model Membership {
  id            String   @id @default(cuid())
  circleId      String
  userId        String
  role          String   @default("MEMBER")   // FOUNDER | MEMBER
  workingOn     String?                        // per-circle directory fields
  canHelpWith   String?
  lookingFor    String?
  joinedAt      DateTime @default(now())
  @@unique([circleId, userId])
  @@index([userId])
}

// ── Goals and check-ins ─────────────────────────────────────────
model Goal {
  id, circleId, ownerId, title, description?, target?, deadline DateTime?,
  quarter String,                               // "2026-Q4"
  status String @default("ON_TRACK"),           // ON_TRACK | AT_RISK | DONE
  createdAt, updatedAt
  checkIns CheckIn[]
  @@index([circleId, quarter])
}
model CheckIn {
  id, goalId, authorId, progressed String, blocked String?, helpNeeded String?, createdAt
}

// ── Meetings, notes, decisions, action items ────────────────────
model Meeting {
  id, circleId, createdById, title, startsAt DateTime, location String?,
  videoUrl String?, notesMd String @default(""), createdAt, updatedAt
  agenda       AgendaItem[]
  decisions    Decision[]
  actionItems  ActionItem[]
  @@index([circleId, startsAt])
}
model AgendaItem   { id, meetingId, text, position Int }
model ActionItem {
  id, circleId, meetingId?, ownerId, title, dueDate DateTime?,
  done Boolean @default(false), doneAt DateTime?, createdAt
  @@index([ownerId, done])          // powers "My tasks" and the shared board
}
model Decision {
  id, circleId, meetingId?, createdById, title (the decision), context String,
  decidedOn DateTime, status String @default("ACTIVE"),  // ACTIVE | REVISITED | REVERSED
  involved DecisionParticipant[]
  @@index([circleId, decidedOn])
}
model DecisionParticipant { decisionId, userId, @@id([decisionId, userId]) }

// ── Opportunities ───────────────────────────────────────────────
model Opportunity {
  id, circleId, authorId, type String,   // JOB_LEAD | INTRO | COLLAB | REFERRAL | QUESTION
  title, description, tags String @default("[]"),
  status String @default("OPEN"),        // OPEN | FILLED | CLOSED
  createdAt, updatedAt
  @@index([circleId, status])
}

// ── Projects (Kanban) ───────────────────────────────────────────
model Board  { id, circleId @unique, columns BoardColumn[] }
model BoardColumn { id, boardId, name, position Int, cards ProjectCard[] }
model ProjectCard {
  id, columnId, circleId, title, description?, ownerId?, dueDate?, label String?,
  position Float,                        // fractional indexing: one write per drag
  createdAt, updatedAt
  checklist ChecklistItem[]
}
model ChecklistItem { id, cardId, text, done Boolean, position Int }

// ── Polls ───────────────────────────────────────────────────────
model Poll {
  id, circleId, authorId, question, closesAt DateTime?, createdAt
  options PollOption[]
}
model PollOption { id, pollId, text, position Int, votes PollVote[] }
model PollVote {
  id, pollId, optionId, userId
  @@unique([pollId, userId])             // one vote per member, enforced by the database
}

// ── Library ─────────────────────────────────────────────────────
model Resource {
  id, circleId, authorId, kind String,   // LINK | FILE | NOTE
  title, url String?, filePath String?, body String?,
  whyUseful String, tags String @default("[]"), createdAt
}

// ── Cross-cutting ───────────────────────────────────────────────
model Comment {                           // one table, polymorphic by (targetType, targetId)
  id, circleId, authorId, targetType String, // GOAL | CHECKIN | OPPORTUNITY | CARD | DECISION | MEETING
  targetId String, body String, createdAt
  reactions Reaction[]
  @@index([targetType, targetId])
}
model Reaction {                          // 👍 🎯 💡 🙌 🔥 stored as keys: thumbs, target, bulb, raised, fire
  id, commentId?, targetType?, targetId?, userId, key String
  @@unique([userId, commentId, targetType, targetId, key])
}
model Notification {
  id, userId, circleId, type String,     // ACTION_ITEM | MEETING | OPPORTUNITY | COMMENT | POLL
  title String, href String, readAt DateTime?, createdAt
  @@index([userId, readAt])
}
model Activity {                          // feeds Circle home
  id, circleId, actorId, verb String, summary String, href String, createdAt
  @@index([circleId, createdAt])
}
```

Notes:
- **Every circle-scoped table carries `circleId`**, even when it could be derived. That makes the membership check a single indexed lookup.
- Comments and reactions are polymorphic on purpose: one thread component serves goals, cards, opportunities, decisions and meetings.
- The "weekly summary" on Circle home is computed on read from the last 7 days of `Activity`, `Goal`, `ActionItem` and `Decision`. No cron job needed.
- **Shared action-item board** is a filtered view of `ActionItem` for the circle, so "My tasks" and the board can never drift apart.

---

## 6. Page list

**Public:** `/`, `/features`, `/how-it-works`, `/about`, `/privacy`, `/login`, `/signup`, `/join/[code]`, custom 404, global loading, error page.

**App:** `/onboarding` (3 steps), `/app/circles/new`, `/app/tasks`, `/app/notifications`, `/app/settings`, and under `/app/c/[circleId]/`: home, members (+ profile), goals (+ detail), meetings (+ detail, archive tab), decisions, opportunities, projects, polls, library, settings (Founder only).

**API routes:** Auth.js handler and the circle export download (`?format=md|csv`). Everything else is a server action.

---

## 7. Phases (one at a time, each ends with run, test, fix, commit, and a "what to test" list)

| # | Phase | Contents |
|---|---|---|
| 1 | Setup, design system, schema | Next.js + TS strict, Tailwind, shadcn customized, tokens (light and dark), fonts, `<Emoji>`, buttons, cards, tags, pills, forms, `Highlight`, `Sticker`, blobs, contrast check script, Prisma schema and first migration, Vitest wired up. A `/design` preview page showing every component (removed or gated at Phase 8). |
| 2 | All public pages | Landing (every section listed in the brief), features, how-it-works, about, privacy, 404, loading. Framer Motion reveals, counters, marquee, product mockups built from real components. |
| 3 | Auth, onboarding, circles, directory | Auth.js, onboarding, profile, create and join circles, invite link and code, roles, `requireMember` guard + tests, member directory with tag filter, app shell. |
| 4 | Goals and check-ins | Goals CRUD, status pills, check-ins, circle goal view, comments and reactions (shared component), notification for comments. |
| 5 | Meetings, action items, decisions | Meetings with agenda, markdown notes, decisions, action items with owners, "My tasks", shared board, past meetings archive, decision log search and filter, notifications. |
| 6 | Projects, opportunities, polls | Kanban with @dnd-kit, editable columns, cards with checklist and comments. Opportunities board with types, responses, status. Polls with vote rules and results after voting, notifications. |
| 7 | Library, circle home, notifications, export | Resource library, circle home dashboard and weekly summary, notification center, Markdown and CSV export with tests. |
| 8 | Accessibility, SEO, seed, README | Keyboard and screen-reader pass, focus states, reduced motion, per-page metadata and Open Graph, sitemap, seed script with realistic demo circles (two circles, 8 to 10 people, no lorem ipsum), README with Vercel deployment (Postgres, env vars, migrations). |

---

## 8. Quality bars that apply to every phase

- Strict TypeScript, no `any`, `noUncheckedIndexedAccess` on.
- Every server action: Zod parse, then `requireMember` (or `requireFounder`), then the data operation. Tests assert that a non-member gets an error for each domain.
- Emoji appear only as accents (tiles, nav, empty states, success toasts, reactions). Never in decisions, goal text, meeting notes or error messages. Maximum two per heading.
- Copy is written for the page. No lorem ipsum.
- Mobile-first. Test at 375, 768 and 1280 px.
- After each phase: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then commit on the working branch.

---

## 9. Questions for you

1. **Location.** OK to build in `meridian/` inside this repo (on branch `claude/relaxed-brahmagupta-c8zc33`), or do you want a separate repository?
2. **Palette and fonts.** Happy with indigo-violet `#4B3BD6`, Bricolage Grotesque and Inter, and Twemoji?
3. **Library files.** Is link and note support enough for v1, with upload behind an adapter, or must file upload work on Vercel out of the box (that needs a Blob or S3 account)?
4. **Tags as JSON strings.** OK to trade some query power for single-schema SQLite and PostgreSQL support?

**Reply "approved" (plus any changes) and I will start Phase 1.**
