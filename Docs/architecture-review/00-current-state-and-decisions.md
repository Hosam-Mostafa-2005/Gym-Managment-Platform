# 00 — Current State Assessment & Approved Product Decisions

**Project:** STREN — Multi-Tenant Gym Management SaaS Platform  
**Document Mode:** Read-Only Architecture Review & Implementation Planning (No Code Changes)  
**Review Date:** 2026-10-10  
**Repository Root:** `C:\Hosam\Apps\React Projects\GYM\GYM Managment Platform`

---

## 1. Purpose and Epistemic Taxonomy

This architecture review translates the verified findings from the repository audit (`docs/audit/00-executive-summary.md` through `14-audit-coverage.md`) and the product owner's approved product direction into a concrete, dependency-ordered architecture and implementation plan.

To maintain strict engineering clarity, every statement across this 10-document review is classified into one of four categories:

| Classification | Meaning |
| :--- | :--- |
| **`[VERIFIED SOURCE]`** | Fact proven directly by inspecting the TypeScript, React, Express, or Mongoose source code (with exact file and line citations). |
| **`[APPROVED DECISION]`** | Product direction explicitly approved by the stakeholder for V2 planning and architecture. |
| **`[ARCHITECTURAL PROPOSAL]`** | Technical design, schema, API contract, or state machine recommended by the architect to satisfy approved decisions and resolve verified risks. |
| **`[OPEN DECISION]`** | Unresolved product, policy, or commercial question that must be signed off before specific code paths are implemented. |

---

## 2. Mandatory Audit Inspection Summary (`[VERIFIED SOURCE]`)

All six required baseline audit documents in `docs/audit/` (`00-executive-summary.md`, `10-architecture-risks.md`, `11-v2-roadmap-proposal.md`, `12-architecture-blueprint.md`, `13-next-decisions.md`, and `14-audit-coverage.md`)—along with supporting deep-dive audit documents (`05-database-and-erd.md` and `08-roles-and-permissions-audit.md`) and the underlying `frontend/src/` and `backend/src/` files—were inspected and cross-validated. No expected audit documents are missing.

### 2.1 Snapshot of What Exists Today (`[VERIFIED SOURCE]`)

1. **Technology Stack:**
   - **Frontend (`frontend/`):** React 19, Vite 8, TypeScript, Tailwind CSS v4, TanStack React Query v5, Zustand (`auth.store.ts`, `theme.store.ts`), React Router v7 (`AppRouter.tsx`), Axios (`lib/axios.ts`), Socket.IO Client (`lib/socket.ts`).
   - **Backend (`backend/`):** Node.js, Express 5, TypeScript, Mongoose 9 (MongoDB), Zod request validation (`validate.middleware.ts`), JWT authentication (`auth.middleware.ts`), Socket.IO (`socket/index.ts`).
2. **Database Models (9 Active Collections in `backend/src/models/`):**
   - `User` (`User.model.ts`), `Exercise` (`Exercise.model.ts`), `Workout` (`Workout.model.ts` with embedded `workoutExerciseSchema`), `Assignment` (`Assignment.model.ts`), `WorkoutSession` (`WorkoutSession.model.ts`), `WorkoutExerciseLog` (`WorkoutExerciseLog.model.ts`), `WorkoutSetLog` (`WorkoutSetLog.model.ts`), `BodyMeasurement` (`BodyMeasurement.model.ts`), and `Notification` (`Notification.model.ts`).
3. **Current Role System (`backend/src/constants/roles.ts:1-7` & `frontend/src/constants/roles.ts:1-7`):**
   - Defines only three flat roles: `ADMIN ("admin")`, `TRAINER ("trainer")`, and `MEMBER ("member")`.
   - No `GYM_OWNER` role, no `Gym` entity, no `CoachMemberRelationship` entity, no `Profile` / `Membership` entity, and no subscription or payment models exist in the codebase.

### 2.2 Critical Baseline Defects Blocking Expansion (`[VERIFIED SOURCE]`)

