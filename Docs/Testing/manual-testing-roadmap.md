# STREN — Comprehensive Manual Testing & QA Roadmap

> **Scope:** End-to-end functional, authentication & routing separation (`/` vs. `/home` vs. `/dashboard`), role-based access control (RBAC), responsive layout (`320px`–`1440px+`), data-contract, and Phase 1 security regression verification across the STREN platform.

---

## A. Environment & Test Data Preparation

### A.1 Running Backend & Frontend Locally

1. **Start Backend API Server (`backend/`):**
   ```bash
   cd backend
   npm run dev
   ```
   - Verify console output confirms `MongoDB Connected` and server listening (default `http://localhost:5000`).
   - Optional: Run automated Phase 1 security & data-contract tests:
     ```bash
     npx tsx src/__tests__/phase1-security-and-contracts.test.ts
     ```
     - **Expected:** `14/14` tests pass (`0` failures).

2. **Start Frontend Dev Server (`frontend/`):**
   ```bash
   cd frontend
   npm run dev
   ```
   - Verify Vite dev server starts cleanly (default `http://localhost:5173`).

3. **Verify Production Build (`frontend/`):**
   ```bash
   cd frontend
   npm run build
   ```
   - **Expected:** `tsc -b && vite build` exits with code `0` and `0` TypeScript errors.

### A.2 Required Test Accounts & Roles

| Role | Identifier in Backend | Purpose | How to Obtain / Use |
| :--- | :--- | :--- | :--- |
| **Guest** | Unauthenticated (`no token`) | Test Public Landing Page (`/`), `/login`, `/register`, and protected route redirects | Use an Incognito window or clear browser storage |
| **Member** | `member` | Test `/home` (Member view), `/dashboard`, `/assignments/all` (`GET /assignments/me`), `/sessions`, `/sessions/active`, `/profile`, `/notifications` | Register a new account via `/register` (always creates a `member` account) |
| **Coach** | `trainer` | Test `/home` (Coach view), `/coach-dashboard`, `/members/all`, `/workout-builder/*`, `/workout-library/exercises/*`, `/assignments/*` | Sign in with an existing seeded `trainer` account |
| **Admin** | `admin` | Test full administrative access across all Coach, Member, and user management endpoints | Sign in with an existing seeded `admin` account |

### A.3 How to Reset / Clear Browser Storage When Testing Auth Transitions

When switching between Guest and Authenticated test cases (or testing expired/corrupted tokens):
1. Open Chrome DevTools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`).
2. Go to **Application** → **Storage** → **Local Storage** → `http://localhost:5173`.
3. Delete the auth token key (or click **Clear site data**).
4. Alternatively, run in the DevTools Console:
   ```js
   localStorage.clear();
   sessionStorage.clear();
   location.href = "/";
   ```

---

## B. Authentication & Routing Test Suite (14 Core Cases)

