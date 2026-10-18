# 08 — Roles, Authentication & Permissions Audit

**Verification Status:** `VERIFIED` (All auth/RBAC middleware, constants, controllers, services, and frontend route/UI checks inspected)

---

## 1. Role Definitions & RBAC Architecture

### 1.1 Defined Roles (`VERIFIED`)
Both backend (`backend/src/constants/roles.ts:1-7`) and frontend (`frontend/src/constants/roles.ts:1-7`) define the exact same 3-role constant:
```ts
export const Roles = {
  ADMIN: "admin",
  TRAINER: "trainer",
  MEMBER: "member",
} as const;
```
- **Missing Role (`VERIFIED`):** There is **no `GYM_OWNER` or `OWNER` role** anywhere in the codebase.
- **Role Case Inconsistency on Frontend (`VERIFIED`):**
  - Backend stores and returns lowercase role strings: `"admin"`, `"trainer"`, `"member"`.
  - Several frontend components normalize with `.toUpperCase()` (`Sidebar.tsx:187`, `Header.tsx:415`, `DashboardPage.tsx:15`, `ProfilePage.tsx:15`) and compare against `"TRAINER"`, `"ADMIN"`, `"MEMBER"`.
  - Meanwhile, `AssignmentForm.tsx:44,47` calls `useUsers("member")` and `useUsers("trainer")` with lowercase strings (`useUsers.ts:12` checks `u.role === role`).

---

## 2. Authentication Lifecycle & Token Security

| Mechanism | Implementation File & Lines | Verification & Security Findings |
| :--- | :--- | :--- |
| **Password Hashing** | `backend/src/models/User.model.ts:51-56, 106-117` | `password` has `select: false` and `minlength: 8`. Hashed with `bcrypt.hash(this.password, 12)` in `pre("save")` hook. Verified via `bcrypt.compare`. |
| **JWT Signing** | `backend/src/utils/generateToken.ts:4-8`<br>`backend/src/config/env.ts:5-8` | Signs `{ id: userId }` with `process.env.JWT_SECRET` and `process.env.JWT_EXPIRES_IN`. Role is **not** embedded in the JWT payload (`JwtPayload` only has `{ id, iat, exp }`). |
| **Token Delivery** | `backend/src/utils/sendToken.ts:11-24` | Sets HTTP-only cookie `"jwt"` (`httpOnly: true, secure: false, sameSite: "lax", maxAge: 7d`) AND returns `token` in the JSON body `{ status: "success", token, data: { user } }`. |
| **Frontend Token Storage** | `frontend/src/services/token.service.ts:1-16`<br>`frontend/src/lib/axios.ts:13-21` | Stores JWT in `localStorage.getItem("access_token")` and sends it via `Authorization: Bearer <token>` header. Does not use cookies (`withCredentials` is not set on `axios` instance). |
| **Backend Token Verification (`protect`)** | `backend/src/middleware/auth.middleware.ts:10-45` | Accepts `Authorization: Bearer <token>` first, falls back to `req.cookies.jwt`. Verifies token via `jwt.verify`, fetches `User.findById(decoded.id)`, and sets `req.user = currentUser`. |

---

## 3. Dual Backend Authorization Mechanisms (`restrictTo` vs `authorize`)

The backend contains two separate authorization middlewares that were never unified:

1. **Role-List Middleware: `restrictTo(...roles: Role[])` (`backend/src/middleware/auth.middleware.ts:47-61`)**
   - Checks `roles.includes(req.user.role)`.
   - Used across **15 route files** (`auth`, `workout`, `assignment`, `workout-session`, `workout-exercise-log`, `workout-set`, `dashboard`, `coach-dashboard`, `coach-profile`, `member-insights`, `members-management`, `body-measurement`).
2. **Permission-Matrix Middleware: `authorize(permission: Permission)` (`backend/src/middleware/authorize.middleware.ts:7-21`)**
   - Calls `hasPermission(req.user.role, permission)` (`backend/src/utils/hasPermission.ts:5-18`) against `RolePermissions` (`backend/src/constants/role-permissions.ts:1-65`).
   - `Roles.ADMIN` bypasses all permission checks (`if (role === Roles.ADMIN) return true;` at `hasPermission.ts:7`).
   - **Used ONLY in 1 route file (`backend/src/routes/exercise.routes.ts:84,122,156`)** for `Exercise.CREATE`, `Exercise.UPDATE`, `Exercise.DELETE`! The other 17 permissions defined in `backend/src/constants/permissions.ts` (`Dashboard.*`, `Profile.*`, `Workout.*`, `Assignment.*`, `Session.*`, `Client.*`) are never referenced anywhere in routes, controllers, or services.

