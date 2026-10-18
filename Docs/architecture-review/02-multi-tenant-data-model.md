# 02 — Multi-Tenant Data Model, Indexes & Migration Strategy

**Classification:** `[APPROVED DECISION]` (Multi-Tenant SaaS Isolation) + `[ARCHITECTURAL PROPOSAL]` (Schemas, Indexes & Migration)

---

## 1. Tenancy Classification of All Collections

Not every collection in a multi-tenant fitness platform has the same tenancy boundary. Simply slapping `gymId` onto every collection without architectural rules breaks cross-gym profile switching and shared exercise libraries.

We classify all target collections into **three tenancy tiers**:

| Tenancy Tier | Collections | Isolation & Ownership Rule |
| :--- | :--- | :--- |
| **Tier 1: Platform / Global Scope** | • `UserAccount` (Authentication identity)<br>• `Gym` (Tenant root)<br>• `PaymentWebhookEvent` (Provider ingress log) | Scoped at the platform level. `UserAccount.email` is globally unique across STREN. `Gym.slug` is globally unique. |
| **Tier 2: Hybrid Scope (System + Gym + Personal)** | • `UserProfile` (Persona / Gym Membership)<br>• `Exercise` (Shared Library)<br>• `Workout` (Shared & Personal Library) | Can be **System-Global** (`gymId: null, visibility: "SYSTEM"`), **Gym-Scoped** (`gymId: ObjectId, visibility: "GYM_SHARED"`), or **Profile-Private** (`gymId: ObjectId | null, createdByProfile: ObjectId, visibility: "PRIVATE"`). |
| **Tier 3: Strictly Tenant-Scoped (or Personal Self-Training Scoped)** | • `CoachMemberRelationship`<br>• `Assignment`<br>• `WorkoutSession`<br>• `WorkoutExerciseLog`<br>• `WorkoutSetLog`<br>• `BodyMeasurement`<br>• `Notification`<br>• `MembershipPlan`<br>• `MemberSubscription`<br>• `Invoice`<br>• `PaymentTransaction`<br>• `AuditLog` | Every commercial and coaching document **must** carry `gymId: ObjectId`. (For independent Member self-training or self-measurements outside a gym, `gymId` may be `null` only when `ownerProfile.gymId === null`, and queries strictly filter by `{ gymId: ctx.gymId, memberProfile: ctx.profileId }`). |

---

## 2. Target Mongoose Schema Specifications (`[ARCHITECTURAL PROPOSAL]`)

### 2.1 New Core Tenant & Relationship Models

#### A. `Gym` (`backend/src/models/Gym.model.ts` — NEW)
Represents an independent commercial gym organization on STREN.
- **Fields:**
  - `_id`: `ObjectId`
  - `name`: `String` (required, trim, maxlength 120)
  - `slug`: `String` (required, lowercase, trim — URL-safe identifier)
  - `ownerAccount`: `ObjectId` (`ref: "UserAccount"`, required)
  - `status`: `String` (`enum: ["PENDING_SETUP", "ACTIVE", "SUSPENDED", "CLOSED"]`, default `"ACTIVE"`)
  - `settings`: `{ currency: String (default "USD"), timezone: String (default "UTC"), allowMemberSelfTraining: Boolean (default true), allowCoachSharedWorkouts: Boolean (default true) }`
  - `contact`: `{ email: String, phone: String, address: String, logoUrl: String }`
  - `isActive`: `Boolean` (default `true`)
  - `createdAt`, `updatedAt`: `Date`
- **Indexes:**
  - `{ slug: 1 }` (`unique: true`)
  - `{ ownerAccount: 1, isActive: 1 }`
  - `{ status: 1, isActive: 1 }`

#### B. `CoachMemberRelationship` (`backend/src/models/CoachMemberRelationship.model.ts` — NEW)
Decouples the Coach–Member relationship from transient workout `Assignment` documents (`[APPROVED DECISION]`, fixing `RISK-07`).
- **Fields:**
  - `_id`: `ObjectId`
  - `gymId`: `ObjectId` (`ref: "Gym"`, required, indexed)
  - `coachProfile`: `ObjectId` (`ref: "UserProfile"`, required)
  - `memberProfile`: `ObjectId` (`ref: "UserProfile"`, required)
  - `status`: `String` (`enum: ["PENDING", "ACTIVE", "ENDED"]`, required, default `"ACTIVE"`)
  - `assignedByProfile`: `ObjectId` (`ref: "UserProfile"`, required — Gym Owner, Coach, or Member who initiated)
  - `startedAt`: `Date` (required, default `Date.now`)
  - `endedAt`: `Date` (default `null`)
  - `endedByProfile`: `ObjectId` (`ref: "UserProfile"`, default `null`)
  - `endReason`: `String` (`enum: ["MEMBER_ENDED", "COACH_ENDED", "OWNER_REASSIGNED", "MEMBERSHIP_EXPIRED", "OTHER"]`, default `null`)
  - `notes`: `String` (maxlength 500, optional — coach internal onboarding note)
  - `isActive`: `Boolean` (default `true`)
  - `createdAt`, `updatedAt`: `Date`