| Test ID | Priority | Scenario | Preconditions | Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | `P0` | Guest visits `/` → sees Public Landing Page | Guest (`localStorage` cleared) | 1. Navigate to `http://localhost:5173/`. | Renders `OverviewPage` (`OverviewHero`, `OverviewFeatures`, `OverviewCTA`) with prominent `STREN` branding, dark gym visual, `Get Started` CTA, and `Sign In` CTA. No sidebar/app shell is shown. |
| **AUTH-02** | `P0` | Guest clicks `Get Started` → navigates to `/register` | Guest on `/` | 1. Click `Get Started` in the top navbar, Hero section, or bottom CTA card. | Navigates to `/register` inside `AuthLayout`. |
| **AUTH-03** | `P0` | Guest clicks `Sign In` → navigates to `/login` | Guest on `/` | 1. Click `Sign In` in the top navbar, Hero section, or bottom CTA card. | Navigates to `/login` inside `AuthLayout`. |
| **AUTH-04** | `P0` | Guest visits `/home` directly → redirected to `/login` | Guest (`localStorage` cleared) | 1. Enter `http://localhost:5173/home` in the address bar. | `ProtectedRoute` immediately redirects to `/login` (`replace: true`) and preserves `state.from` (`/home`). |
| **AUTH-05** | `P0` | Guest visits `/dashboard` or protected feature routes → redirected to `/login` | Guest (`localStorage` cleared) | 1. Visit `/dashboard`, `/coach-dashboard`, `/workout-builder/all`, `/assignments/all`, or `/sessions`. | Each protected route redirects immediately to `/login` with `state.from` preserved. |
| **AUTH-06** | `P0` | Guest registers a new account → account created as Member only | Guest on `/register` | 1. Inspect `/register` form fields.<br>2. Fill `Full Name`, `Email Address`, `Password`, `Confirm Password` and submit. | Form contains NO role selector. Account is created as `member` only, success toast appears, and user is navigated to `/login`. |
| **AUTH-07** | `P0` | User signs in via `/login` → redirected to `/home` | Guest on `/login` with valid credentials | 1. Enter valid email and password.<br>2. Click `Sign In`. | Token is stored, Zustand & React Query `["current-user"]` cache are updated, and browser navigates to `/home` (or restored protected route if redirected from `ProtectedRoute`). |
| **AUTH-08** | `P0` | Authenticated user visits `/` → redirected to `/home` | Logged-in user (`member`, `trainer`, or `admin`) | 1. Navigate to `http://localhost:5173/`. | Automatically redirects to `/home` (`replace: true`). Does NOT show the public marketing landing page to logged-in users. |
| **AUTH-09** | `P0` | Authenticated user visits `/login` or `/register` → redirected to `/home` | Logged-in user | 1. Enter `/login` or `/register` in the address bar. | `AuthLayout` detects active authentication and redirects immediately to `/home`. |
| **AUTH-10** | `P0` | Authenticated user on `/home` sees NO guest CTAs | Logged-in user on `/home` | 1. Inspect the entire `/home` page (`HeroSection`, `PlatformOverview`, `FinalCTA`). | Zero guest CTAs (`Get Started`, `Sign In`, `Create Free Account`, `Start Free Trial`) appear anywhere on `/home`. User is greeted by name and role badge (`Coach Workspace`, `Member Workspace`, or `Admin Workspace`). |
| **AUTH-11** | `P0` | Authenticated user navigates from `/home` to `/dashboard` and feature pages | Logged-in user on `/home` | 1. Click primary Hero CTA (`Open Dashboard` / `Open Coach Dashboard`).<br>2. Return to `/home` and click module cards in `Workspace Quick Navigation`. | Primary CTA opens `/dashboard` (for Member/Admin) or `/coach-dashboard` (for Coach). Quick navigation cards open `/workout-builder/all`, `/workout-library/exercises`, `/assignments/all`, `/sessions`, `/members/all`, `/notifications`, and `/profile`. |
| **AUTH-12** | `P0` | Page refresh on `/home` preserves authenticated state and layout | Logged-in user on `/home` | 1. Press `F5` / browser reload on `/home`. | User remains on `/home` inside `AppLayout`, `useCurrentUser` resolves `/auth/me` and syncs Zustand, user greeting and role-aware workspace CTAs render without flashing guest CTAs. |
| **AUTH-13** | `P0` | User clicks Logout → token/store/cache cleared and redirected to `/` | Logged-in user on any protected route | 1. Click `Sign Out` in the Sidebar footer or Header profile dropdown. | `tokenService.removeToken()`, `useAuthStore.clearUser()`, and `queryClient.clear()` execute; user is redirected to `/` (the Public Landing Page)—NOT `/login`. |
| **AUTH-14** | `P0` | After logout, visiting `/home` or `/dashboard` redirects to `/login` | User has just logged out and is on `/` | 1. Attempt to navigate to `/home` or `/dashboard` (or press Browser Back). | `ProtectedRoute` blocks access and redirects to `/login`. No stale user data remains in memory. |

---

## C. Role-Based Functional Test Suites

### C.1 Guest User Suite
1. Verify `/` renders the Public Landing Page (`OverviewPage`) with `STREN` branding, gym visual, `Capabilities` (`#capabilities`), `Role Workflows` (`#workflows`), and `Get Started` / `Sign In` CTAs.
2. Verify `/login` and `/register` render inside `AuthLayout` with the desktop left brand panel and mobile top header (`Back to overview` → `/`).
3. Verify all protected routes (`/home`, `/dashboard`, `/coach-dashboard`, `/members/*`, `/workout-builder/*`, `/workout-library/*`, `/assignments/*`, `/sessions/*`, `/profile`, `/notifications`) redirect to `/login`.

### C.2 Member User Suite (`role: "member"`)
1. Sign in as a `member` → lands on `/home` (`STREN · Member Workspace`).
2. Verify Sidebar shows only Member-allowed navigation items:
   - `Workspace`: `Home` (`/home`), `Dashboard` (`/dashboard`)
   - `Training`: `Workout Library` (`/workout-library/workouts`, `/workout-library/exercises`), `Assignments` → `All Assignments` (`/assignments/all`), `Workout Sessions` (`/sessions`)
   - `Account`: `Profile` (`/profile`), `Notifications` (`/notifications`)
