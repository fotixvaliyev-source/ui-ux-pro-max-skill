import type { z } from "zod";
import { db } from "@/server/db";
import { ForbiddenError, UserError, membershipOrThrow } from "@/server/access";
import { parseTags, serializeTags } from "@/lib/tags";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, storage } from "@/server/storage";
import type { resourceSchema } from "@/server/validation/resources";

type Input = z.output<typeof resourceSchema>;

export interface UploadInput {
  name: string;
  type: string;
  data: Buffer;
}

function checkUpload(file: UploadInput): void {
  if (file.data.byteLength === 0) throw new UserError("That file is empty.");
  if (file.data.byteLength > MAX_UPLOAD_BYTES) throw new UserError("Files can be up to 5 MB.");
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) throw new UserError("That file type is not allowed. Use PDF, an image, text, or an Office document.");
}

export async function createResource(actorId: string, circleId: string, input: Input, file?: UploadInput): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  let filePath: string | null = null;
  if (input.kind === "FILE") {
    if (!file) throw new UserError("Choose a file to upload.");
    checkUpload(file);
    filePath = await storage.save(circleId, file.name, file.data);
  }
  const created = await db.resource.create({
    data: {
      circleId, authorId: actorId, kind: input.kind, title: input.title, whyUseful: input.whyUseful,
      url: input.kind === "LINK" ? (input.url ?? null) : null,
      body: input.kind === "NOTE" ? (input.body ?? null) : null,
      filePath: filePath ? `${filePath}|${file?.name ?? "file"}|${file?.type ?? ""}` : null,
      tags: serializeTags(input.tags),
    },
    select: { id: true },
  });
  const user = await db.user.findUnique({ where: { id: actorId }, select: { name: true } });
  await db.activity.create({ data: { circleId, actorId, verb: "resource", summary: `${user?.name ?? "Someone"} shared ${input.title}`, href: `/app/c/${circleId}/library` } });
  return created;
}

async function forChange(actorId: string, circleId: string, id: string) {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const r = await db.resource.findFirst({ where: { id, circleId } });
  if (!r) throw new UserError("That resource could not be found.");
  if (r.authorId !== actorId && !isFounder) throw new ForbiddenError("Only the person who added it or a Founder can change a resource.");
  return r;
}

/** Edits the text fields. The kind and the attached file are fixed once created. */
export async function updateResource(actorId: string, circleId: string, id: string, input: Input): Promise<void> {
  const r = await forChange(actorId, circleId, id);
  if (r.kind !== input.kind) throw new UserError("A resource's type cannot be changed.");
  await db.resource.update({
    where: { id },
    data: { title: input.title, whyUseful: input.whyUseful, tags: serializeTags(input.tags), url: r.kind === "LINK" ? (input.url ?? r.url) : r.url, body: r.kind === "NOTE" ? (input.body ?? r.body) : r.body },
  });
}

export async function deleteResource(actorId: string, circleId: string, id: string): Promise<void> {
  const r = await forChange(actorId, circleId, id);
  await db.resource.delete({ where: { id } });
  if (r.filePath) await storage.remove(parseFileRef(r.filePath).key);
}

export function parseFileRef(ref: string): { key: string; name: string; type: string } {
  const [key = "", name = "file", type = "application/octet-stream"] = ref.split("|");
  return { key, name, type };
}

export interface ResourceFilter {
  q?: string;
  tag?: string;
  kind?: string;
}

export async function listResources(actorId: string, circleId: string, f: ResourceFilter = {}) {
  await membershipOrThrow(actorId, circleId);
  const rows = await db.resource.findMany({ where: { circleId, ...(f.kind ? { kind: f.kind } : {}) }, orderBy: { createdAt: "desc" } });
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((r) => {
    if (f.tag && !parseTags(r.tags).includes(f.tag)) return false;
    const hay = `${r.title} ${r.whyUseful} ${r.body ?? ""}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** For the download route: members only, and the file must belong to this circle. */
export async function getResourceFile(actorId: string, circleId: string, id: string) {
  await membershipOrThrow(actorId, circleId);
  const r = await db.resource.findFirst({ where: { id, circleId, kind: "FILE" } });
  if (!r?.filePath) throw new UserError("That file could not be found.");
  const ref = parseFileRef(r.filePath);
  return { ...ref, data: await storage.read(ref.key) };
}
