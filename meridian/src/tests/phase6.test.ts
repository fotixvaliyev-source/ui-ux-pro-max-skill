import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { ForbiddenError, UserError } from "@/server/access";
import { createCircle, joinCircleByCode } from "@/server/services/circles";
import { addChecklistItem, addColumn, createCard, deleteCard, deleteColumn, getBoard, moveCard, renameColumn, setChecklistItemDone, updateCard } from "@/server/services/projects";
import { createOpportunity, deleteOpportunity, listOpportunities, setOpportunityStatus } from "@/server/services/opportunities";
import { createPoll, isClosed, listPolls, vote } from "@/server/services/polls";
import { addComment } from "@/server/services/comments";
import { cardSchema, opportunitySchema, pollSchema } from "@/server/validation/projects";
import { makeUser } from "./helpers";

const circleInput = { name: "Phase Six", purpose: "A circle for testing projects and polls.", accent: "indigo" as const };

async function setup() {
  const founder = await makeUser("Founder");
  const member = await makeUser("Member");
  const circle = await createCircle(founder.id, circleInput);
  const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id: circle.id } });
  await joinCircleByCode(member.id, inviteCode);
  return { founder, member, circleId: circle.id };
}
const card = (over: Record<string, string> = {}) => cardSchema.parse({ title: "Write the case study", ...over });

