# STREN — Tester Quick-Start Checklist

Welcome to STREN! This practical checklist walks first-time testers through the core **Coach** and **Member** workflows end-to-end so you can verify how both accounts interact in real time.

> **Security Note:** Use your own test accounts or register new ones at `/register`. Never share real passwords, API keys, or private environment variables in bug reports.

---

## 1. Recommended End-to-End Test Sequence

For the best testing experience, open **two browser windows** (for example, one normal window for the **Coach** account and one Incognito/Private window for the **Member** account).

### Phase A — Account Setup & Coach–Member Connection
- [ ] **Step 1 (Coach Window):** Register or sign in at `/login` and complete onboarding at `/onboarding` with the **Coach / Trainer** role (fill in your professional title, specialties, certifications, and coaching philosophy).
  - *Expected Outcome:* Redirects to `/coach-dashboard`.
- [ ] **Step 2 (Member Window):** Register or sign in at `/login` and complete onboarding at `/onboarding` with the **Member** role (select a fitness goal and experience level).
  - *Expected Outcome:* Redirects to `/dashboard`. The **Coach Connection** card shows `Independent`.
- [ ] **Step 3 (Coach Window):** Go to **Members** (`/members/all`), click **Invite Member**, enter the Member's email address, and send the invitation.
  - *Expected Outcome:* The invitation appears under **Pending Invitations** on `/members/all`.
- [ ] **Step 4 (Member Window):** Refresh or view `/dashboard`. Locate the **Needs Attention** card and click **Accept** on the coaching invitation.
  - *Expected Outcome:* Toast confirms acceptance. The **Coach Connection** card updates to `Active`.
- [ ] **Step 5 (Member Window):** On the **Coach Connection** card on `/dashboard`, click the **Profile** button next to your Coach's name.
  - *Expected Outcome:* A modal opens displaying the Coach's professional title, years of experience, specialties, certifications, and coaching philosophy.

---

### Phase B — Custom Exercises, Workout Templates & Split Assignments
- [ ] **Step 6 (Coach Window):** Go to **Exercise Library** (`/workout-library/exercises`), click **Create Exercise** (`/workout-library/exercises/new`), and create a custom exercise (e.g., *"Coach's Tempo Pause Squat"*).
  - *Expected Outcome:* Exercise is saved and visible in your library. (Before assignment, it is **not** visible to unconnected users or other coaches).
- [ ] **Step 7 (Coach Window):** Go to **Workout Builder** (`/workout-builder/new`) and create **two** workout templates (e.g., *"Day 1 — Upper Push"* including your custom exercise, and *"Day 2 — Lower Strength"*). Toggle **Save as Reusable Template** on.
  - *Expected Outcome:* Both templates appear in `/workout-builder/all`.
- [ ] **Step 8 (Coach Window):** Go to **Assignments** (`/assignments/new`) and assign **both** workout templates to your connected Member with active start/end dates.
  - *Expected Outcome:*
    - Member dropdown only lists Members connected to you.
    - Both assignments succeed and appear as `ROUTINE SPLIT (2)` on the Member's card in `/members/all` and as selectable split tabs on `/members/:memberId`.
- [ ] **Step 9 (Coach Window):** Edit one of the assigned workout templates at `/workout-builder/:workoutId/edit` (e.g., add an exercise or change sets) and save.
  - *Expected Outcome:* Template versioning preserves the Member's active assignment prescription without corrupting their ongoing routine, while creating a new template version (`v2`) for future assignments.

---

### Phase C — Member Active Workout, Conflict Handling & RPE Logging
- [ ] **Step 10 (Member Window):** Check `/dashboard`. Look at the **Next Workout** card.
  - *Expected Outcome:* You see the **Assigned Split** switcher tabs (`Day 1 — Upper Push` and `Day 2 — Lower Strength`). Clicking between tabs updates the displayed routine details.
- [ ] **Step 11 (Member Window):** Select `Day 1 — Upper Push` and click **Start Workout**.
  - *Expected Outcome:* Navigates to `/sessions/active`. The live timer starts, and the Coach's custom exercise is visible and playable.
- [ ] **Step 12 (Member Window):** Check the previous performance hint on each exercise card, then log weights and reps for your sets and click the checkmark on each set.
  - *Expected Outcome:*
    - First-time exercises show `No previous performance yet`. (On a second session of the same exercise, it will show **`Best previous set: X kg × Y reps`**).
    - Checking off a set starts the floating **Rest Timer**.
