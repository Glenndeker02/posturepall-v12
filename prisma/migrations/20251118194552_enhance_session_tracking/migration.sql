-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostureSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workstationId" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "overallScore" INTEGER,
    "goodPosturePercent" REAL,
    "deviationBreakdown" TEXT,
    "alertsReceived" INTEGER,
    "correctionSpeed" REAL,
    "pointsEarned" INTEGER,
    "bonusPoints" INTEGER,
    "timeExcellent" INTEGER,
    "timeGood" INTEGER,
    "timeFair" INTEGER,
    "timePoor" INTEGER,
    "postureAlerts" INTEGER,
    "breakReminders" INTEGER,
    "problemAreas" TEXT,
    "mostCommonIssue" TEXT,
    "postureTimeline" TEXT,
    "longestGoodStreak" INTEGER,
    "isPersonalRecord" BOOLEAN NOT NULL DEFAULT false,
    "recordType" TEXT,
    "avgScreenDistance" REAL,
    "lightingQuality" TEXT,
    "aiInsights" TEXT,
    "recommendations" TEXT,
    "mobileSynced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PostureSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostureSession_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PostureSession" ("alertsReceived", "correctionSpeed", "createdAt", "deviationBreakdown", "duration", "endTime", "goodPosturePercent", "id", "mobileSynced", "overallScore", "pointsEarned", "startTime", "updatedAt", "userId", "workstationId") SELECT "alertsReceived", "correctionSpeed", "createdAt", "deviationBreakdown", "duration", "endTime", "goodPosturePercent", "id", "mobileSynced", "overallScore", "pointsEarned", "startTime", "updatedAt", "userId", "workstationId" FROM "PostureSession";
DROP TABLE "PostureSession";
ALTER TABLE "new_PostureSession" RENAME TO "PostureSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
