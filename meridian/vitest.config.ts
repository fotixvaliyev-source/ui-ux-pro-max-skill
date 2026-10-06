import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./src/tests/global-setup.ts"],
    env: { DATABASE_URL: "file:./test.db" },
    // One shared SQLite file, so run test files one at a time.
    fileParallelism: false,
  },
});