- **Indexes:**
  - **Partial Unique Index (One Active Primary Coach per Member per Gym):**
    `{ gymId: 1, memberProfile: 1, status: 1 }` with `unique: true, partialFilterExpression: { status: "ACTIVE", isActive: true }` *(Note: see `09-open-decisions.md` if multiple concurrent coaches per member in the same gym should be allowed).*
  - `{ gymId: 1, coachProfile: 1, status: 1, isActive: 1 }` (Fast roster lookup for `MembersManagementService` and `CoachDashboardService`).
  - `{ gymId: 1, memberProfile: 1, startedAt: -1 }` (Historical coach timeline).

---

### 2.2 Multi-Tenant Upgrades to Existing Models

#### C. `Exercise` (`backend/src/models/Exercise.model.ts` — MODIFIED)
Supports the approved **Shared Exercise Library** direction without cross-gym destructive edits (`RISK-14`, `RISK-22`).
- **Added/Modified Fields:**
  - `scope`: `String` (`enum: ["SYSTEM", "GYM", "PERSONAL"]`, default `"SYSTEM"`, required)
  - `gymId`: `ObjectId` (`ref: "Gym"`, default `null` — `null` when `scope === "SYSTEM"`)
  - `createdByProfile`: `ObjectId` (`ref: "UserProfile"`, default `null` — `null` for seeded system exercises)
  - `forkedFrom`: `ObjectId` (`ref: "Exercise"`, default `null` — tracks if a Coach/Gym cloned a system exercise)
- **Index Changes (Fixing `RISK-14` & `RISK-22`):**
  - **Drop** global `{ name: 1 }` (`unique: true`).
  - **Create** compound partial unique index for System exercises: `{ name: 1, scope: 1 }` (`unique: true, partialFilterExpression: { scope: "SYSTEM", isActive: true }`).
  - **Create** compound partial unique index for Gym exercises: `{ gymId: 1, name: 1 }` (`unique: true, partialFilterExpression: { scope: "GYM", isActive: true }`).

#### D. `Workout` (`backend/src/models/Workout.model.ts` — MODIFIED)
Supports System templates, Gym-shared workouts, Coach-owned workouts, and Member self-training workouts (`[APPROVED DECISION]`).
- **Added/Modified Fields:**
  - `gymId`: `ObjectId` (`ref: "Gym"`, default `null` — `null` for `SYSTEM` templates or unaffiliated personal member workouts)
  - `createdByProfile`: `ObjectId` (`ref: "UserProfile"`, required — replaces or complements `createdBy: User`)
  - `visibility`: `String` (`enum: ["SYSTEM", "GYM_SHARED", "PRIVATE"]`, default `"PRIVATE"`, required)
  - `ownerRole`: `String` (`enum: ["PLATFORM_ADMIN", "GYM_OWNER", "COACH", "MEMBER"]`, required — distinguishes Coach programs from Member self-training routines)
  - `forkedFrom`: `ObjectId` (`ref: "Workout"`, default `null`)
- **Index Changes (Fixing `RISK-22`):**
  - Remove the global `Workout.findOne({ title })` check in `workout.service.ts:20-27`.
  - **Create** compound partial unique index per creator: `{ gymId: 1, createdByProfile: 1, title: 1 }` (`unique: true, partialFilterExpression: { isActive: true }`).
  - **Create** library query index: `{ gymId: 1, visibility: 1, isActive: 1, category: 1 }`.

#### E. `Assignment` (`backend/src/models/Assignment.model.ts` — MODIFIED)
- **Added/Modified Fields:**
  - `gymId`: `ObjectId` (`ref: "Gym"`, required)
  - `relationshipId`: `ObjectId` (`ref: "CoachMemberRelationship"`, required — proves an active Coach–Member relationship existed when assigned)
  - `memberProfile`: `ObjectId` (`ref: "UserProfile"`, required)
  - `coachProfile`: `ObjectId` (`ref: "UserProfile"`, required)
- **Index Changes (Fixing `RISK-14`):**
  - **Drop** `{ member: 1, workout: 1, status: 1 }` (`partialFilterExpression: { status: "ACTIVE" }`).
  - **Create** tenant-scoped, soft-delete-aware partial unique index:
    `{ gymId: 1, memberProfile: 1, workout: 1, status: 1 }` with `unique: true, partialFilterExpression: { status: "ACTIVE", isActive: true }`.
  - **Create** `{ gymId: 1, coachProfile: 1, status: 1, isActive: 1 }` and `{ gymId: 1, memberProfile: 1, status: 1, isActive: 1 }`.

