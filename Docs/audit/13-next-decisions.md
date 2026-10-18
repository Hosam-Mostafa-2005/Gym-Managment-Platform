# 13 — Product & Architecture Decisions Requiring Approval

**Purpose:** Before any V2 implementation or bug-fixing task begins, the following product and architectural decisions require explicit stakeholder review and approval.

---

## Decision 1: Single-Gym Deployment vs. Multi-Tenant B2B SaaS Architecture
- **Context:** Currently, all 9 MongoDB collections (`User`, `Exercise`, `Workout`, `Assignment`, `WorkoutSession`, `BodyMeasurement`, `Notification`) are flat and unscoped — there is no `gymId` or `organizationId` field anywhere in the database, and `Exercise.name` and `Workout.title` are globally unique across all users.
- **Options:**
  - **Option A (Single-Gym Instance):** STREN is deployed per gym (one gym per database). `Roles.ADMIN` acts as the **Gym Owner** role, managing all Trainers and Members in that database. Fastest path to V2 commercial completion with minimal schema migration.
  - **Option B (Multi-Tenant SaaS Platform):** Multiple independent Gym Owners register their gyms on a shared STREN instance. Requires creating a `Gym` model, adding `gymId` to all domain models, and scoping all queries and unique indexes by `gymId`.
- **Why Approval Is Needed:** Determines whether `GYM_OWNER` is a new tenant-scoped role with a `Gym` entity or an evolution of the existing `ADMIN` role.

---

## Decision 2: Persistent Coach–Member Relationship vs. Assignment-Only Coupling
- **Context:** Currently, a Coach can only see a Member in `/members/all` (`MembersManagementPage`) and access their Profile, Insights, and Body Measurements if an `Assignment` with `status: "ACTIVE"` exists between them (`checkTrainerAccess` in `body-measurement.service.ts:18`, `member-profile.service.ts:15`, `member-insights.service.ts:23`). The moment a workout assignment finishes (`COMPLETED`) or is cancelled (`CANCELLED`), the Coach loses all access (`403 Forbidden`) to that Member!
- **Options:**
  - **Option A (Recommended — Persistent `assignedTrainer` on `User`):** Add `assignedTrainer?: ObjectId` (or `coaches: ObjectId[]`) on the `User` model so a Member remains on a Coach's roster before, during, and between workout assignments.
  - **Option B (Historical Assignment Access):** Keep relationships in `Assignment`, but allow `checkTrainerAccess` and `MembersManagementService` to match any non-deleted assignment (`isActive: true`, regardless of whether `status` is `ACTIVE` or `COMPLETED`).
- **Why Approval Is Needed:** Changes core authorization rules across 5 backend services and defines how Members are onboarded and assigned to Coaches.

---

## Decision 3: Post-Login Landing Route (`/home` vs. `/dashboard`)
- **Context:** Currently, logging in redirects the user to `/home` (`useLogin.ts:32`), which mounts `features/landing/pages/LandingPage.tsx` (a public SaaS marketing page with "Start Free Trial" buttons) inside the authenticated `AppLayout`. Meanwhile, an unmounted Member home page exists at `frontend/src/features/home/pages/HomePage.tsx`, and `/dashboard` (`DashboardPage.tsx`) already redirects Coaches/Admins to `/coach-dashboard` and renders `MemberDashboard` for Members.
- **Options:**
  - **Option A (Recommended — Redirect Login to `/dashboard` & Move `LandingPage` to Public `/`):** Make `/` render `LandingPage` (or `OverviewPage`) for unauthenticated visitors, and redirect authenticated users directly to `/dashboard` (for Members) or `/coach-dashboard` (for Coaches/Admins), removing the redundant authenticated `/home` marketing tab.
  - **Option B (Restore Authenticated `/home` Hub):** Mount `features/home/pages/HomePage.tsx` at `/home` for Members (fixing its broken links) and create a corresponding `/home` hub for Coaches.

---

## Decision 4: Workout & Exercise Library Ownership Model
- **Context:** Currently:
  - `Exercise` is a **global shared catalog** where any Coach can edit or soft-delete any exercise created by another Coach (`exercise.service.ts:76,118`).
  - `Workout` is **scoped to `createdBy` on list/update/delete**, un-scoped on `getById`, and enforces **global `title` uniqueness** across all Coaches (`workout.service.ts:20`).
  - Frontend mounts the exact same `WorkoutsPage`, `CreateWorkoutPage`, `WorkoutDetailsPage`, and `EditWorkoutPage` twice: under `/workout-builder/*` AND under `/workout-library/workouts/*` (`AppRouter.tsx:127-180`).
- **Options:**
  - **Option A (System Templates + Coach-Owned Custom Items):** Seeded/Admin exercises and workouts are read-only global templates (`isTemplate: true`), while Coaches can create/edit/delete only their own custom exercises and workouts (`createdBy: trainerId`), with workout title uniqueness scoped per creator (`{ title, createdBy, isActive: true }`). Also consolidate `/workout-builder` and `/workout-library/workouts` into a single canonical route tree.
  - **Option B (Shared Gym Library):** All Coaches in a gym share full edit access to all exercises and workout templates.

---

## Decision 5: Member Self-Service Capabilities (Measurements, Insights & Assignments)
- **Context:** Currently:
  - Members cannot access `GET /api/v1/member-insights/:memberId` (`403 Forbidden`) or `GET /api/v1/assignments/:id` (`403 Forbidden`).
  - Members can call `GET /api/v1/body-measurements/member/:memberId` (for their own ID), but there is no Member UI route in the Sidebar for viewing or logging their own body weight/measurements.
- **Questions for Approval:**
  1. Should Members be allowed to view their own **Member Insights** charts and **Assignment Details** page?
  2. Should Members be allowed to log their own **Body Measurements** (e.g., self-reported weight/body fat), or are Body Measurements strictly recorded by Coaches/Staff while Members have read-only access?

---

## Decision 6: Active Workout Session Rules (Editing Completed Sets, Adding Sets & Abandoning Sessions)
- **Context:** During an active workout (`/sessions/active`):
  - Once a set is checked completed in `SetRow.tsx`, its inputs are permanently disabled (`disabled={isCompleted}`).
  - Members cannot add extra sets (`POST /workout-set-logs` is unmounted) or cancel/abandon an `IN_PROGRESS` session (`WORKOUT_SESSION_STATUS.CANCELLED` has no endpoint).
- **Questions for Approval:**
  1. Should Members be able to edit weight/reps of an already-checked set while the session is still `IN_PROGRESS`?
  2. Should Members be able to add extra sets beyond `targetSets` during a session, or must they strictly follow the Coach's prescribed `targetSets`?
  3. Should Members be able to cancel/abandon an `IN_PROGRESS` session without marking it `COMPLETED`?

---

## Decision 7: Scope of Commercial / Billing Features for V2
- **Context:** No membership plans, subscriptions, invoices, or payment integrations exist in code yet.
- **Options:**
  - **Option A (Manual / Front-Desk Subscription & Payment Tracking First):** Gym Owner/Admin defines `MembershipPlan`s, assigns `MemberSubscription`s, and logs cash/POS payments manually in STREN to track active/expired memberships and revenue KPIs without requiring online payment gateway KYC/webhooks initially.
  - **Option B (Full Online Checkout Integration):** Integrate Stripe or Paymob checkout and webhooks for member self-service subscription purchases in V2.
