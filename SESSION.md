# Session Handoff — BYU-I Pre-Health Advising App

**Last worked:** 2026-06-12  
**Git branch:** `main`  
**All 51 unit tests passing** — run `cd webapp && npm test` to verify.  
**Dev server:** `cd webapp && npm run dev` → http://localhost:3000

---

## What Has Been Built

The app is a working Next.js 16 webapp with:

- **Login page** (`/login`) — email/password auth with three demo accounts
- **Advisor dashboard** (`/advisor`) — lists all student profiles in a table
- **Student dashboard** (`/student`) — student sees their own profile + advisor notes
- **Admin dashboard** (`/admin`) — lists all users with role badges
- **Role-based access control** — STUDENT cannot visit `/advisor` or `/admin`
- **Sign out** — returns to `/login`
- **Holistic scoring engine** (`lib/scoring.ts`) — ported from prototype, fully tested
- **Unit tests** — 51 tests in `__tests__/` covering scoring, auth, routing, components

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@byui.edu | changeme123 |
| Advisor | advisor@byui.edu | changeme123 |
| Student | student@byui.edu | changeme123 |

---

## What Is NOT Built Yet (Next Steps)

Work through these in order — each builds on the last.

---

### Step 1 — Student Profile Edit Form (HIGH PRIORITY)

**What:** A form where students can enter/update their own GPA, exam scores, and hours.  
**Why:** Right now the database has blank defaults. Nothing meaningful shows on any dashboard.  
**Files to create/edit:**
- `app/student/edit/page.tsx` — form page (server component wrapper)
- `app/student/edit/EditProfileForm.tsx` — "use client" form component
- `app/api/student/profile/route.ts` — PUT endpoint that saves to `StudentProfile`

**Fields to include** (all exist in `prisma/schema.prisma`):
- Track (Pre-Med, Pre-Dental, Pre-PT, Pre-DO, Pre-PA)
- Overall GPA, Science GPA
- Exam type (MCAT / DAT / GRE) + score
- Shadowing hours, Clinical hours, Service hours, Leadership hours
- Personal statement text area

---

### Step 2 — Holistic Score Display on Advisor Dashboard

**What:** Show each student's calculated holistic score and rating badge next to their name.  
**Why:** This is the core advisor workflow — at a glance see who is Outstanding, Developing, etc.  
**Files to edit:**
- `app/advisor/page.tsx` — import `runHolisticScoringEngine` from `lib/scoring.ts`, call it for each student, pass score/rating into the table row

**Scoring ratings** (already implemented in `lib/scoring.ts`):
- ≥85 → Outstanding Applicant
- ≥65 → Highly Qualified
- ≥40 → Developing Candidate
- <40 → Uninitiated / Weak Plan

---

### Step 3 — Advisor: Click Into Individual Student Record

**What:** Clicking a student row opens a detail page with full stats, score breakdown, and advisor notes.  
**Why:** Advisors need to dig into individual records, not just the summary table.  
**Files to create:**
- `app/advisor/student/[id]/page.tsx` — full student detail view
- `app/api/advisor/notes/route.ts` — POST endpoint to add a new advisor note

**Include on this page:**
- All profile fields
- Holistic score with per-category breakdown (GPA, shadowing, clinical, service, leadership)
- List of existing advisor notes (from `AdvisorNote` table)
- Text box to add a new advisor note
- FERPA: write to `AuditLog` every time an advisor views a student record

---

### Step 4 — School Mission Statement Database

**What:** Seed the `School` table with real MD/DO/DDS/PT/PA school data from the prototype.  
**Why:** The `School` model exists in the database but is empty. School matching can't work until it has data.  
**Files to edit:**
- `prisma/seed.ts` — add school records after the users (data is in `byu_i_pre_health_advisor_app.html`, look for the `schoolArchetypes` array)

**School model fields** (from `prisma/schema.prisma`):
- `name`, `field` (MD/DO/DDS/PT/PA), `type` (allopathic/osteopathic), `region`, `state`
- `avgGpa`, `description`, `missionStatement`, `byuiAdvice`

---

### Step 5 — School Finder / Mission Match

**What:** A page where students (or advisors) can filter schools by field, region, and see how the student's profile fits the school's mission statement.  
**Why:** This is the school matching feature from the original prototype.  
**Files to create:**
- `app/student/schools/page.tsx` — filterable school list with match indicators

---

### Step 6 — Personal Statement Workbench

**What:** A page where students paste their personal statement opening paragraph and get instant feedback.  
**Why:** This is already built in `lib/scoring.ts` as `analyzeEssayHook()` — just needs a UI.  
**Files to create:**
- `app/student/statement/page.tsx` — textarea + live feedback panel
- Call `analyzeEssayHook(text)` client-side and display cliché risk, show-vs-tell score, service language score

---

### Step 7 — Production Readiness (Do Last, Before Handing to IT)

These are not needed for the prototype but are required before BYU-I IT takes over:

1. **Swap SQLite for Azure SQL:**
   - Replace `@prisma/adapter-libsql` with `@prisma/adapter-mssql`
   - Change `datasource.provider` in `prisma/schema.prisma` to `sqlserver`
   - Update `DATABASE_URL` in Azure App Service environment variables

2. **Replace credentials auth with Microsoft Entra ID SSO:**
   - Remove credentials provider from `lib/auth.ts`
   - Add `AzureADProvider` from `next-auth/providers/azure-ad`
   - Set `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID` in env

3. **HTTPS enforcement** — handled by Azure App Service settings, not code

4. **Audit log review page** — `app/admin/audit/page.tsx` to let admins see the FERPA audit trail

---

## Key Technical Notes (for the next Claude session)

- **Prisma 7** — import from `@/app/generated/prisma/client`, NOT `@prisma/client`
- **Next.js 16** — route protection is in `proxy.ts`, NOT `middleware.ts`
- **Driver adapter** — `PrismaLibSql({ url: process.env.DATABASE_URL! })` — required, no direct connection string
- **Seed command** — `npx tsx prisma/seed.ts` (not ts-node)
- **Database file** — `webapp/dev.db` (root of webapp, not inside prisma/)
- **Tests** — `npm test` runs all 51; individual suite: `npm test -- scoring`
- **BYU-I brand color** — `#3063A5`