#### F. `WorkoutSession`, `WorkoutExerciseLog`, and `WorkoutSetLog` (MODIFIED)
Supports both **Coach-Guided (`Assignment`)** and **Member Self-Training** modes (`[APPROVED DECISION]`).
- **`WorkoutSession` Added/Modified Fields:**
  - `gymId`: `ObjectId` (`ref: "Gym"`, default `null`)
  - `memberProfile`: `ObjectId` (`ref: "UserProfile"`, required)
  - `sessionMode`: `String` (`enum: ["COACH_GUIDED", "SELF_TRAINING"]`, required)
  - `assignment`: `ObjectId` (`ref: "Assignment"`, default `null` — **required only when `sessionMode === "COACH_GUIDED"`**)
  - `workout`: `ObjectId` (`ref: "Workout"`, required — stored directly on `WorkoutSession` so self-training sessions and analytics do not require joining `Assignment`!)
  - `coachProfile`: `ObjectId` (`ref: "UserProfile"`, default `null` — snapshot of supervising coach at session start for `COACH_GUIDED` sessions)
  - `cancelledAt`: `Date` (default `null`)
  - `cancelReason`: `String` (optional)
- **`WorkoutSession` Index Changes:**
  - **Partial Unique Index (Prevent Concurrent Active Sessions per Member Profile):**
    `{ memberProfile: 1, status: 1 }` with `unique: true, partialFilterExpression: { status: "IN_PROGRESS", isActive: true }`.
  - `{ gymId: 1, memberProfile: 1, startedAt: -1 }`
  - `{ gymId: 1, coachProfile: 1, startedAt: -1 }`
- **`WorkoutExerciseLog` Added Fields:**
  - `gymId`: `ObjectId` (`ref: "Gym"`, default `null`)
  - `isCustomAdded`: `Boolean` (default `false` — `true` if added dynamically during a `SELF_TRAINING` session)
- **`WorkoutSetLog` Added Fields:**
  - `isExtraSet`: `Boolean` (default `false` — `true` if added beyond `targetSets` in `SELF_TRAINING` mode)

#### G. `BodyMeasurement` (`backend/src/models/BodyMeasurement.model.ts` — MODIFIED)
Supports unified Coach-recorded and Member self-recorded measurements (`[APPROVED DECISION]`).
- **Added/Modified Fields:**
  - `gymId`: `ObjectId` (`ref: "Gym"`, default `null`)
  - `memberProfile`: `ObjectId` (`ref: "UserProfile"`, required)
  - `trainer`: `ObjectId` (`ref: "User"`, **optional / `default: null`** — previously `required: true` at `BodyMeasurement.model.ts:18`)
  - `coachProfile`: `ObjectId` (`ref: "UserProfile"`, default `null` — populated when recorded by a Coach)
  - `recordedByProfile`: `ObjectId` (`ref: "UserProfile"`, required)
  - `recordedByRole`: `String` (`enum: ["COACH", "MEMBER", "GYM_OWNER"]`, required)
- **Indexes:**
  - `{ gymId: 1, memberProfile: 1, isActive: 1, measuredAt: -1 }`
  - `{ memberProfile: 1, recordedByRole: 1, measuredAt: -1 }`

#### H. `Notification` (`backend/src/models/Notification.model.ts` — MODIFIED)
- **Added Fields:**
  - `gymId`: `ObjectId` (`ref: "Gym"`, default `null`)
  - `recipientProfile`: `ObjectId` (`ref: "UserProfile"`, required, indexed)
  - `actorProfile`: `ObjectId` (`ref: "UserProfile"`, default `null`)

---

## 3. Query & Aggregation Isolation Rules (`[ARCHITECTURAL PROPOSAL]`)

Adding `gymId` to schemas does not prevent cross-tenant leaks unless every query and aggregation pipeline enforces tenant scoping:

1. **Safe `ApiFeatures` Refactor (`backend/src/utils/ApiFeatures.ts`):**
   - **Problem (`[VERIFIED SOURCE]`, `RISK-08`):** `new ApiFeatures(Model.find(baseFilter), req.query).filter()` allows `req.query` keys (`trainer`, `member`, `createdBy`, `isActive`, `gymId`) to overwrite `baseFilter`.
   - **Solution:** Replace `ApiFeatures.filter()` with an explicit **allowlist of filterable query fields per resource** (`allowedFilters: string[]`) and apply the mandatory security/tenant filter (`{ gymId: ctx.gymId, isActive: true, ...ownershipFilter }`) **last** via `.and([securityFilter])` so user query parameters can never override tenant, soft-delete, or ownership predicates.
