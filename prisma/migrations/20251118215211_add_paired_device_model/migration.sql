-- CreateTable
CREATE TABLE "PairedDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "pairingCode" TEXT NOT NULL,
    "fcmToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PairedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PairedDevice_deviceId_key" ON "PairedDevice"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "PairedDevice_pairingCode_key" ON "PairedDevice"("pairingCode");

-- CreateIndex
CREATE INDEX "PairedDevice_userId_idx" ON "PairedDevice"("userId");

-- CreateIndex
CREATE INDEX "PairedDevice_pairingCode_idx" ON "PairedDevice"("pairingCode");
