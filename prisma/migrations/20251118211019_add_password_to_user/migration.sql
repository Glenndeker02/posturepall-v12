/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "workEnvironment" TEXT,
    "dailySittingHours" INTEGER,
    "painAreas" TEXT,
    "workSchedule" TEXT,
    "userGoals" TEXT,
    "calibrationData" TEXT,
    "qrPairingCode" TEXT,
    "mobileDeviceId" TEXT,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" DATETIME,
    "streakFreezes" INTEGER NOT NULL DEFAULT 1,
    "currentBreakStreak" INTEGER NOT NULL DEFAULT 0,
    "longestBreakStreak" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalBreaks" INTEGER NOT NULL DEFAULT 0,
    "dailyGoalScore" INTEGER NOT NULL DEFAULT 80,
    "weeklyGoalScore" INTEGER NOT NULL DEFAULT 80,
    "breakRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "streakRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "breakRemindersEnabled", "calibrationData", "createdAt", "currentBreakStreak", "currentStreak", "dailyGoalScore", "dailySittingHours", "email", "id", "lastActivityDate", "longestBreakStreak", "longestStreak", "mobileDeviceId", "name", "painAreas", "qrPairingCode", "streakFreezes", "streakRemindersEnabled", "subscriptionTier", "totalBreaks", "totalPoints", "totalSessions", "updatedAt", "userGoals", "weeklyGoalScore", "workEnvironment", "workSchedule") SELECT "avatar", "breakRemindersEnabled", "calibrationData", "createdAt", "currentBreakStreak", "currentStreak", "dailyGoalScore", "dailySittingHours", "email", "id", "lastActivityDate", "longestBreakStreak", "longestStreak", "mobileDeviceId", "name", "painAreas", "qrPairingCode", "streakFreezes", "streakRemindersEnabled", "subscriptionTier", "totalBreaks", "totalPoints", "totalSessions", "updatedAt", "userGoals", "weeklyGoalScore", "workEnvironment", "workSchedule" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_qrPairingCode_key" ON "User"("qrPairingCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