Before multi-tenancy, profile switching, or online billing can be layered onto STREN, **9 critical security and data-contract defects (`P0`/`P1`)** in the current codebase must be remediated:

1. **Public Role Escalation (`RISK-01` / `SEC-01`):** `backend/src/validators/auth.validator.ts:13` accepts `role: z.enum([Roles.ADMIN, Roles.TRAINER, Roles.MEMBER]).optional()` and `backend/src/services/auth.service.ts:20` passes `req.body` directly into `User.create(userData)`.
2. **Global User Directory Exposure (`RISK-02` / `SEC-02`):** `backend/src/routes/user.routes.ts:8,20` applies `protect` without `restrictTo`, allowing any authenticated Member to dump all platform users (`GET /api/v1/users`).
3. **Deactivated User Token Acceptance (`RISK-03` / `SEC-03`):** `backend/src/middleware/auth.middleware.ts:33-42` (`protect`) never verifies `if (!currentUser.isActive)`.
4. **Query Parameter Filter Override (`RISK-08` / `SEC-04`):** `backend/src/utils/ApiFeatures.ts:9-19` (`filter()`) calls `this.query.find(queryObj)` *after* service-level `.find(filter)` calls, enabling query string parameters (`?trainer=...`, `?createdBy=...`, `?isActive=false`) to overwrite ownership, soft-delete, and future tenant filters in `assignment.service.ts:130`, `workout.service.ts:78`, `workout-session.service.ts:265`, and `user.service.ts:10`.
5. **Assignment Double-Mapping & Unpopulated Mutations (`RISK-04` & `RISK-21`):** `backend/src/mappers/assignment.mapper.ts:1-40` maps `_id` to `id` (stripping `_id`), and `frontend/src/features/assignments/utils/assignment.mapper.ts:3-32` then reads `assignment._id` (`undefined`), `trainer._id` (`undefined`), `workout._id` (`undefined`), and `member._id ?? member` (corrupting `member.id` into an object).
6. **Assignment Cancellation Validation Block (`RISK-05`):** `backend/src/services/assignment.service.ts:311-313` requires `cancelReason` when `status === "CANCELLED"`, but `backend/src/validators/assignment.validator.ts:41-77` strips `cancelReason` because it is missing from `updateAssignmentSchema`.
7. **Workout Session Telemetry Stripping (`RISK-06`):** `backend/src/mappers/workout-session.mapper.ts:1-8` returns only 6 fields (`id, assignment, status, startedAt, endedAt, duration`), stripping `progress`, `totalRestTime`, `activeTrainingTime`, `totalVolume`, `exercisesCompleted`, `setsCompleted`, and `notes`.
8. **Transient Assignment-Based Coach–Member Coupling (`RISK-07`):** Five backend services (`body-measurement.service.ts:18-28`, `member-profile.service.ts:15-25`, `member-insights.service.ts:23-33`, `members-management.service.ts:42-63`, `coach-dashboard.service.ts:164-174`) gate Coach access on `Assignment.exists({ trainer, member, status: "ACTIVE", isActive: true })`. When an assignment finishes (`COMPLETED`), the Coach immediately loses `403` access to the Member. Conversely, when a Member has assignments with two Trainers, `coach-dashboard.service.ts:94-101` and `members-management.service.ts:69-99` leak cross-coach assignments, sessions, and measurements.
9. **Frontend RBAC & Responsive Shell Failures (`RISK-09` & `RISK-10`):** `frontend/src/routes/ProtectedRoute.tsx:4-13` checks only for a token (zero role guards), `Sidebar.tsx:66-147` exposes Coach navigation items to Members while hiding `/profile`, and `Sidebar.tsx:207-215` + `AppLayout.tsx:18-27` render a permanent fixed flex sidebar on mobile that crushes `<main>` to `95px` width on `375px` screens.

---

## 3. Approved Product Decisions vs. Current Implementation

The table below maps every **`[APPROVED DECISION]`** from the stakeholder against the **`[VERIFIED SOURCE]`** state and summarizes the required architectural shift:

