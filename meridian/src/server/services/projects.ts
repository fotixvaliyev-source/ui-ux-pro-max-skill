import type { z } from "zod";
import { db } from "@/server/db";
import { ForbiddenError, UserError, membershipOrThrow } from "@/server/access";
import { DEFAULT_COLUMNS } from "@/lib/constants";
import type { cardSchema } from "@/server/validation/projects";
import { columnNameSchema } from "@/server/validation/projects";

type CardInput = z.output<typeof cardSchema>;

/** The circle's board, created on demand for circles that predate it. */
export async function getBoard(actorId: string, circleId: string) {
  await membershipOrThrow(actorId, circleId);
  let board = await db.board.findUnique({ where: { circleId } });
  if (!board) board = await db.board.create({ data: { circleId, columns: { create: DEFAULT_COLUMNS.map((name, position) => ({ name, position })) } } });
  const columns = await db.boardColumn.findMany({
    where: { boardId: board.id },
    orderBy: { position: "asc" },
    include: { cards: { orderBy: { position: "asc" }, include: { _count: { select: { checklist: true } }, checklist: { select: { done: true } } } } },
  });
  return { id: board.id, columns };
}

async function columnInCircle(circleId: string, columnId: string) {
  const col = await db.boardColumn.findFirst({ where: { id: columnId, board: { circleId } } });
  if (!col) throw new UserError("That column could not be found.");
  return col;
}

async function cardInCircle(circleId: string, cardId: string) {
  const card = await db.projectCard.findFirst({ where: { id: cardId, circleId } });
  if (!card) throw new UserError("That card could not be found.");
  return card;
}

async function checkOwner(circleId: string, ownerId: string | undefined) {
  if (!ownerId) return;
  const m = await db.membership.findUnique({ where: { circleId_userId: { circleId, userId: ownerId } }, select: { id: true } });
  if (!m) throw new UserError("Pick an owner from this circle.");
}

export async function createCard(actorId: string, circleId: string, input: CardInput): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  const board = await getBoard(actorId, circleId);
  const columnId = input.columnId ?? board.columns[0]?.id;
  if (!columnId) throw new UserError("This board has no columns.");
  await columnInCircle(circleId, columnId);
  await checkOwner(circleId, input.ownerId);
  const last = await db.projectCard.findFirst({ where: { columnId }, orderBy: { position: "desc" }, select: { position: true } });
  return db.projectCard.create({
    data: {
      columnId, circleId, title: input.title, description: input.description ?? null, ownerId: input.ownerId ?? null,
      dueDate: input.dueDate ?? null, label: input.label ?? null, position: (last?.position ?? 0) + 1024,
    },
    select: { id: true },
  });
}

export async function updateCard(actorId: string, circleId: string, cardId: string, input: CardInput): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await cardInCircle(circleId, cardId);
  await checkOwner(circleId, input.ownerId);
  await db.projectCard.update({
    where: { id: cardId },
    data: { title: input.title, description: input.description ?? null, ownerId: input.ownerId ?? null, dueDate: input.dueDate ?? null, label: input.label ?? null },
  });
}

/** One write per drag: the client sends the new column and a fractional position between its neighbours. */
export async function moveCard(actorId: string, circleId: string, cardId: string, columnId: string, position: number): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await cardInCircle(circleId, cardId);
  await columnInCircle(circleId, columnId);
  if (!Number.isFinite(position)) throw new UserError("Invalid position.");
  await db.projectCard.update({ where: { id: cardId }, data: { columnId, position } });
  // If repeated halving made neighbours too close, renumber the column.
  const cards = await db.projectCard.findMany({ where: { columnId }, orderBy: { position: "asc" }, select: { id: true, position: true } });
  const tooClose = cards.some((c, i) => i > 0 && c.position - (cards[i - 1]?.position ?? 0) < 1e-6);
  if (tooClose) await db.$transaction(cards.map((c, i) => db.projectCard.update({ where: { id: c.id }, data: { position: (i + 1) * 1024 } })));
}

export async function deleteCard(actorId: string, circleId: string, cardId: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await cardInCircle(circleId, cardId);
  const comments = await db.comment.findMany({ where: { circleId, targetType: "CARD", targetId: cardId }, select: { id: true } });
  await db.$transaction([
    db.reaction.deleteMany({ where: { circleId, OR: [{ scope: `CARD:${cardId}` }, { commentId: { in: comments.map((c) => c.id) } }] } }),
    db.comment.deleteMany({ where: { id: { in: comments.map((c) => c.id) } } }),
    db.projectCard.delete({ where: { id: cardId } }),
  ]);
}

// ── Checklist ────────────────────────────────────────────────────

export async function addChecklistItem(actorId: string, circleId: string, cardId: string, text: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await cardInCircle(circleId, cardId);
  const clean = text.trim();
  if (!clean || clean.length > 200) throw new UserError("Checklist items need 1 to 200 characters.");
  const count = await db.checklistItem.count({ where: { cardId } });
  await db.checklistItem.create({ data: { cardId, text: clean, position: count } });
}

async function itemInCircle(circleId: string, itemId: string) {
  const item = await db.checklistItem.findFirst({ where: { id: itemId, card: { circleId } } });
  if (!item) throw new UserError("That checklist item could not be found.");
  return item;
}

export async function setChecklistItemDone(actorId: string, circleId: string, itemId: string, done: boolean): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await itemInCircle(circleId, itemId);
  await db.checklistItem.update({ where: { id: itemId }, data: { done } });
}

export async function deleteChecklistItem(actorId: string, circleId: string, itemId: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await itemInCircle(circleId, itemId);
  await db.checklistItem.delete({ where: { id: itemId } });
}

// ── Columns ──────────────────────────────────────────────────────

export async function addColumn(actorId: string, circleId: string, name: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  const board = await getBoard(actorId, circleId);
  const clean = columnNameSchema.parse(name);
  await db.boardColumn.create({ data: { boardId: board.id, name: clean, position: board.columns.length } });
}

export async function renameColumn(actorId: string, circleId: string, columnId: string, name: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await columnInCircle(circleId, columnId);
  await db.boardColumn.update({ where: { id: columnId }, data: { name: columnNameSchema.parse(name) } });
}

/** Deleting a column moves its cards to the previous one (or the next if it was first). Founders only: it reshapes the board. */
export async function deleteColumn(actorId: string, circleId: string, columnId: string): Promise<void> {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  if (!isFounder) throw new ForbiddenError("Only a Founder can remove a column.");
  const col = await columnInCircle(circleId, columnId);
  const all = await db.boardColumn.findMany({ where: { boardId: col.boardId }, orderBy: { position: "asc" } });
  if (all.length <= 1) throw new UserError("A board needs at least one column.");
  const idx = all.findIndex((c) => c.id === columnId);
  const target = all[idx - 1] ?? all[idx + 1];
  if (!target) throw new UserError("A board needs at least one column.");
  const last = await db.projectCard.findFirst({ where: { columnId: target.id }, orderBy: { position: "desc" }, select: { position: true } });
  const moving = await db.projectCard.findMany({ where: { columnId }, orderBy: { position: "asc" }, select: { id: true } });
  await db.$transaction([
    ...moving.map((c, i) => db.projectCard.update({ where: { id: c.id }, data: { columnId: target.id, position: (last?.position ?? 0) + 1024 * (i + 1) } })),
    db.boardColumn.delete({ where: { id: columnId } }),
    ...all.filter((c) => c.id !== columnId).map((c, i) => db.boardColumn.update({ where: { id: c.id }, data: { position: i } })),
  ]);
}
