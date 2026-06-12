-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "track" TEXT NOT NULL DEFAULT 'Pre-Med',
    "gpa" REAL NOT NULL DEFAULT 0,
    "scienceGpa" REAL NOT NULL DEFAULT 0,
    "examType" TEXT NOT NULL DEFAULT 'MCAT',
    "examScore" INTEGER NOT NULL DEFAULT 0,
    "shadowingHours" INTEGER NOT NULL DEFAULT 0,
    "clinicalHours" INTEGER NOT NULL DEFAULT 0,
    "serviceHours" INTEGER NOT NULL DEFAULT 0,
    "leadershipHours" INTEGER NOT NULL DEFAULT 0,
    "researchHours" INTEGER NOT NULL DEFAULT 0,
    "personalStatement" TEXT NOT NULL DEFAULT '',
    "compEthics" BOOLEAN NOT NULL DEFAULT false,
    "compEmpathy" BOOLEAN NOT NULL DEFAULT false,
    "compTeamwork" BOOLEAN NOT NULL DEFAULT false,
    "compResilience" BOOLEAN NOT NULL DEFAULT false,
    "compGrowth" BOOLEAN NOT NULL DEFAULT false,
    "compDexterity" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvisorNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvisorNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdvisorNote_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "avgGpa" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "missionStatement" TEXT NOT NULL,
    "byuiAdvice" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL DEFAULT '',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
