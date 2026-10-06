/**
 * Demo data: two circles, nine people, a few weeks of believable activity.
 * Safe to re-run: it removes the previous demo users and circles first.
 *
 *   npm run db:seed
 *
 * Every demo account uses the password "meridian-demo". For example maya@demo.meridian.example
 * (Founder of Tuesday Founders) or aisha@demo.meridian.example (Founder of the alumni circle).
 * The full list is in PEOPLE below.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { serializeTags } from "../src/lib/tags";
import { generateInviteCode } from "../src/server/services/invites";

const db = new PrismaClient();
const DOMAIN = "demo.meridian.example";
const PASSWORD = "meridian-demo";
const DAY = 24 * 3600 * 1000;
const now = new Date();
const ago = (days: number, hour = 9) => new Date(now.getTime() - days * DAY + (hour - 12) * 3600 * 1000);
const ahead = (days: number, hour = 9) => ago(-days, hour);
const quarter = `${now.getUTCFullYear()}-Q${Math.floor(now.getUTCMonth() / 3) + 1}`;
const quarterEnd = new Date(Date.UTC(now.getUTCFullYear(), (Math.floor(now.getUTCMonth() / 3) + 1) * 3, 0, 12));

const PEOPLE = [
  { key: "maya", name: "Maya Okafor", headline: "Founder building scheduling software for independent clinics", role: "CEO", company: "Clinic Loop", industry: "Healthtech", bio: "Second-time founder. Spent six years running operations at a hospital group before starting Clinic Loop. Happy to talk hiring, pricing and surviving the first fifty customers.", expertise: ["fundraising", "hiring", "pricing", "healthcare"], linkedin: "https://linkedin.com/in/maya-okafor-demo" },
  { key: "daniel", name: "Daniel Reyes", headline: "Growth lead, formerly at two fintechs", role: "Head of Growth", company: "Ledgerly", industry: "Fintech", bio: "I run experiments for a living. Most of them fail, and I have learned to write down why.", expertise: ["growth", "pricing", "analytics", "sales"], linkedin: "https://linkedin.com/in/daniel-reyes-demo" },
  { key: "priya", name: "Priya Nair", headline: "Founder, analytics for mid-market retailers", role: "Founder", company: "Lumen Analytics", industry: "Data and analytics", bio: "Built the data team at a grocery chain, then left to sell them better dashboards.", expertise: ["data", "hiring", "retail", "pricing"], linkedin: "https://linkedin.com/in/priya-nair-demo" },
  { key: "sam", name: "Sam Whitfield", headline: "Fractional CFO for seed-stage startups", role: "Fractional CFO", company: "Whitfield & Co", industry: "Finance", bio: "Twelve years in finance, the last five helping founders understand their own numbers.", expertise: ["finance", "fundraising", "budgeting"], linkedin: "https://linkedin.com/in/sam-whitfield-demo" },
  { key: "lena", name: "Lena Hoffmann", headline: "Product designer turned studio owner", role: "Principal", company: "Studio Hoffmann", industry: "Design", bio: "Small studio, big clients. I write about the business of design more than I would like to.", expertise: ["design", "branding", "freelancing"], linkedin: "" },
  { key: "tomas", name: "Tomás Rivera", headline: "Operations lead for a logistics scale-up", role: "VP Operations", company: "Fleetwise", industry: "Logistics", bio: "I like systems that keep working when everyone is on holiday.", expertise: ["operations", "hiring", "logistics"], linkedin: "https://linkedin.com/in/tomas-rivera-demo" },
  { key: "aisha", name: "Aisha Bello", headline: "Product manager at a retail bank", role: "Senior Product Manager", company: "Northgate Bank", industry: "Banking", bio: "Shipping small, careful products inside a large, careful institution.", expertise: ["product", "compliance", "banking"], linkedin: "https://linkedin.com/in/aisha-bello-demo" },
  { key: "marcus", name: "Marcus Chen", headline: "Early-stage investor", role: "Associate", company: "Kestrel Ventures", industry: "Venture capital", bio: "I read a lot of decks. I like the ones that say what is not working yet.", expertise: ["fundraising", "venture", "markets"], linkedin: "https://linkedin.com/in/marcus-chen-demo" },
  { key: "elena", name: "Elena Petrova", headline: "Data scientist working on forecasting", role: "Staff Data Scientist", company: "Meridiem Energy", industry: "Energy", bio: "Forecasting demand for a living. Occasionally right, always documented.", expertise: ["data", "forecasting", "python"], linkedin: "" },
] as const;
type Key = (typeof PEOPLE)[number]["key"];

async function reset() {
  const demoUsers = await db.user.findMany({ where: { email: { endsWith: `@${DOMAIN}` } }, select: { id: true } });
  const ids = demoUsers.map((u) => u.id);
  const circles = await db.membership.findMany({ where: { userId: { in: ids }, role: "FOUNDER" }, select: { circleId: true } });
  const circleIds = [...new Set(circles.map((c) => c.circleId))];
  await db.notification.deleteMany({ where: { OR: [{ userId: { in: ids } }, { circleId: { in: circleIds } }] } });
  await db.reaction.deleteMany({ where: { circleId: { in: circleIds } } });
  await db.circle.deleteMany({ where: { id: { in: circleIds } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

async function main() {
  await reset();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = {} as Record<Key, string>;
  for (const p of PEOPLE) {
    const u = await db.user.create({
      data: {
        email: `${p.key}@${DOMAIN}`, name: p.name, passwordHash, onboardedAt: ago(40),
        profile: { create: { headline: p.headline, currentRole: p.role, company: p.company, industry: p.industry, bio: p.bio, linkedinUrl: p.linkedin || null, expertise: serializeTags(p.expertise) } },
      },
    });
    user[p.key] = u.id;
  }

  // ── Circle 1: Tuesday Founders ──────────────────────────────────
  const founders = await db.circle.create({
    data: {
      name: "Tuesday Founders", purpose: "Six founders and operators who hold each other to one real goal per quarter. We meet every Tuesday at 8:00.",
      cadence: "weekly", accent: "indigo", inviteCode: generateInviteCode(), createdAt: ago(60),
      members: { create: [
        { userId: user.maya, role: "FOUNDER", workingOn: "Usage-based pricing pilot with three clinics", canHelpWith: "Hiring the first operations person, healthcare sales", lookingFor: "An introduction to a CFO at a multi-site clinic group", joinedAt: ago(60) },
        { userId: user.daniel, role: "MEMBER", workingOn: "Rebuilding the onboarding funnel", canHelpWith: "Growth experiments, pricing page teardowns", lookingFor: "A senior engineer who has worked in payments", joinedAt: ago(58) },
        { userId: user.priya, role: "MEMBER", workingOn: "Moving from seat-based to usage-based pricing", canHelpWith: "Data hiring, analytics stacks for retail", lookingFor: "A retail CFO willing to talk for thirty minutes", joinedAt: ago(58) },
        { userId: user.sam, role: "MEMBER", workingOn: "A budgeting template for pre-seed teams", canHelpWith: "Fundraising math, runway planning", lookingFor: "Two founders to test the template with", joinedAt: ago(50) },
        { userId: user.lena, role: "MEMBER", workingOn: "Brand refresh for a logistics client", canHelpWith: "Brand, positioning, freelancing contracts", lookingFor: "Referrals to B2B software companies", joinedAt: ago(45) },
        { userId: user.tomas, role: "MEMBER", workingOn: "Cutting delivery exceptions by a third", canHelpWith: "Operations playbooks, scaling support teams", lookingFor: "Advice on forecasting seasonal demand", joinedAt: ago(40) },
      ] },
    },
  });
  const board1 = await db.board.create({ data: { circleId: founders.id, columns: { create: ["Backlog", "In progress", "Review", "Done"].map((name, position) => ({ name, position })) } }, include: { columns: { orderBy: { position: "asc" } } } });

  const goals = [
    { owner: "maya", title: "Sign three pilot clinics on usage-based pricing", target: "3 signed pilots", status: "ON_TRACK", description: "Pilot agreements for the new pricing, each with a 90-day review." },
    { owner: "maya", title: "Hire an operations lead", target: "Offer accepted", status: "AT_RISK", description: "The first non-founder operations hire." },
    { owner: "daniel", title: "Lift trial-to-paid conversion", target: "From 9% to 12%", status: "ON_TRACK", description: "Three experiments on onboarding and pricing page copy." },
    { owner: "priya", title: "Migrate all customers to usage-based billing", target: "100% of active accounts", status: "AT_RISK", description: "Migration plan, comms and a rollback path." },
    { owner: "sam", title: "Publish the pre-seed budgeting template", target: "Template live, 20 downloads", status: "DONE", description: "A free template with a short guide." },
    { owner: "lena", title: "Land two new B2B software clients", target: "2 signed statements of work", status: "ON_TRACK", description: "" },
    { owner: "tomas", title: "Cut delivery exceptions by a third", target: "Exceptions per 1,000 deliveries: 18 to 12", status: "ON_TRACK", description: "Root-cause the top three exception types and fix the process behind each." },
  ] as const;
  const goalIds: Record<string, string> = {};
  for (const g of goals) {
    const row = await db.goal.create({ data: { circleId: founders.id, ownerId: user[g.owner], title: g.title, target: g.target, description: g.description || null, status: g.status, quarter, deadline: quarterEnd, createdAt: ago(30) } });
    goalIds[g.title] = row.id;
  }
  const checkIns: [string, Key, string, string | null, string | null, number][] = [
    ["Sign three pilot clinics on usage-based pricing", "maya", "Two pilots signed. The third is waiting on their finance team.", "Their CFO has not seen the pricing model yet.", "An introduction to a CFO at a multi-site clinic group.", 6],
    ["Hire an operations lead", "maya", "Interviewed four candidates. Two are strong.", "I cannot agree the scope of the role with myself.", "Someone who has hired a first operations person to compare notes.", 4],
    ["Lift trial-to-paid conversion", "daniel", "Experiment one shipped: shorter signup. Early read is positive.", null, null, 5],
    ["Migrate all customers to usage-based billing", "priya", "Migrated 40% of accounts. The biggest accounts are next.", "Two large customers want a cap on monthly charges.", "How others handled caps without gutting revenue.", 3],
    ["Cut delivery exceptions by a third", "tomas", "Exceptions down from 18 to 15 per 1,000. Address validation helped most.", null, null, 2],
  ];
  for (const [title, who, progressed, blocked, help, days] of checkIns) {
    await db.checkIn.create({ data: { goalId: goalIds[title]!, authorId: user[who], progressed, blocked, helpNeeded: help, createdAt: ago(days) } });
  }

  const comment = async (circleId: string, author: Key, type: string, targetId: string, body: string, days: number) =>
    db.comment.create({ data: { circleId, authorId: user[author], targetType: type, targetId, body, createdAt: ago(days) } });
  const react = async (circleId: string, who: Key, scope: string, key: string, extra: { commentId?: string; targetType?: string; targetId?: string }) =>
    db.reaction.create({ data: { circleId, userId: user[who], scope, key, ...extra } });

  const goalMaya = goalIds["Sign three pilot clinics on usage-based pricing"]!;
  const c1 = await comment(founders.id, "priya", "GOAL", goalMaya, "Two of three is a strong start. When you present the model to the CFO, lead with the cap. That was the thing mine pushed back on.", 5);
  await comment(founders.id, "sam", "GOAL", goalMaya, "Happy to build a one-page cost comparison for their finance team. Send me their current invoice shape.", 5);
  await react(founders.id, "maya", `C:${c1.id}`, "raised", { commentId: c1.id });
  await react(founders.id, "daniel", `GOAL:${goalMaya}`, "fire", { targetType: "GOAL", targetId: goalMaya });
  await react(founders.id, "tomas", `GOAL:${goalMaya}`, "thumbs", { targetType: "GOAL", targetId: goalMaya });
  await comment(founders.id, "maya", "GOAL", goalIds["Migrate all customers to usage-based billing"]!, "I capped the first two enterprise accounts at their current spend for six months. Cheap insurance, and it kept both of them.", 2);

  // Meetings
  const lastTue = await db.meeting.create({
    data: {
      circleId: founders.id, createdById: user.maya, title: "Tuesday call: pricing and hiring", startsAt: ago(7, 8), location: "Back room, Café Lune", videoUrl: "https://meet.example.com/tuesday-founders",
      notesMd: "## Wins\n- Maya signed her second pilot clinic.\n- Daniel's shorter signup flow is live.\n\n## Pricing\nPriya walked us through the usage-based migration.\n- Customers like the model but worry about unpredictable bills.\n- **Agreed:** offer a monthly spend cap on the first contract.\n\n## Hiring\n- Maya is torn between an operations generalist and a finance-leaning operator.\n- Tomás shared the scorecard he used for his last hire.\n\n## Next time\nBring one number you are embarrassed about.",
      agenda: { create: ["Wins since last time", "Priya: usage-based migration", "Maya: first operations hire", "Anything else"].map((text, position) => ({ text, position })) },
    },
  });
  const nextTue = await db.meeting.create({
    data: {
      circleId: founders.id, createdById: user.maya, title: "Tuesday call: Q4 check-in", startsAt: ahead(3, 8), location: "Back room, Café Lune", videoUrl: "https://meet.example.com/tuesday-founders",
      agenda: { create: ["Wins since last time", "Goal check-ins: who is at risk?", "Daniel: conversion experiment results", "Pick the venue for the November dinner"].map((text, position) => ({ text, position })) },
    },
  });
  await db.meeting.create({ data: { circleId: founders.id, createdById: user.sam, title: "September retro", startsAt: ago(35, 8), notesMd: "## What worked\n- Pairing up on goal reviews.\n\n## What did not\n- Too many tangents in the first half hour.\n\n## Changes\n- Strict agenda order. Tangents go to the group chat or the library.", agenda: { create: [{ text: "Retro", position: 0 }] } } });

  const decisions = [
    { by: "maya", title: "Offer a monthly spend cap on the first usage-based contract", context: "Customers like usage-based pricing but fear unpredictable bills. A cap removes the objection at a small cost to upside, and we can lift it after six months once they trust the model.", on: ago(7), status: "ACTIVE", who: ["maya", "priya", "daniel", "tomas"], meeting: lastTue.id },
    { by: "sam", title: "Keep the circle at six members until the end of the year", context: "Trust and candour dropped when we tried eight in the spring. Six lets everyone speak every week. Revisit in January with a waiting list in mind.", on: ago(40), status: "ACTIVE", who: ["maya", "daniel", "priya", "sam", "lena", "tomas"], meeting: null },
    { by: "daniel", title: "Move the call from Wednesday to Tuesday morning", context: "Wednesday clashed with two members' board meetings. Tuesday at 8:00 works for everyone, and an early start keeps it from sprawling.", on: ago(55), status: "REVISITED", who: ["daniel", "maya", "priya"], meeting: null },
    { by: "maya", title: "Rotate the facilitator every week", context: "One person running every meeting made it feel like Maya's meeting. We tried rotation for a month and it was better, but it needs a reminder.", on: ago(48), status: "REVERSED", who: ["maya", "sam", "lena"], meeting: null },
  ] as const;
  for (const d of decisions) {
    await db.decision.create({ data: { circleId: founders.id, createdById: user[d.by], title: d.title, context: d.context, decidedOn: d.on, status: d.status, meetingId: d.meeting, involved: { create: d.who.map((k) => ({ userId: user[k] })) } } });
  }

  const actions: [string, Key, number | null, boolean, string | null][] = [
    ["Share the sales scorecard with the group", "daniel", 3, false, lastTue.id],
    ["Introduce Priya to the retail CFO at Northwind", "maya", 5, true, lastTue.id],
    ["Draft a one-page spend cap explainer for customers", "priya", 4, false, lastTue.id],
    ["Send Maya the hiring scorecard", "tomas", -1, true, lastTue.id],
    ["Book the venue for the November dinner", "lena", 10, false, nextTue.id],
  ];
  for (const [title, who, due, done, meetingId] of actions) {
    await db.actionItem.create({ data: { circleId: founders.id, meetingId, ownerId: user[who], title, dueDate: due === null ? null : ahead(due), done, doneAt: done ? ago(3) : null, createdAt: ago(7) } });
  }

  // Opportunities
  const opps = [
    { by: "maya", type: "INTRO", title: "Looking for an introduction to a CFO at a multi-site clinic group", description: "We are piloting usage-based pricing and need to talk to someone who signs off on software budgets for a group of clinics. Thirty minutes is plenty.", tags: ["finance", "healthcare"], status: "OPEN", days: 6 },
    { by: "daniel", type: "JOB_LEAD", title: "Senior backend engineer, payments, remote in Europe", description: "Ledgerly is hiring a senior engineer for the payments team. Real ownership, small team, and we are honest about the on-call load. Message me for details.", tags: ["engineering", "payments"], status: "OPEN", days: 9 },
    { by: "lena", type: "COLLAB", title: "Case study partner: design system for a B2B product", description: "I am writing a case study on building a design system under tight deadlines. Looking for a founder who would let me document the process for a client.", tags: ["design"], status: "OPEN", days: 12 },
    { by: "sam", type: "REFERRAL", title: "Client referral: seed-stage fintech needs fractional finance support", description: "A founder I cannot take on is looking for a fractional CFO for a seed-stage fintech. I can recommend two good people if you want the referral fee.", tags: ["finance", "fintech"], status: "FILLED", days: 20 },
    { by: "tomas", type: "QUESTION", title: "How do you forecast seasonal demand with only two years of data?", description: "Our delivery volumes swing hard around holidays and we only have two clean years. Does anyone have a method that worked without overfitting?", tags: ["forecasting", "operations"], status: "OPEN", days: 4 },
  ] as const;
  const oppIds: string[] = [];
  for (const o of opps) {
    const row = await db.opportunity.create({ data: { circleId: founders.id, authorId: user[o.by], type: o.type, title: o.title, description: o.description, tags: serializeTags(o.tags), status: o.status, createdAt: ago(o.days) } });
    oppIds.push(row.id);
  }
  await comment(founders.id, "priya", "OPPORTUNITY", oppIds[0]!, "I know the CFO of Northwind Health. Sending you both a note tomorrow.", 5);
  await comment(founders.id, "sam", "OPPORTUNITY", oppIds[4]!, "Start with a simple seasonal naive baseline and only add complexity if it beats it by a clear margin. Happy to share a notebook.", 3);
  await comment(founders.id, "priya", "OPPORTUNITY", oppIds[4]!, "Elena Petrova in the alumni circle does this for a living. I will ask her to reply here.", 3);

  // Projects
  const [backlog, inProgress, review, done] = board1.columns;
  const cards: [string, string, number, Key | null, number | null, string | null, [string, boolean][]][] = [
    [backlog!.id, "Write up the usage-based pricing playbook", 1, "priya", 21, "Pricing", [["Outline the sections", true], ["Add the cap clause examples", false], ["Review with Maya", false]]],
    [backlog!.id, "Quarterly dinner: shortlist venues", 2, "lena", 14, null, []],
    [inProgress!.id, "Shared hiring scorecard template", 1, "tomas", 7, "Hiring", [["Collect everyone's scorecards", true], ["Merge into one template", true], ["Test on Maya's open role", false]]],
    [inProgress!.id, "Pricing page teardown sheet", 2, "daniel", 5, "Growth", [["Collect ten pages", true], ["Score each against the checklist", false]]],
    [review!.id, "Pre-seed budgeting template v1", 1, "sam", 2, "Finance", []],
    [done!.id, "Agree the circle's meeting format", 1, "maya", null, null, [["Draft the format", true], ["Vote in the group", true]]],
  ];
  for (const [columnId, title, pos, owner, due, label, checks] of cards) {
    await db.projectCard.create({ data: { columnId, circleId: founders.id, title, position: pos * 1024, ownerId: owner ? user[owner] : null, dueDate: due === null ? null : ahead(due), label, checklist: { create: checks.map(([text, d], position) => ({ text, done: d, position })) } } });
  }

  // Polls
  const venuePoll = await db.poll.create({
    data: { circleId: founders.id, authorId: user.lena, question: "Where should we hold the November dinner?", closesAt: ahead(6), createdAt: ago(2), options: { create: ["Lisbon, Friday evening", "Berlin, Thursday evening", "Online, no travel"].map((text, position) => ({ text, position })) } },
    include: { options: { orderBy: { position: "asc" } } },
  });
  const votes: [Key, number][] = [["maya", 0], ["daniel", 0], ["sam", 1], ["tomas", 2]];
  for (const [who, idx] of votes) await db.pollVote.create({ data: { pollId: venuePoll.id, userId: user[who], optionId: venuePoll.options[idx]!.id } });

  // Library
  const library = [
    { by: "daniel", kind: "LINK", title: "The Mom Test: chapter notes", url: "https://example.com/mom-test-notes", why: "Fixes how we run customer calls. Read it before your next pricing conversation.", tags: ["research", "sales"] },
    { by: "sam", kind: "NOTE", title: "Seed-stage budget: the five lines that matter", body: "1. Payroll, fully loaded\n2. Infrastructure per customer\n3. Sales and marketing, as a share of new revenue\n4. Runway in months at current burn\n5. A contingency line you never touch\n\nEverything else is a rounding error until you have revenue.", why: "A fast sanity check before you open a spreadsheet.", tags: ["finance", "budgeting"] },
    { by: "tomas", kind: "LINK", title: "Designing on-call rotations that people can live with", url: "https://example.com/on-call", why: "The only article on this that admits the trade-offs. Useful for any team over ten people.", tags: ["operations", "hiring"] },
    { by: "lena", kind: "NOTE", title: "Client intake questions that save a month", body: "- What changes if this project succeeds?\n- Who has to approve it, and when?\n- What did you try before?\n- What would make you cancel?", why: "Four questions for the first call with any new client.", tags: ["freelancing", "design"] },
  ] as const;
  for (const r of library) {
    await db.resource.create({ data: { circleId: founders.id, authorId: user[r.by], kind: r.kind, title: r.title, url: "url" in r ? r.url : null, body: "body" in r ? r.body : null, whyUseful: r.why, tags: serializeTags(r.tags), createdAt: ago(10) } });
  }

  // ── Circle 2: Class of '19 alumni ───────────────────────────────
  const alumni = await db.circle.create({
    data: {
      name: "Class of '19 Alumni", purpose: "Classmates across banking, venture, data and startups who keep each other informed and introduced. Monthly call, steady board in between.",
      cadence: "monthly", accent: "coral", inviteCode: generateInviteCode(), createdAt: ago(90),
      members: { create: [
        { userId: user.aisha, role: "FOUNDER", workingOn: "A savings product for first-time investors", canHelpWith: "Banking compliance, product discovery", lookingFor: "Founders building in financial wellbeing", joinedAt: ago(90) },
        { userId: user.marcus, role: "MEMBER", workingOn: "Sourcing pre-seed deals in climate and energy", canHelpWith: "Fundraising intros, reading a term sheet", lookingFor: "Technical founders in energy", joinedAt: ago(88) },
        { userId: user.elena, role: "MEMBER", workingOn: "A demand forecasting model for a grid operator", canHelpWith: "Forecasting, Python, explaining models to non-technical people", lookingFor: "Practitioners who have deployed forecasts in production", joinedAt: ago(88) },
        { userId: user.priya, role: "MEMBER", workingOn: "Pricing change at Lumen", canHelpWith: "Retail analytics, data hiring", lookingFor: "A pricing advisor", joinedAt: ago(80) },
        { userId: user.daniel, role: "MEMBER", workingOn: "Conversion experiments", canHelpWith: "Growth, fintech go-to-market", lookingFor: "Stories from people who left big companies", joinedAt: ago(80) },
      ] },
    },
  });
  await db.board.create({ data: { circleId: alumni.id, columns: { create: ["Backlog", "In progress", "Review", "Done"].map((name, position) => ({ name, position })) } } });
  const aGoal = await db.goal.create({ data: { circleId: alumni.id, ownerId: user.aisha, title: "Launch the savings pilot to 500 customers", target: "500 active pilot customers", status: "ON_TRACK", quarter, deadline: quarterEnd, createdAt: ago(25) } });
  await db.checkIn.create({ data: { goalId: aGoal.id, authorId: user.aisha, progressed: "Compliance sign-off came through. We start onboarding next week.", blocked: null, helpNeeded: null, createdAt: ago(3) } });
  await db.goal.create({ data: { circleId: alumni.id, ownerId: user.elena, title: "Put the forecasting model into production", target: "Daily forecasts live for two regions", status: "AT_RISK", quarter, deadline: quarterEnd, createdAt: ago(25) } });
  const reunion = await db.meeting.create({ data: { circleId: alumni.id, createdById: user.aisha, title: "October alumni call", startsAt: ahead(9, 18), videoUrl: "https://meet.example.com/alumni", agenda: { create: ["Round of news", "Elena's forecasting question", "Plan the spring reunion"].map((text, position) => ({ text, position })) } } });
  await db.decision.create({ data: { circleId: alumni.id, createdById: user.aisha, title: "Hold the spring reunion in the city where most of us live", context: "Travel cost was the main reason people skipped last year. Choosing the largest cluster keeps attendance high; we rotate next year.", decidedOn: ago(20), status: "ACTIVE", involved: { create: [user.aisha, user.marcus, user.elena].map((userId) => ({ userId })) } } });
  await db.actionItem.create({ data: { circleId: alumni.id, meetingId: reunion.id, ownerId: user.marcus, title: "Collect where everyone lives for the reunion", dueDate: ahead(7), createdAt: ago(1) } });
  await db.opportunity.create({ data: { circleId: alumni.id, authorId: user.elena, type: "QUESTION", title: "Anyone deployed demand forecasts in production on a small team?", description: "We have a model that works in notebooks. Looking for people who have taken forecasting into daily production with two or three engineers, and what they wish they had known.", tags: serializeTags(["forecasting", "data"]), status: "OPEN", createdAt: ago(3) } });
  await db.poll.create({ data: { circleId: alumni.id, authorId: user.marcus, question: "Which weekday works best for the monthly call?", createdAt: ago(1), options: { create: ["Tuesday evening", "Wednesday lunchtime", "Thursday evening"].map((text, position) => ({ text, position })) } } });
  await db.resource.create({ data: { circleId: alumni.id, authorId: user.marcus, kind: "LINK", title: "How to read a term sheet in ten minutes", url: "https://example.com/term-sheet", whyUseful: "Covers the five clauses that actually matter for a first round.", tags: serializeTags(["fundraising"]), createdAt: ago(15) } });

  // Activity and notifications
  const act = (circleId: string, actor: Key, verb: string, summary: string, href: string, days: number) => db.activity.create({ data: { circleId, actorId: user[actor], verb, summary, href, createdAt: ago(days) } });
  await act(founders.id, "tomas", "checkin", "Tomás Rivera checked in on Cut delivery exceptions by a third", `/app/c/${founders.id}/goals`, 2);
  await act(founders.id, "lena", "poll", "Lena Hoffmann opened a poll about the November dinner", `/app/c/${founders.id}/polls`, 2);
  await act(founders.id, "priya", "checkin", "Priya Nair checked in on Migrate all customers to usage-based billing", `/app/c/${founders.id}/goals`, 3);
  await act(founders.id, "maya", "decision", "Maya Okafor logged a decision: spend cap on the first contract", `/app/c/${founders.id}/decisions`, 7);
  await act(founders.id, "maya", "meeting", "Maya Okafor scheduled Tuesday call: Q4 check-in", `/app/c/${founders.id}/meetings/${nextTue.id}`, 6);
  await act(alumni.id, "aisha", "meeting", "Aisha Bello scheduled October alumni call", `/app/c/${alumni.id}/meetings/${reunion.id}`, 4);
  const notes: [Key, string, string, string, number][] = [
    ["maya", "COMMENT", "Priya Nair commented on your goal", `/app/c/${founders.id}/goals/${goalMaya}`, 5],
    ["maya", "OPPORTUNITY", "New question for the group: How do you forecast seasonal demand with only two years of data?", `/app/c/${founders.id}/opportunities`, 4],
    ["maya", "POLL", "New poll: Where should we hold the November dinner?", `/app/c/${founders.id}/polls`, 2],
    ["maya", "MEETING", "New meeting: Tuesday call: Q4 check-in", `/app/c/${founders.id}/meetings/${nextTue.id}`, 1],
    ["daniel", "ACTION_ITEM", "Maya Okafor assigned you: Share the sales scorecard with the group", `/app/c/${founders.id}/tasks`, 7],
  ];
  for (const [who, type, title, href, days] of notes) await db.notification.create({ data: { userId: user[who], circleId: founders.id, type, title, href, createdAt: ago(days), readAt: days > 4 ? ago(days - 1) : null } });

  console.log("Seeded.\n");
  console.log("Circles: Tuesday Founders, Class of '19 Alumni");
  console.log(`Log in as any of: ${PEOPLE.map((p) => `${p.key}@${DOMAIN}`).join(", ")}`);
  console.log(`Password for all: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
