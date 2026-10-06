"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { refreshSoon } from "@/lib/refresh";
import { useEffect, useState, useTransition } from "react";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragOverEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Tag } from "@/components/ui/tag";
import { addColumnAction, createCardAction, deleteColumnAction, moveCardAction, renameColumnAction } from "@/server/actions/projects";
import { cn } from "@/lib/utils";
import { LocalTime } from "./local-time";

export interface BoardCard {
  id: string;
  title: string;
  position: number;
  label: string | null;
  ownerName: string | null;
  dueIso: string | null;
  checkDone: number;
  checkTotal: number;
}
export interface BoardColumnView {
  id: string;
  name: string;
  cards: BoardCard[];
}

function CardFace({ card, circleId, dragging = false }: { card: BoardCard; circleId: string; dragging?: boolean }) {
  return (
    <div className={cn("rounded-xl border-2 border-ink bg-surface p-3 shadow-[2px_2px_0_var(--projects)] transition-shadow", dragging && "rotate-2 shadow-[4px_6px_0_var(--projects)]")}>
      <Link href={`/app/c/${circleId}/projects/${card.id}`} className="block font-display text-sm font-bold leading-snug hover:underline">
        {card.title}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        {card.label ? <Tag tone="projects">{card.label}</Tag> : null}
        {card.checkTotal ? <Tag>{card.checkDone}/{card.checkTotal}</Tag> : null}
        {card.dueIso ? <Tag tone="meetings"><LocalTime iso={card.dueIso} format="date" /></Tag> : null}
        {card.ownerName ? <Avatar name={card.ownerName} size="sm" className="ml-auto" /> : null}
      </div>
    </div>
  );
}

function SortableCard({ card, circleId }: { card: BoardCard; circleId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, data: { type: "card" } });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("touch-manipulation", isDragging && "opacity-40")} {...attributes} {...listeners}>
      <CardFace card={card} circleId={circleId} />
    </li>
  );
}

function Column({ column, circleId, isFounder, onError }: { column: BoardColumnView; circleId: string; isFounder: boolean; onError: (m: string) => void }) {
  const router = useRouter();
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } });
  const [name, setName] = useState(column.name);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();
  useEffect(() => setName(column.name), [column.name]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) onError(r.error ?? "Something went wrong.");
      else {
        onError("");
        refreshSoon(router);
      }
    });

  return (
    <section aria-label={column.name} className={cn("flex w-72 shrink-0 flex-col gap-3 rounded-card bg-projects-tint p-3 transition-colors", isOver && "ring-2 ring-projects")}>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`col-${column.id}`}>Column name</label>
        <input
          id={`col-${column.id}`}
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== column.name && run(() => renameColumnAction(circleId, column.id, name))}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="min-w-0 flex-1 rounded-lg bg-transparent px-1.5 py-1 font-display text-sm font-extrabold uppercase tracking-wide text-projects-text hover:bg-surface/60 focus:bg-surface"
        />
        <span className="text-xs font-bold text-projects-text">{column.cards.length}</span>
        {isFounder ? (
          <button type="button" aria-label={`Remove column ${column.name}`} disabled={pending} className="text-xs font-bold text-projects-text hover:text-danger"
            onClick={() => window.confirm(`Remove "${column.name}"? Its cards move to a neighbouring column.`) && run(() => deleteColumnAction(circleId, column.id))}>
            Remove
          </button>
        ) : null}
      </div>
      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-[3rem] flex-col gap-2">
          {column.cards.map((c) => (
            <SortableCard key={c.id} card={c} circleId={circleId} />
          ))}
        </ul>
      </SortableContext>
      {adding ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set("title", title);
            fd.set("columnId", column.id);
            run(async () => {
              const r = await createCardAction(circleId, { ok: false }, fd);
              if (r.ok) {
                setTitle("");
                setAdding(false);
              }
              return { ok: r.ok, error: r.fieldErrors?.title?.[0] ?? r.error };
            });
          }}
        >
          <label className="sr-only" htmlFor={`new-${column.id}`}>New card title</label>
          <Input id={`new-${column.id}`} autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" maxLength={140} className="h-10 bg-surface" />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>Add card</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="rounded-xl border-2 border-dashed border-projects-text/40 px-3 py-2 text-left text-sm font-bold text-projects-text hover:border-projects-text">
          + Add a card
        </button>
      )}
    </section>
  );
}