| Domain Area | Approved Product Direction (`[APPROVED DECISION]`) | Current Implementation (`[VERIFIED SOURCE]`) | Architectural Shift Required (`[ARCHITECTURAL PROPOSAL]`) |
| :--- | :--- | :--- | :--- |
| **1. Multi-Tenant SaaS** | Support multiple independent gyms on the same platform with explicit tenant isolation for users, coaches, members, workouts, assignments, measurements, notifications, subscriptions, and payments. | Single flat database with zero `gymId` fields across all 9 models (`backend/src/models/*.ts`). Global uniqueness enforced on `Exercise.name` and `Workout.title`. | Introduce `Gym` tenant entity, `GymMembership` / profile context, mandatory `gymId` scoping on tenant-bound collections, tenant-safe `ApiFeatures`, and tenant-scoped compound unique indexes. |
| **2. Shared Exercise & Workout Library** | Keep the Exercise and Workout library shared for now, with safe ownership and permissions preventing unauthorized cross-gym access or destructive edits. | `Exercise` is globally mutable by any Trainer (`exercise.routes.ts:84,122,156`). `Workout` is scoped to `createdBy` on `GET /workouts` (`workout.service.ts:59`), unscoped on `GET /workouts/:id` (`L86`), and enforces global `title` uniqueness (`L20`). | Introduce a 3-tier visibility/ownership model (`visibility: "SYSTEM" \| "GYM_SHARED" \| "PRIVATE"`, `gymId`, `createdBy`) with clone/fork semantics so Coaches can use shared templates without mutating or deleting another Coach's or Gym's resources. |
| **3. Persistent Coach–Member Relationship** | Coach–Member relationship must be independent of individual `Assignment`s. Members can end the relationship; former coaches lose access to ongoing private data/editing while historical sessions, assignments, and measurements are preserved. | No relationship model exists. Access is inferred from `Assignment.exists({ trainer, member, status: "ACTIVE" })`. | Introduce first-class `CoachMemberRelationship` model (`gymId, coach, member, status: PENDING \| ACTIVE \| ENDED, startedAt, endedAt, endedBy, endReason`) as the authoritative ABAC boundary for Coach access to a Member. |
| **4. Member Self-Service** | Members can view their own `Assignment` details (read-only), view their own measurements/progress, and record their own measurements (`SELF` vs `COACH` recorded) using one coherent measurement domain model. | Members get `403` on `GET /assignments/:id` (`assignment.routes.ts:36`), `GET /member-insights/:memberId` (`member-insights.routes.ts:15`), and `POST /body-measurements` (`body-measurement.routes.ts:31`). `BodyMeasurement.trainer` is `required: true`. | Allow Member read access on own `Assignment` (`GET /assignments/:id`) and `MemberInsights`. Make `BodyMeasurement.trainer` optional (`null` when self-recorded), add `recordedBy` + `recordedByRole ("COACH" \| "MEMBER")`, and allow Members to create/update/delete only their own self-recorded measurements. |
| **5. Workout Sessions (Coach-Guided vs. Self-Training)** | • Edit logged weights/reps while `IN_PROGRESS`.<br>• Cancel accidentally started session.<br>• Coach-guided (`Assignment`): cannot add extra sets beyond plan.<br>• Self-training: can create/modify own workouts and add extra sets. | • `SetRow.tsx:76,84` locks inputs once `completed === true`.<br>• No cancel endpoint exists (`CANCELLED` enum is unused).<br>• `POST /workout-set-logs` (`workout-set.routes.ts`) is unmounted.<br>• `WorkoutSession.assignment` is `required: true` (`WorkoutSession.model.ts:24`), preventing self-training without a Coach assignment. | • Unlock `SetRow.tsx` editing while `session.status === "IN_PROGRESS"` and allow `PATCH /workout-set-logs/:id` on completed sets.<br>• Add `PATCH /workout-sessions/:id/cancel`.<br>• Add `sessionMode: "COACH_GUIDED" \| "SELF_TRAINING"` to `WorkoutSession` (with `assignment` required only for `COACH_GUIDED`, and `workout` reference on all sessions).<br>• Mount `POST /workout-set-logs` and gate it on `sessionMode === "SELF_TRAINING"`. |
| **6. Online Checkout & Subscriptions** | Plan online payment checkout, server-side payment verification, signed webhook handling, idempotency, payment states, subscriptions, invoices, and tenant-safe financial records. | `NOT IMPLEMENTED`. Zero models, routes, or UI exist for plans, subscriptions, invoices, payments, or webhooks. | Design provider-agnostic Payment Gateway Adapter (evaluating Stripe vs. Paymob/Tap by launch region), `MembershipPlan`, `MemberSubscription`, `Invoice`, `PaymentTransaction`, and `PaymentWebhookEvent` models with raw-body HMAC verification and idempotency keys. |
| **7. Account & Multiple Profiles (`[OPEN DECISION]`)** | Evaluate Models A, B, and C for Facebook-style one-login profile switching without silently merging Accounts, Profiles, People, Memberships, and Roles. | `User.model.ts` conflates authentication credentials (`email`, `password`), human identity (`name`, `phone`), global `role`, and trainer bio fields in a single flat document. | Decouple **Authentication Account (`UserAccount`)** from **Tenant/Role Profiles (`UserProfile` / `GymMembership`)**, recommending **Model C** (with optional Model A/B extensions) as detailed in `03-account-profile-role-model.md`. |

