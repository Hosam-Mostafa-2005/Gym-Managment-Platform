# 09 — Open Product & Architecture Decisions Register

**Classification:** `[OPEN DECISION]` (Requires Explicit Stakeholder Approval Before Implementing Dependent Phases)

---

## 1. Overview

While the core V2 product direction (Multi-Tenant SaaS, Shared Library, Persistent Coach–Member Relationship, Member Self-Service, Dual-Mode Workout Sessions, and Online Checkout) is approved, **6 specific product and policy questions** remain unresolved.

In accordance with architectural governance rules, we do not invent approval for these choices. Each decision below presents the options, architectural consequences, our recommended default, and which implementation phase it blocks.

---

## 2. Decision Register

### `DECISION-01`: Account & Multiple Profiles — Model C Only vs. Model C + Model B (Household/Parent-Child)
- **Context:** In [03-account-profile-role-model.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/03-account-profile-role-model.md), we compared:
  - **Model A:** Multiple personal training profiles for one human (rejected due to physiological/measurement fragmentation).
  - **Model B:** One login managing multiple distinct human beings (e.g., parent managing a minor child's profile).
  - **Model C:** One human login switching between authorized **Role & Gym personas** (`Personal Member` ↔ `Member @ Gym A` ↔ `Coach @ Gym A` ↔ `Gym Owner @ Gym B`).
- **Options:**
  - **Option 1 (Recommended — Model C for V2):** One `UserAccount` represents one physical human who can switch between multiple `UserProfile` personas (Member, Coach, Gym Owner across one or more gyms).
  - **Option 2 (Model C + Model B):** Also allow one `UserAccount` to create/manage profiles for distinct dependent humans (`Person` entity separate from `UserAccount`).
- **Consequences:** Option 2 requires separate `Person` records, guardian consent tracking, dependent subscription assignment, and a future "account graduation" flow when a minor gets their own login.
- **Blocks:** **Phase 3** (`UserAccount` / `UserProfile` schema finalization).

---

### `DECISION-02`: Cross-Gym Member Body Measurements — Shared Human History vs. Per-Gym Isolation
- **Context:** Under Model C, if a human trains at **Gym A** and later joins **Gym B** (or switches to their personal self-training profile), their physical body (`weight`, `height`, `bodyFat`, `circumferences`) is the same physical body.
- **Options:**
  - **Option 1 (Recommended — Human-Owned Measurements with Scoped Coach Visibility):** A Member always sees their complete lifetime `BodyMeasurement` timeline across their personal profile and gym memberships. An `ACTIVE` Coach at Gym B can view the Member's measurement timeline while their `CoachMemberRelationship` at Gym B is `ACTIVE`, while only being allowed to edit measurements recorded by that Coach at Gym B.
  - **Option 2 (Strict Per-Gym Measurement Partitioning):** Measurements recorded at Gym A are completely invisible when the Member or their new Coach is operating inside Gym B (`gymId` hard partition even for the Member's own body metrics).
- **Blocks:** **Phase 3 & Phase 5** (`BodyMeasurement` query scoping).

---

### `DECISION-03`: Historical Data Visibility When a Member Switches Coaches Within the Same Gym
- **Context:** It is **approved** that when a Member ends their relationship with **Coach 1**:
  1. Coach 1 loses access to the Member's ongoing private data and editing capabilities (`403 Forbidden`), and
  2. Historical workout sessions, assignments, and measurements are **not** deleted.
  - However, when the Member starts a new `ACTIVE` relationship with **Coach 2** (in the same gym), what should Coach 2 see?
- **Options:**
  - **Option 1 (Recommended — Continuity of Care for Active Coach):** While Coach 2 has an `ACTIVE` `CoachMemberRelationship` with the Member, Coach 2 can **read** the Member's historical `BodyMeasurement` trend and completed `WorkoutSession` volume/history (so Coach 2 has baseline context on the athlete's strength and weight history), but Coach 2 **cannot** edit or delete Coach 1's historical assignments or measurements.
  - **Option 2 (Strict Coach Partitioning):** Coach 2 can only see sessions and measurements created *after* Coach 2's `CoachMemberRelationship.startedAt` date (plus what the Member explicitly shares).
- **Blocks:** **Phase 4** (`MemberProfileService`, `MemberInsightsService`, and `BodyMeasurementService` query filters for an active Coach).

---

### `DECISION-04`: Fate of Active Assignments & In-Progress Sessions When Ending a Coach Relationship
- **Context:** When a Member clicks `"End Relationship with Coach"` (or a Gym Owner reassigns the Member to a new Coach), the Member may have `ACTIVE` workout `Assignment`s prescribed by the former Coach, and potentially an `IN_PROGRESS` `WorkoutSession` started 20 minutes ago.
- **Options:**
  - **Option 1 (Recommended — Auto-Cancel `ACTIVE` Assignments, Allow Finishing or Cancelling Current `IN_PROGRESS` Session):**
    - All `ACTIVE` `Assignment`s from the former Coach immediately transition to `status: "CANCELLED"` (`cancelReason: "Coaching relationship ended"`), while remaining visible in the Member's past assignment history.
    - If the Member wishes to keep training that routine independently, they can clone the workout into a `SELF_TRAINING` routine (only if the workout was `SYSTEM` or `GYM_SHARED`).
  - **Option 2 (Convert Active Assignment into a Self-Training Routine):** Automatically detach the active `Assignment` into a personal `SELF_TRAINING` workout for the Member. *(Not recommended if the Coach's `Workout` was `PRIVATE` intellectual property of the Coach).*
- **Blocks:** **Phase 4** (`RelationshipService.endRelationship` transaction logic).

---

### `DECISION-05`: Coach Visibility into a Coached Member's `SELF_TRAINING` Sessions
- **Context:** A Member who has an `ACTIVE` Coach at a gym might follow their Coach's `COACH_GUIDED` assignments on Monday/Wednesday/Friday, and also log an extra `SELF_TRAINING` session (e.g., an extra arm or cardio session) on Saturday.
- **Options:**
  - **Option 1 (Recommended — Visible to Active Coach with `"Self-Training"` Badge):** While a Coach has an `ACTIVE` `CoachMemberRelationship` with the Member in that gym, the Coach can see the Member's `SELF_TRAINING` sessions in `MemberInsights` and `MemberProfile` (tagged `sessionMode: "SELF_TRAINING"`) so the Coach knows the athlete's true total weekly fatigue and volume.
  - **Option 2 (Private to Member Only):** `SELF_TRAINING` sessions are strictly private to the Member and excluded from Coach views (`CoachDashboard`, `MemberInsights`, `MemberProfile`).
- **Blocks:** **Phase 5** (`WorkoutSession` and `MemberInsights` filtering).

---

### `DECISION-06`: Primary Launch Market, Payment Gateway & Commercial Settlement Model
- **Context:** In [06-subscriptions-and-payments.md](file:///C:/Hosam/Apps/React%20Projects/GYM/GYM%20Managment%20Platform/docs/architecture-review/06-subscriptions-and-payments.md), we designed a provider-agnostic `IPaymentGatewayAdapter`. Before implementing Phase 7, two commercial parameters must be confirmed:
- **Questions for Approval:**
  1. **Target Launch Region & First Gateway Adapter:**
     - **Option A:** Egypt / MENA local payments first (**Paymob** — EGP cards, Meeza, Vodafone Cash/Wallets, Fawry).
     - **Option B:** Global / GCC / US / EU first (**Stripe Checkout**).
     - **Option C:** GCC regional (**Tap Payments / Moyasar** — mada, KNET, Apple Pay).
  2. **Merchant of Record / Payout Flow:**
     - **Option 1 (Platform-Aggregated / Sub-Merchant Split):** Members pay through STREN's master gateway integration (or Stripe Connect / Paymob Split), and STREN settles payouts to each Gym.
     - **Option 2 (Bring-Your-Own-Merchant Keys per Gym):** Each Gym Owner connects their own encrypted Stripe/Paymob merchant account credentials in `/owner/settings/payments`.
- **Blocks:** **Phase 7 ONLY** *(Phases 1 through 6 can proceed without waiting on `DECISION-06`)*.
