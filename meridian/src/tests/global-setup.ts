import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

/** Builds a fresh SQLite database from the Prisma schema before the suite runs. */
export default function setup(): void {
  const env = { ...process.env, DATABASE_URL: "file:./test.db" };
  const dir = path.resolve(__dirname, "../../prisma");
  for (const f of ["test.db", "test.db-journal"]) rmSync(path.join(dir, f), { force: true });
  execSync("npx prisma db push --skip-generate", { env, stdio: "ignore" });
}