---

## 4. Architecture Review Document Map

All 10 deliverables required by this architecture review are organized in `docs/architecture-review/`:

| Document | Focus Area | Required Mermaid Diagrams Included |
| :--- | :--- | :--- |
| [00-current-state-and-decisions.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/00-current-state-and-decisions.md) | Baseline audit synthesis, epistemic taxonomy, approved decisions vs. current code | — |
| [01-target-architecture.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/01-target-architecture.md) | Target multi-tenant SaaS system architecture, request pipeline, context resolution, real-time & webhook flows | **Diagram 1:** Current vs. Target System Context |
| [02-multi-tenant-data-model.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/02-multi-tenant-data-model.md) | Complete Mongoose schemas, tenant-scoped indexes, query/aggregation isolation rules, and single-to-multi-tenant data migration plan | — |
| [03-account-profile-role-model.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/03-account-profile-role-model.md) | Comparison of Profile Switching Models A, B, and C, recommended architecture, JWT/context design, and audit logging | **Diagram 2:** Account, Profile, Role, Gym, and Membership Relationships |
| [04-authorization-and-data-ownership.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/04-authorization-and-data-ownership.md) | Unified RBAC + ABAC + Tenant Isolation rules, Shared Library permission model, and Persistent Coach–Member lifecycle | **Diagram 3:** Multi-Tenant Data Ownership & Authorization Boundaries<br>**Diagram 4:** Coach–Member Relationship Lifecycle |
| [05-member-and-coach-journeys.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/05-member-and-coach-journeys.md) | Redesigned Member self-service, unified BodyMeasurement flow, and Coach-Guided vs. Self-Training workout execution | **Diagram 5:** Coach-Guided vs. Self-Training Workflows |
| [06-subscriptions-and-payments.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/06-subscriptions-and-payments.md) | Payment gateway evaluation, server-side checkout, signed webhooks, idempotency, subscriptions, and invoices | **Diagram 6:** Subscription and Payment Lifecycle |
| [07-security-and-data-contract-fix-plan.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/07-security-and-data-contract-fix-plan.md) | File-by-file remediation blueprint for all `P0` and `P1` security, ownership, and data contract vulnerabilities | — |
| [08-phased-implementation-roadmap.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/08-phased-implementation-roadmap.md) | Dependency-ordered implementation stages, file modification manifests, testing strategy, and rollback plans | **Diagram 7:** Dependency-Ordered Implementation Stages |
| [09-open-decisions.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/09-open-decisions.md) | Consolidated register of unresolved product, policy, and commercial decisions requiring stakeholder sign-off | — |
