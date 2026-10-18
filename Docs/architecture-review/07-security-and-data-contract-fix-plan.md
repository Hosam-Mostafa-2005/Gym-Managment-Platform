# 07 — Security & Data Contract Remediation Plan (`P0` & `P1` First)

**Classification:** `[VERIFIED SOURCE]` (Audit Findings) + `[ARCHITECTURAL PROPOSAL]` (Remediation Specifications & Validation Strategy)

---

## 1. Guiding Security Principle

> **Frontend route guards (`ProtectedRoute.tsx`) and sidebar filtering (`Sidebar.tsx`) are UX convenience controls only. Every security, role, ownership, and tenant boundary must be enforced unconditionally on the backend.**

Before building multi-tenancy, profile switching, or billing, the following **12 verified `P0` and `P1` defects** in the current codebase must be fixed so that new features are not built on top of broken contracts or open privilege escalation vulnerabilities.

---

## 2. Detailed Remediation Blueprint for Every `P0` & `P1` Finding

### FIX-01: Public Registration Role Escalation (`RISK-01` / `SEC-01` — `P0`)
- **Affected Files:**
  - [auth.validator.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/validators/auth.validator.ts#L6-L15)
  - [auth.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/auth.service.ts#L10-L24)
- **Verified Flaw & Impact:** `registerSchema` allows `role: z.enum([Roles.ADMIN, Roles.TRAINER, Roles.MEMBER]).optional()`, and `authService.register` passes `req.body` directly into `User.create(userData)`. Anyone can self-register as `"admin"` or `"trainer"`.
- **Proposed Correction:**
  1. Remove `role` completely from `registerSchema` in `backend/src/validators/auth.validator.ts`.
  2. In `auth.service.ts` (`register`), destructure only `{ name, email, password, phone }` and explicitly hardcode `role: Roles.MEMBER` (or create a `UserAccount` + default `MEMBER` `UserProfile` in Phase 3).
  3. Create privileged accounts (`COACH`, `GYM_OWNER`) only through dedicated authenticated provisioning/onboarding endpoints.
- **Dependencies:** None (can be fixed immediately in Phase 1).
- **Validation Strategy:**
  - Automated integration test: `POST /api/v1/auth/register` with `{ name, email, password, role: "admin" }` must either reject unknown field or create a user with `role === "member"`, never `"admin"`.

---

### FIX-02: Unrestricted Global User Directory Access (`RISK-02` / `SEC-02` — `P0`)
- **Affected Files:**
  - [user.routes.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/routes/user.routes.ts#L1-L23)
  - [user.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/user.service.ts#L1-L19)
- **Verified Flaw & Impact:** `GET /api/v1/users` uses `router.use(protect)` with zero role restriction and returns all users across the platform.
- **Proposed Correction:**
  1. Restrict `GET /api/v1/users` using `authorize(Permissions.Client.VIEW_ROSTER)` (or `restrictTo(Roles.ADMIN, Roles.TRAINER)` in Phase 1).
  2. Scope `user.service.ts` so:
     - A `COACH` only receives Members who have an `ACTIVE` `CoachMemberRelationship` with that Coach (in `ctx.gymId`).
     - A `GYM_OWNER` only receives users who hold a `UserProfile` within `ctx.gymId`.
     - Strip sensitive fields and select only `{ id, name, email, role }` needed for pickers.
- **Dependencies:** In Phase 1, restrict to `ADMIN`/`TRAINER`; in Phase 3/4, scope by `gymId` and `CoachMemberRelationship`.
- **Validation Strategy:**
  - Requesting `GET /api/v1/users` with a `MEMBER` token must return `403 Forbidden`.
  - Requesting `GET /api/v1/users` with Coach A's token must not return Members belonging to Gym B or unassigned Members.

---

### FIX-03: Deactivated User Authentication Bypass (`RISK-03` / `SEC-03` — `P0`)
- **Affected Files:**
  - [auth.middleware.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/middleware/auth.middleware.ts#L33-L42)
  - [socket/index.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/socket/index.ts#L28-L45)
- **Verified Flaw & Impact:** `protect` checks `if (!currentUser)` after `User.findById(decoded.id)`, but never checks `if (!currentUser.isActive)`. Deactivated users with an unexpired 7-day JWT retain full API and Socket access.
- **Proposed Correction:**
  1. In `auth.middleware.ts:34`, immediately check:
     ```ts
     if (!currentUser || !currentUser.isActive) {
       return next(new AppError("This account is no longer active.", 401));
     }
     ```
  2. Add the same `User.findById(decoded.id).select("isActive")` check inside the Socket.IO connection authentication middleware (`backend/src/socket/index.ts:28-45`).
- **Dependencies:** None.
- **Validation Strategy:**
  - Set `user.isActive = false` in DB while holding a valid JWT; verify subsequent `GET /api/v1/auth/me` and Socket.IO handshake both fail with `401 Unauthorized`.

---

### FIX-04: Query Parameter Filter Override (`ApiFeatures.filter()`) (`RISK-08` / `SEC-04` — `P1`)
- **Affected Files:**
  - [ApiFeatures.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/utils/ApiFeatures.ts#L9-L33)
  - [assignment.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/assignment.service.ts#L114-L135)
  - [workout.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout.service.ts#L56-L81)
  - [workout-session.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout-session.service.ts#L226-L270)
  - [user.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/user.service.ts#L7-L18)
  - [members-management.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/members-management.service.ts#L32)
- **Verified Flaw & Impact:** `ApiFeatures.filter()` merges arbitrary `req.query` parameters into `this.query.find(queryObj)` *after* the service's initial `.find(filter)` call. An attacker can pass `?trainer=<otherId>`, `?createdBy=<otherId>`, or `?isActive=false` to override ownership, soft-delete, and tenant filters! Additionally, `ApiFeatures.search()` (`L26-31`) and `members-management.service.ts:32` pass raw user strings into `$regex` without escaping regex metacharacters (`SEC-08`).
- **Proposed Correction:**
  1. Add `escapeRegex(str: string)` utility (`str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`) and apply it in `ApiFeatures.search()` and `members-management.service.ts`.
  2. Change `ApiFeatures.filter(allowedFields: string[] = [])` so it **only** extracts query keys explicitly listed in `allowedFields` (never `isActive`, `gymId`, `trainer`, `createdBy`, or MongoDB operators like `$where`/`$ne` on protected fields).
  3. Re-apply the service's mandatory `securityFilter` (`{ gymId, isActive: true, ...ownership }`) via `.and([securityFilter])` right before executing `.lean()`.
- **Dependencies:** None (critical prerequisite before Phase 3 multi-tenancy).
- **Validation Strategy:**
  - Verify `GET /api/v1/workouts?createdBy=<otherCoachId>&isActive=false` returns only the authenticated Coach's active workouts.

---

### FIX-05: `_id` vs `id` Inconsistencies & Assignment Double-Mapping (`RISK-04`, `RISK-11`, `RISK-13`, `RISK-21` — `P0`/`P1`)
- **Affected Files:**
  - Backend Mappers & Services:
    - [assignment.mapper.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/mappers/assignment.mapper.ts#L1-L40)
    - [assignment.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/assignment.service.ts#L96-L112) (and `#L195-L212`, `#L342-L379`)
    - [auth.controller.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/controllers/auth.controller.ts#L40-L47) (`getMe`)
    - [workout.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout.service.ts#L86-L104) (`getById`)
    - [exercise.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/exercise.service.ts#L62-L115) (`getAll`, `getById`)
    - [workout-session.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout-session.service.ts#L226-L270) (`getAll`)
    - [body-measurement.mapper.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/mappers/body-measurement.mapper.ts#L1-L28)
    - [coach-dashboard.mapper.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/mappers/coach-dashboard.mapper.ts#L32)
  - Frontend Mappers & Pages:
    - [assignment.mapper.ts (Frontend)](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/assignments/utils/assignment.mapper.ts#L1-L49)
    - [EditWorkoutPage.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/workouts/pages/EditWorkoutPage.tsx#L118-L125)
    - [ExerciseFormModal.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/exercises/components/ExerciseFormModal.tsx#L53-L61)
    - [AssignmentDetailsPage.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/assignments/pages/AssignmentDetailsPage.tsx#L319)
- **Verified Flaw & Impact:**
  1. `AssignmentService.getById` returns `mapAssignment(assignment)` (where `_id` is already converted to `id`), and then `frontend/src/features/assignments/utils/assignment.mapper.ts` tries to read `assignment._id` (`undefined`), `trainer._id` (`undefined`), `workout._id` (`undefined`), and `member._id ?? member` (corrupting `member.id` into an object!).
  2. `AssignmentService.create` (`L111`) and `update` (`L378`) call `mapAssignment` on unpopulated documents, returning `{ name: undefined }` for `member`, `trainer`, and `workout`.
  3. `auth.controller.ts` (`getMe`) returns raw Mongoose `req.user` (`_id`), whereas `login` and `register` return `mapUser(user)` (`id`).
  4. `WorkoutService.getById` returns raw `_id` on nested `exercises[].exercise._id`, breaking `EditWorkoutPage.tsx:120` (`ex.exercise?.id` is `undefined`).
  5. `body-measurement.mapper.ts:12` calls `doc.trainer.toString()` on a populated `trainer` object, returning `"[object Object]"`.
- **Proposed Correction:**
  1. **Standardize Backend Mappers:**
     - In `backend/src/mappers/assignment.mapper.ts`, support both populated objects and unpopulated `ObjectId`s, or populate `member`, `trainer`, and `workout` before calling `mapAssignment` in `create`, `update`, and `getMyAssignments`.Also map nested `workout.exercises[].exercise._id` → `id`.
     - In `auth.controller.ts` (`getMe`), return `mapUser(req.user)`.
     - In `workout.service.ts` (`getById`), pass the document through `mapWorkout(workout)` (updating `workout.mapper.ts` to map populated `exercises[].exercise` to `{ id, name, primaryMuscles, equipment, difficulty }`).
     - In `exercise.service.ts` (`getAll`, `getById`), pass documents through `mapExercise`.
     - In `body-measurement.mapper.ts:12`, extract `(doc.trainer?._id ?? doc.trainer)?.toString() ?? null` and include `trainerName: doc.trainer?.name`.
  2. **Fix Frontend `assignment.mapper.ts`:**
     - Update `frontend/src/features/assignments/utils/assignment.mapper.ts` to accept `assignment.id ?? assignment._id`, `member.id ?? member._id`, `trainer.id ?? trainer._id`, and `workout.id ?? workout._id`.
- **Dependencies:** None.
- **Validation Strategy:**
  - Load `/assignments/:id`, `/assignments/:id/edit`, and `/workout-builder/:id/edit`; verify all form dropdowns (`memberId`, `workoutId`, `exercises[].exercise`) pre-populate with valid string IDs and zero `undefined` or `[object Object]` values.

---

### FIX-06: Assignment Cancellation Blocked by Zod Schema (`RISK-05` — `P0`)
- **Affected Files:**
  - [assignment.validator.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/validators/assignment.validator.ts#L41-L77)
  - [AssignmentForm.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/assignments/components/AssignmentForm.tsx)
- **Verified Flaw & Impact:** `AssignmentService.update` (`assignment.service.ts:311-313`) throws `400 "Cancel reason is required when cancelling an assignment"` if `status === "CANCELLED"` and `!data.cancelReason`. However, `updateAssignmentSchema` (`assignment.validator.ts:41-77`) omits `cancelReason`, so `validate.middleware.ts:16` strips `cancelReason` from `req.body`!
- **Proposed Correction:**
  1. Add `cancelReason: z.string().trim().min(1).max(500).optional()` to `updateAssignmentSchema.shape.body` in `backend/src/validators/assignment.validator.ts`, plus a `.refine()` rule requiring `cancelReason` when `status === "CANCELLED"`.
  2. Add a conditional `cancelReason` textarea to `AssignmentForm.tsx` whenever `status === "CANCELLED"` is selected.
- **Dependencies:** None.
- **Validation Strategy:**
  - Submit `PATCH /api/v1/assignments/:id` with `{ status: "CANCELLED", cancelReason: "Injury recovery" }` and verify `200 OK` with `status === "CANCELLED"` and `cancelledAt` populated.

---

### FIX-07: Workout Session Telemetry Stripped & Active Session Bugs (`RISK-06` — `P0`)
- **Affected Files:**
  - [workout-session.mapper.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/mappers/workout-session.mapper.ts#L1-L8)
  - [workout-session.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout-session.service.ts#L121-L137)
  - [ExerciseTimeline.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/workout-sessions/components/ExerciseTimeline.tsx#L16-L52)
- **Verified Flaw & Impact:**
  1. `mapWorkoutSession` only returns `{ id, assignment, status, startedAt, endedAt, duration }`, stripping `progress`, `totalRestTime`, `activeTrainingTime`, `totalVolume`, `exercisesCompleted`, `setsCompleted`, and `notes`.
  2. `workoutSessionService.getCurrent` (`L124-129`) populates `assignment.workout` but forgets to populate `assignment.trainer`, so `TrainerCard` vanishes on page refresh!
  3. `ExerciseTimeline.tsx` in `/sessions/:id` (`WorkoutSessionDetailsPage`) never renders `exercise.sets`, hiding all logged weights and reps.
- **Proposed Correction:**
  1. Expand `backend/src/mappers/workout-session.mapper.ts` to include all telemetry fields (`progress`, `totalRestTime`, `activeTrainingTime`, `totalVolume`, `exercisesCompleted`, `setsCompleted`, `notes`, `sessionMode`, `workout`).
  2. Add `{ path: "trainer", select: "name email bio specialties" }` inside `getCurrent`'s `assignment` population (`workout-session.service.ts:125`).
  3. Render the table of `exercise.sets` (`setNumber`, `targetReps`, `actualReps`, `weight`, `restDuration`, `completed`) inside `ExerciseTimeline.tsx`.
- **Dependencies:** None.
- **Validation Strategy:**
  - Start a workout session, refresh `/sessions/active` (verify TrainerCard and progress bar persist), complete sets, finish session, and open `/sessions/:id` (verify total volume, rest time, and individual set weights/reps render).

---

### FIX-08: Missing Workout Ownership Check & Exercise Validator Bug (`SEC-05`, `RISK-15` — `P1`)
- **Affected Files:**
  - [workout.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout.service.ts#L86-L104)
  - [exercise.validator.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/validators/exercise.validator.ts#L20-L33)
- **Verified Flaw & Impact:**
  1. `WorkoutService.getById` (`workout.service.ts:86-92`) has zero ownership or tenant check and populates the full `createdBy` User document.
  2. `updateExerciseSchema` (`exercise.validator.ts:31`) uses `createExerciseSchema.shape.body.partial()`, which preserves `.default([])` on `secondaryMuscles` (`L20`), wiping out `secondaryMuscles` whenever a partial `PATCH /exercises/:id` omits that field!
- **Proposed Correction:**
  1. Enforce visibility/ownership in `WorkoutService.getById` (`SYSTEM`, `GYM_SHARED` in same `gymId`, `createdBy` owner, or assigned `Member`) and restrict `.populate("createdBy", "name email role")`.
  2. Remove `.default([])` from `secondaryMuscles` in `exercise.validator.ts:20` (use `.optional()` instead; Mongoose schema already sets `default: []` on creation).
- **Dependencies:** None.
- **Validation Strategy:**
  - Send `PATCH /api/v1/exercises/:id` with `{ description: "Updated" }` and verify `secondaryMuscles` is not overwritten with `[]`.

---

### FIX-09: Frontend RBAC Guards, Broken Navigation Links & Mobile Layout (`RISK-09`, `RISK-10`, `RISK-12` — `P1`)
- **Affected Files:**
  - [ProtectedRoute.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/routes/ProtectedRoute.tsx#L1-L14)
  - [AppRouter.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/routes/AppRouter.tsx#L1-L157)
  - [Sidebar.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/components/shared/sidebar/Sidebar.tsx#L66-L218)
  - [AppLayout.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/components/shared/layouts/AppLayout.tsx#L18-L27)
  - [Header.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/components/shared/header/Header.tsx#L325-L345)
  - [ActiveWorkoutPage.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/workout-sessions/pages/ActiveWorkoutPage.tsx#L46)
  - [AssignmentDetailsPage.tsx](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/frontend/src/features/assignments/pages/AssignmentDetailsPage.tsx#L319)
  - [workout-session.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/workout-session.service.ts#L109) (and `#L204`, `#L216`)
  - [body-measurement.service.ts](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/backend/src/services/body-measurement.service.ts#L64)
- **Proposed Correction:**
  1. Enhance `ProtectedRoute.tsx` to accept `allowedRoles?: Role[]` and redirect unauthorized roles to their role home route (`/coach-dashboard` or `/dashboard`).
  2. Add explicit `roles` arrays to every navigation group in `Sidebar.tsx` and move `/profile` into a shared account/profile section accessible to all roles.
  3. Fix all broken navigation links and notification `actionUrl`s:
     - `Header.tsx:330`: `/assignments/create` → `/assignments/new`
     - `Header.tsx:336`: `/workouts/create` → `/workout-builder/create`
     - `ActiveWorkoutPage.tsx:46`: `/workouts` → `/dashboard` (or `/my-workouts`)
     - `AssignmentDetailsPage.tsx:319`: `/workouts/${id}` → `/workout-builder/${id}`
     - `workout-session.service.ts:109,204,216`: `/workout-sessions/${id}` → `/sessions/${id}`
     - `body-measurement.service.ts:64`: `/body-measurements/${id}` → `/my-measurements`
  4. Make `Sidebar.tsx` hidden on `< 768px` (`hidden md:flex`) and render a mobile slide-over drawer triggered by a hamburger button in `Header.tsx`.
  5. Rename `["my-assignments"]` in `frontend/src/features/workout-sessions/hooks/useMyAssignments.ts` to `["active-workout-assignments"]`.
- **Dependencies:** Phase 1 backend contract fixes.
- **Validation Strategy:**
  - Verify on `375px` mobile viewport that `<main>` occupies `100%` width (`375px`), drawer opens/closes cleanly, and a `MEMBER` user only sees Member navigation items and cannot navigate to `/workout-builder` or `/members/all`.
