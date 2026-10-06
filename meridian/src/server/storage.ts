import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File storage behind a small interface. The local adapter writes to ./uploads, which is fine for
 * local development and any host with a persistent disk. Serverless hosts (Vercel) have no
 * persistent disk: swap this for an S3 / Vercel Blob adapter that implements the same interface.
 */
export interface StorageAdapter {
  save(circleId: string, filename: string, data: Buffer): Promise<string>;
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

const ROOT = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/\.{2,}/g, ".").slice(-80) || "file";
}

/** Keys are "<circleId>/<uuid>-<name>". Resolving them can never leave ROOT. */
function resolveKey(key: string): string {
  const full = path.resolve(ROOT, key);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export const localStorageAdapter: StorageAdapter = {
  async save(circleId, filename, data) {
    const key = `${circleId}/${randomUUID()}-${safeName(filename)}`;
    const full = resolveKey(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
    return key;
  },
  async read(key) {
    return readFile(resolveKey(key));
  },
  async remove(key) {
    await rm(resolveKey(key), { force: true });
  },
};

export const storage: StorageAdapter = localStorageAdapter;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain", "text/markdown", "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
