import { db } from "@/server/db";
import { membershipOrThrow } from "@/server/access";
import { DECISION_STATUS_STYLE, type DecisionStatus } from "@/lib/constants";

export const CSV_DATASETS = ["decisions", "actions", "notes"] as const;
export type CsvDataset = (typeof CSV_DATASETS)[number];

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

/** RFC 4180 quoting, plus a guard against spreadsheet formula injection (= + - @ at the start of a cell). */
export function csvCell(value: string | number | boolean | null | undefined): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

async function nameMap(circleId: string): Promise<Map<string, string>> {
  const members = await db.membership.findMany({ where: { circleId }, include: { user: { select: { name: true, email: true } } } });
  return new Map(members.map((m) => [m.userId, m.user.name ?? m.user.email]));
}

export async function exportCsv(actorId: string, circleId: string, dataset: CsvDataset): Promise<{ filename: string; body: string }> {
  const { circle } = await membershipOrThrow(actorId, circleId);
  const names = await nameMap(circleId);
  const who = (id: string | null | undefined) => (id ? (names.get(id) ?? "Former member") : "");
  const slug = circle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "circle";

  if (dataset === "decisions") {
    const rows = await db.decision.findMany({ where: { circleId }, orderBy: { decidedOn: "asc" }, include: { involved: true, meeting: { select: { title: true } } } });
    return {
      filename: `${slug}-decisions.csv`,
      body: toCsv(
        ["Date", "Decision", "Status", "Context and reasoning", "Involved", "Meeting"],
        rows.map((d) => [day(d.decidedOn), d.title, DECISION_STATUS_STYLE[d.status as DecisionStatus]?.label ?? d.status, d.context, d.involved.map((p) => who(p.userId)).join("; "), d.meeting?.title ?? ""]),
      ),
    };
  }
  if (dataset === "actions") {
    const rows = await db.actionItem.findMany({ where: { circleId }, orderBy: [{ done: "asc" }, { dueDate: "asc" }], include: { meeting: { select: { title: true } } } });
    return {
      filename: `${slug}-action-items.csv`,
      body: toCsv(["Action item", "Owner", "Due", "Done", "Completed on", "Meeting"], rows.map((a) => [a.title, who(a.ownerId), day(a.dueDate), a.done ? "yes" : "no", day(a.doneAt), a.meeting?.title ?? ""])),
    };
  }
  const meetings = await db.meeting.findMany({ where: { circleId }, orderBy: { startsAt: "asc" } });
  return {
    filename: `${slug}-meeting-notes.csv`,
    body: toCsv(["Date", "Meeting", "Location", "Notes (markdown)"], meetings.map((m) => [day(m.startsAt), m.title, m.location ?? "", m.notesMd])),
  };
}

/** One Markdown document: decisions, meeting notes and action items. */
export async function exportMarkdown(actorId: string, circleId: string): Promise<{ filename: string; body: string }> {
  const { circle } = await membershipOrThrow(actorId, circleId);
  const names = await nameMap(circleId);
  const who = (id: string | null | undefined) => (id ? (names.get(id) ?? "Former member") : "Unassigned");
  const slug = circle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "circle";
  const [decisions, meetings, actions] = await Promise.all([
    db.decision.findMany({ where: { circleId }, orderBy: { decidedOn: "asc" }, include: { involved: true } }),
    db.meeting.findMany({ where: { circleId }, orderBy: { startsAt: "asc" }, include: { agenda: { orderBy: { position: "asc" } } } }),
    db.actionItem.findMany({ where: { circleId }, orderBy: [{ done: "asc" }, { dueDate: "asc" }] }),
  ]);
  const out: string[] = [`# ${circle.name}`, "", `_${circle.purpose}_`, "", `Exported ${day(new Date())}`, ""];

  out.push("## Decisions", "");
  if (decisions.length === 0) out.push("No decisions logged.", "");
  for (const d of decisions) {
    out.push(`### ${d.title}`, "", `- Date: ${day(d.decidedOn)}`, `- Status: ${DECISION_STATUS_STYLE[d.status as DecisionStatus]?.label ?? d.status}`);
    if (d.involved.length) out.push(`- Involved: ${d.involved.map((p) => who(p.userId)).join(", ")}`);
    out.push("", d.context, "");
  }

  out.push("## Meeting notes", "");
  if (meetings.length === 0) out.push("No meetings.", "");
  for (const m of meetings) {
    out.push(`### ${m.title} (${day(m.startsAt)})`, "");
    if (m.location) out.push(`Location: ${m.location}`, "");
    if (m.agenda.length) out.push("Agenda:", ...m.agenda.map((a, i) => `${i + 1}. ${a.text}`), "");
    out.push(m.notesMd.trim() ? m.notesMd.trim() : "_No notes._", "");
  }

  out.push("## Action items", "");
  if (actions.length === 0) out.push("No action items.", "");
  for (const a of actions) out.push(`- [${a.done ? "x" : " "}] ${a.title} (${who(a.ownerId)}${a.dueDate ? `, due ${day(a.dueDate)}` : ""})`);
  out.push("");
  return { filename: `${slug}-export.md`, body: out.join("\n") };
}
