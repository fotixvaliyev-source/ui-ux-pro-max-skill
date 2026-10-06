import { randomUUID } from "node:crypto";
import { db } from "@/server/db";

export async function makeUser(name = "Test User") {
  const id = randomUUID();
  return db.user.create({ data: { id, email: `${id}@example.test`, name, onboardedAt: new Date() } });
}