2. **Aggregation Pipeline Rule:**
   - Every `Model.aggregate([...])` call (`coach-dashboard.service.ts`, `coach-profile.service.ts`, `dashboard.service.ts`, `member-profile.service.ts`, `member-insights.service.ts`, `members-management.service.ts`) must:
     1. Begin with a `$match` stage containing `{ gymId: new Types.ObjectId(ctx.gymId), isActive: true }`.
     2. Include `gymId` and `coachProfile` inside every nested `$lookup` `pipeline` `$match` stage (fixing the cross-coach leaks verified in `members-management.service.ts:69-99` and `coach-dashboard.service.ts:94-101`).

---

## 4. Migration Strategy for Existing Single-Tenant Data (`[ARCHITECTURAL PROPOSAL]`)

Existing development/staging data in MongoDB was created under the flat single-tenant schema (`User`, `Exercise`, `Workout`, `Assignment`, `WorkoutSession`, `BodyMeasurement`, `Notification`). To migrate without data loss:

### 4.1 Step-by-Step Backfill Migration Plan
1. **Step 1 — Pre-Migration Snapshot:**
   - Execute `mongodump --uri="..." --out=backups/pre-v2-multitenant-migration` before running any migration script.
2. **Step 2 — Create Default Founding Gym (`"STREN Founding Gym"`):**
   - Locate the primary `User` with `role: "admin"` (from `seed.ts` or existing DB).
   - Create one default `Gym` document (`slug: "stren-founding-gym"`, `status: "ACTIVE"`).
3. **Step 3 — Migrate `User` Documents into `UserAccount` + `UserProfile`:**
   - Preserve the existing `User._id` as `UserAccount._id` (or maintain backwards-compatible `userId` references during transition).
   - For each `User`, create a corresponding `UserProfile` linked to `accountId: user._id` and `gymId: defaultGym._id` with `role` mapped (`"admin"` → `"GYM_OWNER"` or `"PLATFORM_ADMIN"`, `"trainer"` → `"COACH"`, `"member"` → `"MEMBER"`), copying trainer fields (`bio`, `specialties`, `certifications`, `yearsOfExperience`) onto the `COACH` `UserProfile`.
4. **Step 4 — Backfill `CoachMemberRelationship` from Historical `Assignment`s:**
   - Query distinct `{ trainer, member }` pairs from `Assignment`.
   - If an `ACTIVE` assignment exists between `{ trainer, member }`, insert a `CoachMemberRelationship` with `status: "ACTIVE"`, `gymId: defaultGym._id`, `startedAt: earliestAssignment.startDate`.
   - If only `COMPLETED` or `CANCELLED` assignments exist, insert a `CoachMemberRelationship` with `status: "ACTIVE"` (so coaches don't lose their current roster) unless a newer trainer has an active assignment with that member.
5. **Step 5 — Backfill Tenant & Profile Fields on Domain Collections:**
   - **`Exercise`:** Set `scope: "SYSTEM"`, `gymId: null`, `createdByProfile: null` on all existing seeded exercises.
   - **`Workout`:** Set `gymId: defaultGym._id`, `visibility: workout.isTemplate ? "GYM_SHARED" : "PRIVATE"`, `ownerRole: "COACH"`, and `createdByProfile` from `createdBy`.
   - **`Assignment`:** Set `gymId: defaultGym._id`, `coachProfile`, `memberProfile`, and `relationshipId`.
   - **`WorkoutSession`:** Look up parent `Assignment` to backfill `gymId: defaultGym._id`, `sessionMode: "COACH_GUIDED"`, `workout: assignment.workout`, `coachProfile: assignment.coachProfile`, and `memberProfile`.
   - **`BodyMeasurement`:** Set `gymId: defaultGym._id`, `memberProfile`, `coachProfile`, `recordedByProfile: coachProfile`, and `recordedByRole: "COACH"`.
   - **`Notification`:** Set `gymId: defaultGym._id` and `recipientProfile` from `user`.
6. **Step 6 — Index Rebuild:**
   - Drop legacy global unique indexes (`Exercise.name_1`, `Assignment.member_1_workout_1_status_1`) and build the new tenant-scoped partial unique indexes.

### 4.2 Rollback Considerations
- **Additive Schema Compatibility:** All new fields (`gymId`, `sessionMode`, `recordedByRole`, `visibility`, `scope`) are added alongside existing fields (`member`, `trainer`, `createdBy`) before deprecating legacy fields.
- **Instant Rollback Path:** Because old fields are not deleted during the initial migration step, rolling back the application code to the pre-migration commit requires only restoring the two dropped indexes (`Exercise.name_1` and `Assignment.member_1_workout_1_status_1`) or restoring from the `mongodump` snapshot.