---

## 4. Resource Ownership Matrix (Route + Service Level)

| Resource / Endpoint | Admin Access | Trainer (Coach) Access | Member Access | Verified Ownership / Security Gaps |
| :--- | :--- | :--- | :--- | :--- |
| **`POST /auth/register`** | Public | Public | Public | **`P0` Critical Flaw:** `registerSchema` (`auth.validator.ts:13`) accepts `role: z.enum([Roles.ADMIN, Roles.TRAINER, Roles.MEMBER]).optional()`. Anyone can self-register as `"admin"` or `"trainer"`. |
| **`GET /users`** | Allowed | Allowed | **Allowed (Bug!)** | **`P0` Critical Flaw:** `user.routes.ts:8,20` only has `protect` (no `restrictTo`). Any `member` can list all users (Admins, Trainers, Members) in the database, and pass `?isActive=false` via `ApiFeatures.filter()`. |
| **`Exercises` (`GET`, `POST`, `PATCH`, `DELETE`)** | Full CRUD | Full CRUD (Global) | Public `GET` (`/` & `/:id`), `403` on mutations | Exercises have no `createdBy` owner field. Any Trainer can modify or soft-delete any Exercise in the global catalog (unless used in an active workout). |
| **`Workouts` (`GET /workouts`)** | All active workouts | Own workouts (`createdBy: userId`) | **Allowed (Bug!)** (`createdBy: userId` -> `[]`, or override via query!) | **`P1` Flaw:** `workout.routes.ts:31` only has `protect`. Worse, `workout.service.ts:74-78` runs `ApiFeatures.filter()` after `Workout.find(filter)`, allowing `?createdBy=<anotherTrainerId>` in the query string to bypass ownership! |
| **`Workouts` (`GET /workouts/:id`)** | Any workout | **Any trainer's workout (Bug!)** | **Any trainer's workout (Bug!)** | **`P1` Flaw:** `workout.routes.ts:33` only has `protect`, and `workout.service.ts:86-92` queries `Workout.findOne({ _id: id, isActive: true }).populate("createdBy")` with zero ownership check! `ownsWorkout` middleware (`workoutOwnership.middleware.ts`) was written but never mounted. |
| **`Workouts` (`POST`, `PATCH`, `DELETE`)** | Full access | Own workouts (`createdBy: userId` in service) | `403 Forbidden` | Service checks `createdBy: userId` on `update` (`workout.service.ts:118`) and `delete` (`L192`). |
| **`Assignments` (`GET /assignments`)** | All active assignments | Own assignments (`trainer: userId`) | `403 Forbidden` | `ApiFeatures.filter()` in `assignment.service.ts:130` allows query param override (`?trainer=otherTrainerId`). |
| **`Assignments` (`GET /assignments/:id`)** | Any assignment | Own assignment (`trainer: userId`) | `403 Forbidden` | Members cannot call `GET /assignments/:id`, even though Member notifications (`ASSIGNMENT_CREATED`, `ASSIGNMENT_UPDATED`) link to `/assignments/${assignment.id}`! |
| **`Assignments` (`GET /assignments/me`)** | `403 Forbidden` | `403 Forbidden` | Own assignments (`member: userId`) | Restricted to `Roles.MEMBER`. |
| **`Assignments` (`POST`, `PATCH`, `DELETE`)** | Full access | Own assignments (`trainer: userId`) | `403 Forbidden` | Any Trainer can create an assignment for *any* active Member ID in the database (`assignment.service.ts:33-44`). Once created, that Trainer gains active-assignment access to that Member's profile, insights, and measurements! |
| **`WorkoutSessions` (`start`, `finish`, `current`)** | `403 Forbidden` | `403 Forbidden` | Own sessions (`member: userId`) | Enforced in both route (`restrictTo(Roles.MEMBER)`) and service (`member: memberId`). |
| **`WorkoutSessions` (`GET /`, `GET /:id`)** | All sessions | Sessions for Trainer's assignments | Own sessions (`member: userId`) | `ApiFeatures.filter()` in `getAll` (`workout-session.service.ts:265`) allows query overrides. |
| **`BodyMeasurements` (`POST`, `PATCH`, `DELETE`)** | Full access | Only if active assignment exists with Member (`checkTrainerAccess`) | `403 Forbidden` | **Cross-Coach Edit Gap (`body-measurement.service.ts:146,179`):** `update` and `delete` check `checkTrainerAccess(userId, measurement.member)` rather than `measurement.trainer.toString() === userId`. Also, if a Trainer's assignment with a Member completes (`status: COMPLETED`), `checkTrainerAccess` immediately blocks the Trainer with `403`! |
| **`BodyMeasurements` (`GET /member/:memberId`, `/latest`, `/:id`)** | Full access | Only if active assignment exists (`checkTrainerAccess`) | Own measurements (`userId === memberId`) | Properly scoped in `body-measurement.service.ts:72-77, 90-95, 117-126`. |
| **`MemberProfile` (`GET /member-profile/:memberId`)** | Full access | Only if active assignment exists (`checkTrainerAccess`) | Own profile (`userId === memberId`) | Properly scoped in `member-profile.service.ts:139-147`. |
| **`MemberInsights` (`GET /member-insights/:memberId`)** | Full access | Only if active assignment exists (`checkTrainerAccess`) | `403 Forbidden` | Members are blocked from viewing their own insights endpoint (`member-insights.routes.ts:15` & `member-insights.service.ts:290`). |
| **`MembersManagement` (`GET /members-management`)** | All active members | Members with an active assignment with this Trainer | `403 Forbidden` | **Cross-Coach Data Leak (`members-management.service.ts:69-99`):** Step 3 (`allAssignments` `$lookup`) fetches all active assignments for the matched member without filtering by `trainer: userId`, so `currentAssignment` can expose another Trainer's name and workout! |
| **`CoachDashboard` (`GET /coach-dashboard`)** | Global overview | Scoped to `memberIds` from active assignments | `403 Forbidden` | **Cross-Coach Data Leak (`coach-dashboard.service.ts:94-101`):** `relatedModelMatch` filters `WorkoutSession` and `BodyMeasurement` by `member: { $in: memberIds }` without filtering by `trainer`, exposing sessions/measurements recorded under other trainers for shared members. |

