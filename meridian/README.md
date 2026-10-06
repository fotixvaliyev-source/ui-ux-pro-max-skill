# Meridian

*Your circle, finally organized.*

Meridian is a private workspace for small groups of experienced professionals who support each other's careers and ventures: peer circles, masterminds, founder groups, alumni groups. It is deliberately not an enterprise tool. There is no CRM, no sprint planning and no permission matrix. A circle has **Founders** and **Members**, and that is the whole model.

Serious substance, creative packaging: what people write (goals, decisions, notes) stays clean and professional, while the interface and public site have personality.

**What is inside**

| Area | What it does |
|---|---|
| Public site | Landing page, features, how it works, about, privacy, custom 404 and loading states |
| Auth and onboarding | Email + password, optional Google and LinkedIn, three-step onboarding |
| Circles | Create or join by private link or 8-character code, Founder and Member roles |
| Member directory | Profiles, expertise tags, "working on / can help with / looking for", search and tag filter |
| Goals and check-ins | Quarterly goals with status pills, check-ins, circle-wide view, comments and five reactions |
| Meetings | Agenda, markdown notes, decisions, action items with owners and dates, past-meeting archive |
| Decision log | Reasoning, participants, status (Active / Revisited / Reversed), search and filters |
| Tasks | Action items on a shared board and in each owner's "My tasks" |
| Opportunities | Job leads, introductions, collaborations, referrals, questions, with replies |
| Projects | Drag-and-drop Kanban with editable columns, checklists and comments |
| Polls | One vote per member, results after voting, optional deadline |
| Library | Links, files and notes, each with a "why this is useful" |
| Circle home | Next meeting, my tasks, goal overview, decisions, opportunities, activity, weekly summary |
| Notifications | In-app only: assigned action item, new meeting, new opportunity, comment, new poll |
| Export | Decisions, meeting notes and action items as Markdown or CSV |

**Stack:** Next.js 15 (App Router) and TypeScript (strict), Tailwind CSS with design tokens, Radix primitives (shadcn-style components), Prisma with SQLite locally and PostgreSQL in production, Auth.js v5, `@dnd-kit`, Zod, Framer Motion, Vitest.

---

## Install

Requirements: Node.js 20.9 or newer, and npm.

```bash
git clone <your repository url>
cd meridian            # if the app lives in a subfolder
npm install
```

`npm install` also runs `prisma generate`.

## Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a `postgresql://` URL |
| `AUTH_SECRET` | yes | Signs session cookies. Generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | no | Enables "Continue with Google" when both are set |
| `AUTH_LINKEDIN_ID` / `AUTH_LINKEDIN_SECRET` | no | Enables "Continue with LinkedIn" when both are set |
| `NEXT_PUBLIC_SITE_URL` | no | Public origin for Open Graph tags and the sitemap. Falls back to the Vercel production URL, then `http://localhost:3000` |
| `AUTH_URL` | no | Only if Auth.js cannot work out your origin. It trusts the request host by default |
| `UPLOAD_DIR` | no | Where library files are stored. Defaults to `./uploads` |
| `ENABLE_DESIGN_PAGE` | no | Set to `true` to expose the internal `/design` component gallery in production |

OAuth callback URLs: `https://<your-domain>/api/auth/callback/google` and `https://<your-domain>/api/auth/callback/linkedin` (use `http://localhost:3000/...` locally).

## Database setup (local, SQLite)

```bash
npx prisma migrate dev     # creates prisma/dev.db and applies the migrations
npm run db:seed            # optional: realistic demo data
```

## Run locally

```bash
npm run dev                # http://localhost:3000
```

With the seed loaded, log in as any demo user, for example `maya@demo.meridian.example`, password `meridian-demo`. The seed creates two circles ("Tuesday Founders" and "Class of '19 Alumni") and nine people with a few weeks of goals, check-ins, meetings, decisions, tasks, posts, polls and library items. Running it again resets the demo data and leaves everything else alone.

Other useful commands:

```bash
npm test                   # Vitest (uses its own throwaway SQLite database)
npm run typecheck
npm run lint
npm run check:contrast     # WCAG AA check of every colour token, light and dark
npm run build && npm start # production build
npm run db:studio          # browse the database
```

---

## Deploy to Vercel

Vercel runs serverless functions without a persistent disk, so you need a hosted PostgreSQL database. The schema works on both databases (no enums, no native-only types).

### 1. Create a PostgreSQL database

Any provider works: Vercel Postgres / Neon, Supabase, Railway. Copy its connection string.