- [ ] **Step 13 (Member Window — Conflict Test):** Without finishing the session, navigate back to `/dashboard`, switch to `Day 2 — Lower Strength`, and click **Start Workout**.
  - *Expected Outcome:* The **Active Workout Conflict Dialog** opens instead of overwriting your active session. Click **Resume Active Session** to return safely to `/sessions/active`.
- [ ] **Step 14 (Member Window):** Click **Finish Workout** in the top bar. In the **Complete Session** modal, select a **Session Exertion (RPE 1–10)** score (e.g., `8`), enter a reflection note, and click **Complete & Save Session**.
  - *Expected Outcome:* Redirects to `/sessions/:sessionId/summary` showing total volume, duration, sets logged, and exercise breakdowns.

---

### Phase D — Coach Session Review & Real-Time Feedback Loop
- [ ] **Step 15 (Coach Window):** Go to `/members/all`, click **View Profile** on your Member (`/members/:memberId`), scroll to **Recent Sessions**, and open the completed session (`/sessions/:sessionId`).
  - *Expected Outcome:*
    - **Session Statistics** displays Duration, Volume, Exercises, Sets, and **`Exertion (RPE) 8 / 10`**.
    - **Coach Review & Feedback** card displays a text area for your review.
- [ ] **Step 16 (Coach Window):** Type encouraging feedback or next-session load targets into the **Coach Review & Feedback** card and click **Submit Coach Review**.
  - *Expected Outcome:* Toast confirms submission, and the card switches to the **`Reviewed`** state with your name and timestamp.
- [ ] **Step 17 (Member Window):** Observe the notification bell in the top header (or open `/notifications`) and click the new **Coach Feedback on Your Workout** notification.
  - *Expected Outcome:* Navigates directly to `/sessions/:sessionId`, where the **Coach Review & Feedback** card displays the Coach's review message.

---

## 2. Known Current Limitations (Not Bugs)

When testing, please note the following intentional boundaries in the current release:
1. **Mid-Session Exercise Swapping UI:** While database columns exist to track swapped exercises, the active workout screen (`/sessions/active`) does **not** currently expose a "Swap Exercise" button.
2. **Target Weight & Target RPE Inputs in Workout Builder UI:** Active workout cards (`/sessions/active`) display `Target Load` and `Target RPE` badges when present on a prescription, and the backend API supports them, but the frontend Workout Builder form (`/workout-builder/new`) currently only exposes inputs for **Sets**, **Reps**, **Rest (sec)**, and **Notes**.
3. **Gym Owner Portal:** Multi-coach gym administration and billing features are planned for a future phase and are not part of the Member or Coach portals.

---

## 3. Important Errors to Report

Please report any of the following issues if encountered during testing, along with the **route URL**, **account role (`MEMBER` or `TRAINER`)**, and **steps to reproduce**:

- **Authorization Leaks:**
  - A Coach seeing Members in `/members/all` or the `/assignments/new` dropdown who are **not** connected to that Coach.
  - A Coach seeing custom exercises created by another Coach.
  - A Coach seeing a Member's pre-relationship workout history when **History Sharing Consent** is `History Private` or `Consent Pending`.
  - A Member receiving a `403 Forbidden` error when clicking their own assignment notification (`/assignments/:assignmentId`) or session notification (`/sessions/:sessionId`).
- **Data Integrity Issues:**
  - Editing an already-assigned workout template alters or deletes exercises inside a Member's already-completed workout session log.
  - Starting a new workout silently overwrites an `IN_PROGRESS` session without showing the conflict dialog.
  - Progress bars on `/assignments/:assignmentId` or `/members/all` showing hardcoded numbers instead of reflecting actual completed sessions.
- **UI / Navigation Failures:**
  - Logging in or switching accounts redirects to a `404 Not Found` page instead of `/dashboard` (Member) or `/coach-dashboard` (Coach).
  - Real-time notifications failing to navigate to the relevant session or assignment when clicked.

---

## Related Guides

- [Member User Journey Guide](./member-journey.md)
- [Coach User Journey Guide](./coach-journey.md)
- [End-to-End Platform Workflow](./platform-workflow.md)
