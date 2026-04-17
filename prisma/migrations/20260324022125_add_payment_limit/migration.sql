/*
  Warnings:

  - Added the required column `paymentLimit` to the `CreditCard` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creditLimit" REAL NOT NULL,
    "paymentLimit" REAL NOT NULL,
    "currentBalance" REAL NOT NULL DEFAULT 0,
    "lastDigits" TEXT,
    "issuer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CreditCard" ("createdAt", "creditLimit", "paymentLimit", "currentBalance", "id", "issuer", "lastDigits", "name", "updatedAt", "userId") SELECT "createdAt", "creditLimit", "creditLimit", "currentBalance", "id", "issuer", "lastDigits", "name", "updatedAt", "userId" FROM "CreditCard";
DROP TABLE "CreditCard";
ALTER TABLE "new_CreditCard" RENAME TO "CreditCard";
CREATE INDEX "CreditCard_userId_idx" ON "CreditCard"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