### 2. Switch Prisma to PostgreSQL

In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

The committed migrations were generated for SQLite, so create a fresh PostgreSQL baseline once, from your machine:

```bash
rm -rf prisma/migrations
DATABASE_URL="postgresql://..." npx prisma migrate dev --name init
```

Commit the new `prisma/migrations` folder. (For a throwaway preview you can use `npx prisma db push` instead and skip migrations.)

### 3. Create the Vercel project

1. Push the repository to GitHub and import it in Vercel. If the app is in a subfolder, set **Root Directory** to it.
2. Framework preset: **Next.js**. The default build command works (`npm run build` runs `prisma generate` first).
3. Add the environment variables (Settings, Environment Variables):
   - `DATABASE_URL`: your PostgreSQL connection string
   - `AUTH_SECRET`: a long random string
   - `NEXT_PUBLIC_SITE_URL`: your production URL (optional on Vercel, needed for a custom domain)
   - Google / LinkedIn credentials if you want social login
4. Apply the migrations to the production database before the first visit:

   ```bash
   DATABASE_URL="postgresql://..." npm run db:deploy
   ```

   Run the same command whenever you add a migration. (You can also add it to the build command: `prisma migrate deploy && npm run build`.)
5. Deploy. Optionally seed a demo database: `DATABASE_URL="postgresql://..." npm run db:seed`.

### 4. File uploads on Vercel

Library files are stored through a small storage adapter (`src/server/storage.ts`). The default adapter writes to the local disk, which is perfect for development and for hosts with a persistent volume, but **is not durable on Vercel**. Before enabling file uploads in production, implement the three-method `StorageAdapter` interface (`save`, `read`, `remove`) for Vercel Blob or S3 and export it as `storage`. Links and notes need no storage and work everywhere.

### 5. Post-deploy checklist

- Sign up, create a circle, open the invite link in a private window and join it.
- Check `/sitemap.xml`, `/robots.txt` and the social preview image at `/opengraph-image`.
- Set the OAuth callback URLs if you enabled Google or LinkedIn.

---

## How it is built

```
src/
├── app/                 Next.js routes
│   ├── (public)/        landing, features, how it works, about, privacy
│   ├── (auth)/          login, signup, join by invite link
│   ├── onboarding/      three-step wizard
│   ├── app/             the signed-in app (circles, goals, meetings, ...)
│   └── api/             Auth.js, circle export, file downloads
├── components/          ui (primitives), brand (emoji, blobs, ...), marketing, app
├── server/
│   ├── access.ts        membership and Founder checks (no framework imports)
│   ├── guards.ts        requireUser / requireMember for pages and actions
│   ├── services/        all business logic, one file per area
│   ├── actions/         thin server actions: parse, check, call a service
│   └── validation/      Zod schemas
├── lib/                 constants, tags, dates, tone maps
└── tests/               Vitest, run against a real SQLite database
```

**Security model.** Every server action and API route validates input with Zod, then goes through `membershipOrThrow(userId, circleId, { founder })` before reading or changing anything. Services take the acting user as an argument, so the checks are tested directly (`src/tests`). Content ids from another circle are treated as missing. Uploaded files are served through an authenticated route as attachments, markdown is rendered without raw HTML, and CSV exports defuse spreadsheet formulas.

**Design system.** Colours are CSS variables in `src/app/globals.css` and mapped in `tailwind.config.ts`. Each feature owns one colour (Goals coral, Meetings indigo, Decisions yellow, Opportunities mint, Projects sky, Library lilac, Directory peach). Display type is Bricolage Grotesque, body is Inter. Emoji are Twemoji SVGs rendered through a single `<Emoji>` component. `npm run check:contrast` fails if any token pair drops below WCAG AA.

**Notes for contributors**

- Next.js is pinned to **15.3.x**. With 15.5 the client intermittently dropped page refreshes after server actions in testing; revisit when upgrading.
- Server actions never call `revalidatePath` or `redirect`. They return `{ ok, data: { redirectTo } }` and the client navigates or refreshes (see `ActionForm` and `src/lib/refresh.ts`).
- Statuses and types are plain strings validated by Zod (`src/lib/constants.ts`), and tag lists are JSON strings (`src/lib/tags.ts`), so one schema serves SQLite and PostgreSQL.

## Credits

Emoji artwork: [Twemoji](https://github.com/jdecked/twemoji), licensed CC-BY 4.0 (`public/emoji/LICENSE.txt`). Fonts: Bricolage Grotesque and Inter, via Google Fonts (SIL Open Font License).