3. Verify Coach-only items (`Coach Dashboard`, `Members`, `Workout Builder`, `Create Assignment`, Header `Quick Actions`) are hidden for Members.
4. Verify `/assignments/all` calls `GET /assignments/me` without `403` errors and shows the member's assigned plans.
5. Verify `/sessions` and `/sessions/active` allow starting/resuming an active workout session, logging weight and reps per set, and finishing the workout.

### C.3 Coach User Suite (`role: "trainer"`)
1. Sign in as a `trainer` → lands on `/home` (`STREN · Coach Workspace`).
2. Verify primary Hero CTA on `/home` links to `/coach-dashboard` (`Open Coach Dashboard`) and secondary CTA links to `/assignments/all` (`Manage Assignments`).
3. Verify Sidebar and Header `Quick Actions` (`Assign Workout`, `Create Workout`, `View Members`) are visible.
4. Verify Coach can manage their assigned members (`/members/all`, `/members/:memberId`, `/members/:memberId/insights`, `/members/:memberId/measurements`), build workouts (`/workout-builder/new`), manage exercises (`/workout-library/exercises/new`), and create/edit assignments (`/assignments/new`).

### C.4 Admin User Suite (`role: "admin"`)
1. Sign in as an `admin` → lands on `/home` (`STREN · Admin Workspace`).
2. Verify Admin can access all Coach and Member routes, view all members across the platform, and manage shared exercises, workouts, and assignments.

---

## D. Module-by-Module Functional Workflows

### D.1 Public Landing Page (`/`)
- **Component:** `src/features/overview/pages/OverviewPage.tsx` (`OverviewHero`, `OverviewFeatures`, `OverviewCTA`)
- **Checks:**
  1. Top navigation bar displays `STREN` logo, `Capabilities` (`#capabilities`), `Role Workflows` (`#workflows`), `Sign In` (`/login`), and `Get Started` (`/register`).
  2. Hero displays `STREN · Athletic Training & Gym Platform` badge, headline `Train with Structure. Coach with Precision.`, dark-treated gym visual (`Generated image 1.png`), `Get Started` button, and `Sign In` button.
  3. `#capabilities` section displays 6 capability cards (`Workout Programming`, `Exercise Library`, `Training Assignments`, `Live Workout Sessions`, `Progress & Body Measurements`, `Activity & Notifications`).
  4. `#workflows` section displays side-by-side `Coach Experience` and `Member Experience` workflow cards.
  5. Bottom CTA card (`Start Training with STREN Today`) links to `/register` and `/login`.

### D.2 Authenticated Landing Page (`/home`)
- **Component:** `src/features/landing/pages/LandingPage.tsx` inside `AppLayout`
- **Checks:**
  1. Renders inside `AppLayout` (with collapsible `Sidebar` and `Header`).
  2. `HeroSection` greets the logged-in user by first name (`Welcome back, <Name>. Your training hub is ready.`), shows `Signed in as <Full Name>` pill, and displays role-specific primary/secondary CTAs.
  3. `PlatformOverview` (`Workspace Quick Navigation`) renders 8 clickable module cards linking directly to `/dashboard` (or `/coach-dashboard`), `/workout-builder/all` (or `/workout-library/workouts`), `/workout-library/exercises`, `/assignments/all`, `/sessions`, `/members/all`, `/notifications`, and `/profile`.
  4. `FinalCTA` displays authenticated links (`Go to Dashboard` / `Go to Coach Dashboard` and `Browse Exercise Library`).

### D.3 Login & Register (`/login`, `/register`)
- **Components:** `AuthLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`
- **Checks:**
  1. Empty form submission triggers inline Zod validation errors in `#EF4444`.
  2. Loading state disables submit button and displays spinner (`Signing In...` / `Creating Account...`).
  3. Invalid credentials display error toast via `sonner`.
  4. Clicking `STREN` logo or `Back to overview` returns to `/`.

### D.4 Member Dashboard (`/dashboard`) & Coach Dashboard (`/coach-dashboard`)
- **Components:** `DashboardPage.tsx`, `CoachDashboardPage.tsx`
- **Checks:**
  1. `/dashboard` renders KPI cards, active assignment summary, workout activity charts, and recent activity.
  2. `/coach-dashboard` renders coach KPI metrics, client progress overview, recent activity feed, and quick actions.

