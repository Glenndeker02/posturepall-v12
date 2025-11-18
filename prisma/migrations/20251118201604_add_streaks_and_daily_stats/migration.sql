-- CreateTable
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "postureScore" INTEGER,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "breaksScheduled" INTEGER NOT NULL DEFAULT 0,
    "breaksCompleted" INTEGER NOT NULL DEFAULT 0,
    "breaksSnoozed" INTEGER NOT NULL DEFAULT 0,
    "breaksSkipped" INTEGER NOT NULL DEFAULT 0,
    "timeExcellent" INTEGER NOT NULL DEFAULT 0,
    "timeGood" INTEGER NOT NULL DEFAULT 0,
    "timeFair" INTEGER NOT NULL DEFAULT 0,
    "timePoor" INTEGER NOT NULL DEFAULT 0,
    "dailyGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "breakGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "problemAreas" TEXT,
    "bestSessionScore" INTEGER,
    "bestSessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
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
INSERT INTO "new_User" ("avatar", "calibrationData", "createdAt", "dailySittingHours", "email", "id", "mobileDeviceId", "name", "painAreas", "qrPairingCode", "subscriptionTier", "updatedAt", "userGoals", "workEnvironment", "workSchedule") SELECT "avatar", "calibrationData", "createdAt", "dailySittingHours", "email", "id", "mobileDeviceId", "name", "painAreas", "qrPairingCode", "subscriptionTier", "updatedAt", "userGoals", "workEnvironment", "workSchedule" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_qrPairingCode_key" ON "User"("qrPairingCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DailyStats_userId_date_idx" ON "DailyStats"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_userId_date_key" ON "DailyStats"("userId", "date");