---

## 5. Summary of Verified Security & Authorization Vulnerabilities

| ID | Severity | Vulnerability | Location | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | `P0 — Critical` | Unauthenticated privilege escalation: `registerSchema` allows registering with `role: "admin"` or `"trainer"`. | `backend/src/validators/auth.validator.ts:13` | `VERIFIED` |
| **SEC-02** | `P0 — Critical` | Unrestricted user directory dump: `GET /api/v1/users` lacks `restrictTo`, allowing any Member to list all users and emails. | `backend/src/routes/user.routes.ts:8,20` | `VERIFIED` |
| **SEC-03** | `P0 — Critical` | Deactivated user bypass: `protect` middleware never checks `currentUser.isActive`, allowing deactivated accounts with unexpired tokens full API access. | `backend/src/middleware/auth.middleware.ts:33-42` | `VERIFIED` |
| **SEC-04** | `P1 — Foundation` | Query parameter filter override (`ApiFeatures.filter()`): Passing `?trainer=...`, `?createdBy=...`, or `?isActive=false` overrides base `.find(filter)` constraints in `assignment`, `workout`, `workout-session`, and `user` services. | `backend/src/utils/ApiFeatures.ts:9-19` | `VERIFIED` |
| **SEC-05** | `P1 — Foundation` | Missing ownership check on `GET /api/v1/workouts/:id` and unmounted `ownsWorkout` middleware; also populates full `createdBy` User document. | `backend/src/services/workout.service.ts:86-92`<br>`backend/src/middleware/workoutOwnership.middleware.ts` | `VERIFIED` |
| **SEC-06** | `P1 — Foundation` | Any Trainer can assign a workout to any Member ID in the system (`POST /api/v1/assignments`), which automatically grants that Trainer access to the Member's profile, insights, and body measurements! | `backend/src/services/assignment.service.ts:33-44` | `VERIFIED` |
| **SEC-07** | `P1 — Foundation` | Frontend `ProtectedRoute.tsx` performs zero role checks, and `Sidebar.tsx` exposes Coach navigation groups (`Members Management`, `Workout Builder`, `Workout Library`, `Assignments`) to `MEMBER` users. | `frontend/src/routes/ProtectedRoute.tsx:4-13`<br>`frontend/src/components/shared/sidebar/Sidebar.tsx:66-127` | `VERIFIED` |
| **SEC-08** | `P2 — Product Completion` | Unescaped `$regex` input in `ApiFeatures.search()` and `membersManagementService.getAllMembers()` allows ReDoS / regex injection via `search` query parameter. | `backend/src/utils/ApiFeatures.ts:26-31`<br>`backend/src/services/members-management.service.ts:32` | `VERIFIED` |
| **SEC-09** | `P2 — Product Completion` | Missing Zod validation middleware on `PATCH /api/v1/coach-profile`. | `backend/src/routes/coach-profile.routes.ts:17-20` | `VERIFIED` |
