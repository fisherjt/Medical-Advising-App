# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Open `byu_i_pre_health_advisor_app.html` directly in a browser — no build step, server, or package manager required. All dependencies (Tailwind CSS, Lucide icons) are loaded from CDN.

## Architecture

This is a **single-file HTML application** with no backend. All state lives in JavaScript variables in memory and resets on page reload. There is no persistence layer.

### Global State

Three module-level variables drive the entire app:

- `cohort` — array of student objects; mutated directly by all advisor and student-facing actions
- `comparedSchoolIds` — array of school IDs selected for side-by-side comparison (max 10)
- `currentRole` — `'advisor'` or `'student'`; controls which nav group and tabs are visible

### Tab/Role System

`toggleRole()` switches between Advisor and Student views by toggling nav group visibility and calling `switchTab()`. `switchTab(tabId)` hides all five `<section id="tab-*">` elements then shows the target one. Tab IDs: `dashboard`, `evaluator`, `student-dashboard`, `statement`, `schools`.

### Scoring Engine

`runHolisticScoringEngine(student)` is the central algorithm — called everywhere a holistic score or rating badge is needed (dashboard stats, table rows, student meter, calculator report). It returns `{ score, rating }` where rating is one of: `"Outstanding Applicant"`, `"Highly Qualified"`, `"Developing Candidate"`, `"Uninitiated / Weak Plan"`. Score thresholds: ≥85 → Outstanding, ≥65 → Highly Qualified, ≥40 → Developing.

### Data Structures

**Student object** (in `cohort`):
```
{ id, name, track, gpa, scienceGpa, examScore, examType, shadowing, clinical,
  service, leadership, research, notes, personalStatement, competencies: { empathy, ethics, teamwork, resilience, growth, dexterity } }
```

**School object** (in `schoolArchetypes`, read-only):
```
{ id, name, field, type, region, state, avgGPA, description, missionStatement, byuiAdvice }
```

### Key Functions

- `renderDashboard()` → calls `renderStudentTable()` + `updateDashboardStats()`
- `loadToCalculator(id)` → populates the Holistic Calculator tab from a cohort entry and switches to it
- `saveCalculatedToCohort()` → upserts a cohort record by name match from the calculator form
- `saveStudentSelfReport()` → writes student-view form fields back into the `cohort` array
- `analyzeEssayHook()` — local heuristic analysis of personal statement text (no AI call); detects clichés and sensory language via keyword lists
- `onFilterParamsChange()` / `renderComparisonDesk()` — school finder checklist and comparison desk rendering

### BYU-I Branding

Primary color is `#3063A5` (used as Tailwind arbitrary value throughout). Custom CSS classes `.bg-byui-blue`, `.text-byui-blue`, `.border-byui-blue`, `.hover:bg-byui-blue-dark` are defined in `<style>`. Lucide icons are initialized/re-initialized via `lucide.createIcons()` after any dynamic DOM injection.