### D.5 Members Management, Member Profile, Insights & Body Measurements
- **Routes:** `/members/all`, `/members/:memberId`, `/members/:memberId/insights`, `/members/:memberId/measurements`
- **Checks:**
  1. Roster search and status filtering on `/members/all`.
  2. Member detail tabs/links navigate cleanly between Profile, Insights, and Body Measurements.
  3. Logging a new body measurement updates the measurement history and trend cards immediately.

### D.6 Exercises Library (`/workout-library/exercises`)
- **Routes:** `/workout-library/exercises`, `/workout-library/exercises/new`, `/workout-library/exercises/:exerciseId`, `/workout-library/exercises/:exerciseId/edit`
- **Checks:**
  1. Live search filters exercises by name, target muscle, or equipment on the current page.
  2. `ViewExerciseDialog` and `ExerciseDetailsPage` render muscle groups, equipment, difficulty badge, and instructions.
  3. Create, Edit, and Delete exercise flows work for Coach/Admin and invalidate the exercise list cache.

### D.7 Workouts & Workout Builder (`/workout-builder/all`)
- **Routes:** `/workout-builder/all`, `/workout-builder/new`, `/workout-builder/:workoutId`, `/workout-builder/:workoutId/edit`
- **Checks:**
  1. Category filter pills and search bar filter workouts cleanly.
  2. Workout Builder adds exercises from library, configures target sets/reps/rest/notes, reorders exercises, and saves routine.
  3. `WorkoutDetailsPage` shows full exercise sequence and links to `Edit Routine` (for Coach/Admin) or `Start Session` (`/sessions`).

### D.8 Assignments (`/assignments/all`)
- **Routes:** `/assignments/all`, `/assignments/new`, `/assignments/:assignmentId`, `/assignments/:assignmentId/edit`
- **Checks:**
  1. Coach/Admin can filter assignments by status/trainer, create assignments using `EntityCombobox`, view assignment details, and edit status/notes (including required `cancelReason` when status is set to `CANCELLED`).
  2. Member view loads `GET /assignments/me` and links to routine details and workout sessions.

### D.9 Workout Sessions & Live Session Execution (`/sessions`, `/sessions/active`, `/sessions/:sessionId`)
- **Components:** `WorkoutSessionsPage.tsx`, `ActiveWorkoutPage.tsx`, `WorkoutSessionPage.tsx`
- **Checks:**
  1. Starting or continuing a session opens `/sessions/active`.
  2. `ExerciseCard` and `SetRow` allow entering `kg` and `Reps` and completing sets with `#5BE584` active state feedback.
  3. Finishing a session opens `FinishWorkoutDialog`, saves session notes, and transitions the session to `COMPLETED`.
  4. Viewing a completed session at `/sessions/:sessionId` displays `SessionStatistics` and `ExerciseTimeline`.

### D.10 User Profile (`/profile`), Notifications (`/notifications`) & 404 (`*`)
- **Checks:**
  1. `/profile` displays user details and supports profile/password updates.
  2. Header notification bell dropdown and `/notifications` page support marking single or all notifications as read.
  3. Unknown URLs (e.g. `/unknown-page-123`) render `NotFoundPage` with navigation back to workspace/home.

---

## E. Responsive & Cross-Device Testing Matrix

Verify all pages across the following 7 viewport widths using browser DevTools responsive mode:

| Viewport | Breakpoint Class | Required Verification Checks |
| :--- | :--- | :--- |
| **`320px`** | Small Mobile | Zero horizontal overflow (`overflow-x-hidden`); Public Landing Page hero CTAs stack full-width (`w-full`); `SetRow` 12-column grid inputs remain usable; dialogs fit within viewport with `p-4`. |
| **`375px`** | Standard Mobile | Public navbar mobile menu toggle (`Menu` / `X`) opens/closes cleanly; `AppLayout` sidebar stays hidden off-canvas until Hamburger toggle is tapped; cards stack in 1 column. |
| **`430px`** | Large Mobile | Auth forms (`/login`, `/register`), mobile drawers, filter bars, and workout cards maintain balanced spacing and touch-friendly `40px`–`48px` button heights. |
| **`768px`** | Tablet (`md`) | Public navbar switches to inline desktop links (`hidden md:flex`); KPI and capability grids transition to 2 columns (`sm:grid-cols-2` / `md:grid-cols-2`); tables scroll horizontally inside their container. |
| **`1024px`** | Laptop (`lg`) | `AppLayout` sidebar switches to persistent desktop icon rail (`80px` collapsed / `264px` expanded); `AuthLayout` reveals left brand & gym visual panel (`lg:flex w-1/2`); Hero sections switch to 12-column split grid. |
| **`1280px`** | Desktop (`xl`) | Full `max-w-[1280px]` container alignment; 3-column and 4-column module grids render with consistent `16px`–`24px` gaps. |
| **`1440px+`** | Wide Desktop | Content remains centered with generous dark canvas framing and readable line lengths (`60ch`–`75ch`). |

