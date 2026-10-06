/*
  Warnings:

  - Added the required column `circleId` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "commentId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reaction" ("commentId", "createdAt", "id", "key", "scope", "targetId", "targetType", "userId") SELECT "commentId", "createdAt", "id", "key", "scope", "targetId", "targetType", "userId" FROM "Reaction";
DROP TABLE "Reaction";
ALTER TABLE "new_Reaction" RENAME TO "Reaction";
CREATE INDEX "Reaction_scope_idx" ON "Reaction"("scope");
CREATE INDEX "Reaction_circleId_idx" ON "Reaction"("circleId");
CREATE UNIQUE INDEX "Reaction_userId_scope_key_key" ON "Reaction"("userId", "scope", "key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