/** New position for the card at `index`, halfway between its neighbours. One number, one write. */
export function positionBetween(list: { position: number }[], index: number): number {
  const prev = list[index - 1]?.position;
  const next = list[index + 1]?.position;
  if (prev !== undefined && next !== undefined) return (prev + next) / 2;
  if (prev !== undefined) return prev + 1024;
  if (next !== undefined) return next / 2;
  return 1024;
}

export function KanbanBoard({ circleId, columns: initial, isFounder }: { circleId: string; columns: BoardColumnView[]; isFounder: boolean }) {
  const router = useRouter();
  const [columns, setColumns] = useState(initial);
  const [active, setActive] = useState<BoardCard | null>(null);
  const [error, setError] = useState("");
  const [newColumn, setNewColumn] = useState("");
  const [, start] = useTransition();
  useEffect(() => setColumns(initial), [initial]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findColumn = (id: string) => columns.find((c) => c.id === id) ?? columns.find((c) => c.cards.some((card) => card.id === id));

  function onDragStart(e: DragStartEvent) {
    setActive(columns.flatMap((c) => c.cards).find((c) => c.id === e.active.id) ?? null);
  }

  function onDragOver(e: DragOverEvent) {
    const { active: a, over } = e;
    if (!over) return;
    const from = findColumn(String(a.id));
    const to = findColumn(String(over.id));
    if (!from || !to || from.id === to.id) return;
    setColumns((cols) => {
      const card = from.cards.find((c) => c.id === a.id);
      if (!card) return cols;
      const overIndex = to.cards.findIndex((c) => c.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : to.cards.length;
      return cols.map((c) => {
        if (c.id === from.id) return { ...c, cards: c.cards.filter((x) => x.id !== a.id) };
        if (c.id === to.id) return { ...c, cards: [...c.cards.slice(0, insertAt), card, ...c.cards.slice(insertAt)] };
        return c;
      });
    });
  }

  function onDragEnd(e: DragEndEvent) {
    setActive(null);
    const { active: a, over } = e;
    if (!over) return;
    const col = findColumn(String(a.id));
    if (!col) return;
    const oldIndex = col.cards.findIndex((c) => c.id === a.id);
    const overIndex = col.cards.findIndex((c) => c.id === over.id);
    const ordered = overIndex >= 0 && overIndex !== oldIndex ? arrayMove(col.cards, oldIndex, overIndex) : col.cards;
    const newIndex = ordered.findIndex((c) => c.id === a.id);
    const position = positionBetween(ordered, newIndex);
    setColumns((cols) => cols.map((c) => (c.id === col.id ? { ...c, cards: ordered.map((x) => (x.id === a.id ? { ...x, position } : x)) } : c)));
    start(async () => {
      const r = await moveCardAction(circleId, String(a.id), col.id, position);
      if (!r.ok) {
        setError(r.error ?? "Could not move the card.");
        setColumns(initial);
      } else {
        setError("");
        refreshSoon(router);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <p role="alert" className="rounded-xl bg-danger-tint px-4 py-2.5 text-sm font-semibold text-danger">{error}</p> : null}
      <p className="text-sm text-ink-soft">Drag cards between columns, or focus a card and use the space bar and arrow keys.</p>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => { setActive(null); setColumns(initial); }}>
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4">
          {columns.map((c) => (
            <Column key={c.id} column={c} circleId={circleId} isFounder={isFounder} onError={setError} />
          ))}
          <form
            className="flex w-60 shrink-0 flex-col gap-2 self-start rounded-card border-2 border-dashed border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await addColumnAction(circleId, newColumn);
                if (r.ok) {
                  setNewColumn("");
                  setError("");
                  refreshSoon(router);
                } else setError(r.error ?? "Could not add the column.");
              });
            }}
          >
            <label htmlFor="new-column" className="text-sm font-bold">Add a column</label>
            <Input id="new-column" value={newColumn} onChange={(e) => setNewColumn(e.target.value)} maxLength={40} placeholder="For example: Blocked" className="h-10" />
            <Button type="submit" size="sm" variant="secondary" disabled={!newColumn.trim()}>Add column</Button>
          </form>
        </div>
        <DragOverlay>{active ? <CardFace card={active} circleId={circleId} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