---

## F. Security & Authorization Regression Tests (Phase 1 Baseline)

| Test ID | Priority | Security / Contract Control | Verification Method | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | `P0` | Public registration cannot set `admin` or `trainer` role | `POST /api/v1/auth/register` with `{"role": "admin"}` or `{"role": "trainer"}` | Rejected with `400 Bad Request` by `registerSchema`; `authService.register` enforces `ROLES.MEMBER`. |
| **SEC-02** | `P0` | Unauthenticated access to protected endpoints blocked | Request any protected `/api/v1/*` route without `Authorization` header | Rejected with `401 Unauthorized`. |
| **SEC-03** | `P0` | Unauthorized role access to user listing blocked | Request `GET /api/v1/users` with a `member` JWT | Rejected with `403 Forbidden` by `restrictTo(ROLES.ADMIN, ROLES.TRAINER)`. |
| **SEC-04** | `P0` | Inactive user accounts rejected | Authenticate with a token belonging to a user where `isActive === false` | `protect` middleware rejects request with `401/403` ("Your account has been deactivated"). |
| **SEC-05** | `P1` | Query parameter filter override & ReDoS blocked | Pass protected keys or regex metacharacters in query string | `ApiFeatures.filter` preserves `baseFilter` security scope; `escapeRegex` neutralizes regex metacharacters. |
| **SEC-06** | `P1` | Cross-coach & unassigned private workout access blocked | Trainer requests/updates/deletes another trainer's private workout; Member requests unassigned private workout | Rejected with `403 Forbidden` / `404` by `workoutService` ownership checks. |
| **SEC-07** | `P1` | Assignment cancellation requires `cancelReason` | `PATCH /api/v1/assignments/:id` with `{"status": "cancelled"}` and no `cancelReason` | Rejected with `400 Bad Request` by `updateAssignmentSchema`. |

---

## G. Test Execution Template

Use the table below during manual QA cycles to record execution results, evidence, and defect severity:

| Test ID | Priority (`P0`/`P1`/`P2`) | Preconditions | Steps | Expected result | Actual result | Pass / Fail / Blocked | Evidence / Screenshot | Severity if failed | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AUTH-01` | `P0` | Guest browser session | Visit `/` | Public Landing Page renders with STREN branding, gym visual, `Get Started`, and `Sign In` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-02` | `P0` | Guest on `/` | Click `Get Started` | Navigates to `/register` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-03` | `P0` | Guest on `/` | Click `Sign In` | Navigates to `/login` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-04` | `P0` | Guest browser session | Visit `/home` directly | Redirects to `/login` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-05` | `P0` | Guest browser session | Visit `/dashboard` | Redirects to `/login` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-06` | `P0` | Guest on `/register` | Submit registration form | Account created as `member` only; redirects to `/login` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-07` | `P0` | Guest on `/login` | Sign in with valid credentials | Redirects to `/home` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-08` | `P0` | Authenticated user | Visit `/` | Redirects to `/home` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-09` | `P0` | Authenticated user | Visit `/login` or `/register` | Redirects to `/home` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-10` | `P0` | Authenticated user on `/home` | Inspect Hero & CTA sections | Zero guest CTAs (`Get Started`, `Sign In`); shows user greeting & workspace CTAs | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-11` | `P0` | Authenticated user on `/home` | Click Dashboard & Quick Nav cards | Navigates to `/dashboard` (or `/coach-dashboard`) and feature modules | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-12` | `P0` | Authenticated user on `/home` | Refresh browser (`F5`) | Stays on `/home` inside `AppLayout` with authenticated CTAs | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-13` | `P0` | Authenticated user | Click `Sign Out` | Clears token, store, and query cache; redirects to `/` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
| `AUTH-14` | `P0` | Logged-out user on `/` | Visit `/home` or `/dashboard` | Redirects to `/login` | | `[ ] Pass / [ ] Fail / [ ] Blocked` | | | |