describe("projects board", () => {
  it("has the four default columns and cards get increasing positions", async () => {
    const { founder, circleId } = await setup();
    const board = await getBoard(founder.id, circleId);
    expect(board.columns.map((c) => c.name)).toEqual(["Backlog", "In progress", "Review", "Done"]);
    await createCard(founder.id, circleId, card({ title: "First card" }));
    await createCard(founder.id, circleId, card({ title: "Second card" }));
    const after = await getBoard(founder.id, circleId);
    const cards = after.columns[0]?.cards ?? [];
    expect(cards.map((c) => c.title)).toEqual(["First card", "Second card"]);
    expect((cards[1]?.position ?? 0) > (cards[0]?.position ?? 0)).toBe(true);
  });

  it("moves a card between columns with one write and keeps order", async () => {
    const { founder, member, circleId } = await setup();
    const a = await createCard(founder.id, circleId, card({ title: "Card A" }));
    const b = await createCard(founder.id, circleId, card({ title: "Card B" }));
    const board = await getBoard(member.id, circleId);
    const inProgress = board.columns[1];
    if (!inProgress) throw new Error("no column");
    await moveCard(member.id, circleId, a.id, inProgress.id, 1024);
    await moveCard(member.id, circleId, b.id, inProgress.id, 512); // before A
    const moved = (await getBoard(member.id, circleId)).columns[1]?.cards.map((c) => c.title);
    expect(moved).toEqual(["Card B", "Card A"]);
  });

  it("renumbers when positions get too close", async () => {
    const { founder, circleId } = await setup();
    const a = await createCard(founder.id, circleId, card({ title: "Card A" }));
    const b = await createCard(founder.id, circleId, card({ title: "Card B" }));
    const col = (await getBoard(founder.id, circleId)).columns[0];
    if (!col) throw new Error("no column");
    await moveCard(founder.id, circleId, b.id, col.id, (await db.projectCard.findUniqueOrThrow({ where: { id: a.id } })).position + 1e-9);
    const positions = (await getBoard(founder.id, circleId)).columns[0]?.cards.map((c) => c.position) ?? [];
    expect(positions).toEqual([1024, 2048]);
  });

  it("refuses cards, columns and moves across circles and from outsiders", async () => {
    const { founder, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    const other = await createCircle(outsider.id, circleInput);
    const c = await createCard(founder.id, circleId, card());
    const foreignCol = (await getBoard(outsider.id, other.id)).columns[0];
    if (!foreignCol) throw new Error("no column");
    await expect(getBoard(outsider.id, circleId)).rejects.toThrow(ForbiddenError);
    await expect(moveCard(outsider.id, other.id, c.id, foreignCol.id, 1)).rejects.toThrow(UserError); // card is not in that circle
    await expect(moveCard(founder.id, circleId, c.id, foreignCol.id, 1)).rejects.toThrow(UserError); // column is not in this circle
    await expect(addComment(outsider.id, other.id, { type: "CARD", id: c.id }, "hi")).rejects.toThrow(UserError);
  });

  it("validates owners, checklists and non-finite positions", async () => {
    const { founder, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    await expect(createCard(founder.id, circleId, card({ ownerId: outsider.id }))).rejects.toThrow("owner");
    const c = await createCard(founder.id, circleId, card());
    await addChecklistItem(founder.id, circleId, c.id, "Draft outline");
    const item = await db.checklistItem.findFirstOrThrow({ where: { cardId: c.id } });
    await setChecklistItemDone(founder.id, circleId, item.id, true);
    expect((await db.checklistItem.findUniqueOrThrow({ where: { id: item.id } })).done).toBe(true);
    await expect(addChecklistItem(founder.id, circleId, c.id, "   ")).rejects.toThrow(UserError);
    const col = (await getBoard(founder.id, circleId)).columns[0];
    await expect(moveCard(founder.id, circleId, c.id, col?.id ?? "", Number.NaN)).rejects.toThrow("Invalid");
    await updateCard(founder.id, circleId, c.id, card({ title: "Renamed card" }));
    await deleteCard(founder.id, circleId, c.id);
    expect(await db.checklistItem.count({ where: { cardId: c.id } })).toBe(0);
  });

  it("columns can be added and renamed by members; only Founders delete, and cards are kept", async () => {
    const { founder, member, circleId } = await setup();
    await addColumn(member.id, circleId, "Blocked");
    const board = await getBoard(member.id, circleId);
    const blocked = board.columns.find((c) => c.name === "Blocked");
    const inProgress = board.columns[1];
    if (!blocked || !inProgress) throw new Error("columns missing");
    await renameColumn(member.id, circleId, blocked.id, "On hold");
    await createCard(founder.id, circleId, card({ columnId: inProgress.id }));
    await expect(deleteColumn(member.id, circleId, inProgress.id)).rejects.toThrow("Founder");
    await deleteColumn(founder.id, circleId, inProgress.id);
    const after = await getBoard(founder.id, circleId);
    expect(after.columns.map((c) => c.name)).toEqual(["Backlog", "Review", "Done", "On hold"]);
    expect(after.columns[0]?.cards).toHaveLength(1);
  });
});

describe("opportunities", () => {
  const post = (over: Record<string, string> = {}) =>
    opportunitySchema.parse({ type: "INTRO", title: "Anyone know a retail CFO?", description: "Looking for an introduction to a CFO at a mid-size retailer.", tags: "Finance, retail", ...over });

  it("creates, notifies the circle, filters and respects authorship", async () => {
    const { founder, member, circleId } = await setup();
    const p = await createOpportunity(member.id, circleId, post());
    await createOpportunity(member.id, circleId, post({ type: "JOB_LEAD", title: "Staff engineer, fintech", description: "Remote staff engineer role at a payments company.", tags: "engineering" }));
    expect(await db.notification.count({ where: { userId: founder.id, type: "OPPORTUNITY" } })).toBe(2);
    expect(await db.notification.count({ where: { userId: member.id, type: "OPPORTUNITY" } })).toBe(0);
    expect((await listOpportunities(founder.id, circleId, { type: "INTRO" })).map((o) => o.title)).toEqual(["Anyone know a retail CFO?"]);
    expect(await listOpportunities(founder.id, circleId, { tag: "engineering" })).toHaveLength(1);
    expect(await listOpportunities(founder.id, circleId, { q: "cfo" })).toHaveLength(1);
    await setOpportunityStatus(member.id, circleId, p.id, "FILLED");
    expect(await listOpportunities(founder.id, circleId, { status: "OPEN" })).toHaveLength(1);
    const third = await makeUser("Third");
    await expect(setOpportunityStatus(third.id, circleId, p.id, "CLOSED")).rejects.toThrow(ForbiddenError);
    await deleteOpportunity(founder.id, circleId, p.id); // Founder may
  });

  it("members can respond with comments; the author is notified", async () => {
    const { founder, member, circleId } = await setup();
    const p = await createOpportunity(member.id, circleId, post());
    await addComment(founder.id, circleId, { type: "OPPORTUNITY", id: p.id }, "I can introduce you.");
    expect(await db.notification.count({ where: { userId: member.id, type: "COMMENT" } })).toBe(1);
  });
});

describe("polls", () => {
  const input = (over: Record<string, string> = {}) => pollSchema.parse({ question: "Where should we meet in November?", options: "Lisbon\nBerlin\nOnline", ...over });

  it("validates options", () => {
    expect(pollSchema.safeParse({ question: "Too few options?", options: "Only one" }).success).toBe(false);
    expect(pollSchema.safeParse({ question: "Too many options?", options: Array.from({ length: 9 }, (_, i) => `o${i}`).join("\n") }).success).toBe(false);
  });

  it("one vote per member, and results are hidden until the viewer votes", async () => {
    const { founder, member, circleId } = await setup();
    const poll = await createPoll(founder.id, circleId, input());
    expect(await db.notification.count({ where: { userId: member.id, type: "POLL" } })).toBe(1);
    const before = (await listPolls(member.id, circleId))[0];
    expect(before?.options.every((o) => o.votes === null)).toBe(true);
    const optionId = before?.options[0]?.id ?? "";
    await vote(member.id, circleId, poll.id, optionId);
    await expect(vote(member.id, circleId, poll.id, before?.options[1]?.id ?? "")).rejects.toThrow("already voted");
    const after = (await listPolls(member.id, circleId))[0];
    expect(after?.totalVotes).toBe(1);
    expect(after?.options.find((o) => o.mine)?.votes).toBe(1);
    // the Founder has not voted yet and still sees nothing
    expect((await listPolls(founder.id, circleId))[0]?.options.every((o) => o.votes === null)).toBe(true);
  });

  it("refuses votes after the deadline, for foreign options and from outsiders; closed polls reveal results", async () => {
    const { founder, member, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    const poll = await createPoll(founder.id, circleId, input());
    const [first] = (await listPolls(founder.id, circleId))[0]?.options ?? [];
    await expect(vote(outsider.id, circleId, poll.id, first?.id ?? "")).rejects.toThrow(ForbiddenError);
    await expect(vote(member.id, circleId, poll.id, "not-an-option")).rejects.toThrow("not part");
    await vote(founder.id, circleId, poll.id, first?.id ?? "");
    await db.poll.update({ where: { id: poll.id }, data: { closesAt: new Date(Date.now() - 1000) } });
    await expect(vote(member.id, circleId, poll.id, first?.id ?? "")).rejects.toThrow("closed");
    const view = (await listPolls(member.id, circleId))[0];
    expect(view?.closed).toBe(true);
    expect(view?.options.find((o) => o.id === first?.id)?.votes).toBe(1);
    expect(isClosed({ closesAt: null })).toBe(false);
  });
});
