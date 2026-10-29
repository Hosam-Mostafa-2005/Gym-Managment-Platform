# STREN — Localization Architecture & Translation Conventions

This document defines the architecture, conventions, and guidelines for the incremental Arabic and English localization of the STREN Gym Management Platform.

---

## 1. Architectural Overview

STREN uses **`i18next`** and **`react-i18next`** for client-side localization in React 19 + TypeScript + Vite.

### Core Files
- **Configuration & Core Module:** `frontend/src/i18n/index.ts`
- **TypeScript Types & Declarations:** `frontend/src/i18n/types.ts`
- **Language Switcher Component:** `frontend/src/components/shared/LanguageSwitcher/LanguageSwitcher.tsx`
- **Translation Namespaces:**
  - `frontend/src/i18n/locales/en/common.json` (English)
  - `frontend/src/i18n/locales/ar/common.json` (Arabic)

### Key Architectural Decisions
1. **Centralized Direction & Language Management:**
   Whenever the language changes:
   - `document.documentElement.lang` updates to `"en"` or `"ar"`.
   - `document.documentElement.dir` updates to `"ltr"` (for English) or `"rtl"` (for Arabic).
   - This occurs synchronously via a centralized event listener in `src/i18n/index.ts`.
2. **Client-side Persistence:**
   The selected language is persisted in `localStorage` under the key `stren_language`. If no preference exists, English (`en`) is the default.
3. **No Unnecessary Full Page Reloads:**
   Language switching updates the React context seamlessly without `window.location.reload()`.
4. **Isolated & Phased Rollout:**
   Existing pages and shared components are not modified in bulk. Translation proceeds strictly page-by-page in controlled phases.

---

## 2. Terminology Guidelines (Egyptian Fitness & Platform Context)

The translation tone must be:
- **Natural, modern, everyday Egyptian Arabic** easily understood by gym members and coaches.
- **Clear, concise English** suitable for athletic and performance tracking.
- **Short labels** that fit button surfaces, modal dialogs, and mobile drawers without truncating.
- **Meaning-based translation** rather than stiff literal translation.

### Standard Platform Terminology

| English Concept | Approved Arabic Label | Context / Notes |
| :--- | :--- | :--- |
| **Start Workout** | ابدأ التمرين | Direct call to action on buttons |
| **My Workouts** | تماريني | Member's personal routines |
| **Workout History** | سجل التمارين | Past sessions list |
| **Assignments** | التكليفات التدريبية | Coach-assigned programs |
| **Training Program** | البرنامج التدريبي | 4-week or monthly programs |
| **Save Changes** | حفظ التغييرات | Form submission buttons |
| **Cancel** | إلغاء | Modal dismiss / action cancel |
| **Loading...** | جارٍ التحميل... | Asynchronous loading states |
| **Try Again** | حاول مرة أخرى | Error retry action |
| **Exercises** | التمارين | Exercise library |
| **Sets** | مجموعات | Workout set count |
| **Reps** | تكرارات | Repetitions |
| **Weight** | الوزن | Resistance / load |
| **Rest** | راحة | Rest intervals |
| **Coach** | كابتن / المدرب | Used for trainers / coaches |
| **Member** | المتدرب / المشترك | Gym member |
| **Active Session** | تمرين قيد التنفيذ | In-progress live workout |
| **Drop Set** | دروب سيت | Retain standard gym terminology |
| **Rest-Pause** | رست بوز | Retain standard gym terminology |

---

## 3. Translation Key Conventions

1. **Namespace Structure:**
   - Keep common, global actions and platform labels in `common.json`.
   - In subsequent phases, feature-specific keys should be organized under feature namespaces or clear key prefixes (e.g. `workouts.*`, `sessions.*`, `auth.*`).
2. **Key Casing:**
   - Use `camelCase` for keys (e.g., `startWorkout`, `saveChanges`, `lastCompletedDate`).
   - Group related keys into logical nested objects:
     ```json
     {
       "actions": {
         "save": "Save Changes",
         "cancel": "Cancel"
       },
       "errors": {
         "notFound": "Workout not found.",
         "networkError": "Unable to connect. Try again."
       }
     }
     ```
3. **Symmetry Guarantee:**
   - Every key in `locales/en/*.json` **must** have an exact matching key in `locales/ar/*.json`.
   - Never add a key to English without immediately adding the corresponding Arabic translation.

---

## 4. How to Use `useTranslation` in Components

### Basic Text Translation
```tsx
import { useTranslation } from "react-i18next";

export function StartWorkoutButton() {
  const { t } = useTranslation();

  return (
    <button type="button">
      {t("actions.startWorkout", "Start Workout")}
    </button>
  );
}
```
*Note: Always provide a sensible fallback English string as the second parameter.*

### Interpolation (Dynamic Variables)
In `locales/en/common.json`:
```json
{
  "welcomeUser": "Welcome back, {{name}}!"
}
```
In `locales/ar/common.json`:
```json
{
  "welcomeUser": "أهلاً بك مجدداً، {{name}}!"
}
```
In component:
```tsx
const message = t("welcomeUser", { name: user.name });
```

### Pluralization
In `locales/en/common.json`:
```json
{
  "exerciseCount_one": "{{count}} Exercise",
  "exerciseCount_other": "{{count}} Exercises"
}
```
In `locales/ar/common.json`:
```json
{
  "exerciseCount_zero": "لا توجد تمارين",
  "exerciseCount_one": "تمرين واحد",
  "exerciseCount_two": "تمرينان",
  "exerciseCount_few": "{{count}} تمارين",
  "exerciseCount_many": "{{count}} تمريناً",
  "exerciseCount_other": "{{count}} تمرين"
}
```
In component:
```tsx
t("exerciseCount", { count: exercises.length });
```

---

## 5. RTL & Layout Safety Guidelines

1. **Use CSS Logical Properties:**
   - Replace physical directional utilities with logical utilities when migrating pages:
     - `ml-*` / `mr-*` $\to$ `ms-*` (margin-inline-start) / `me-*` (margin-inline-end)
     - `pl-*` / `pr-*` $\to$ `ps-*` (padding-inline-start) / `pe-*` (padding-inline-end)
     - `left-*` / `right-*` $\to$ `start-*` / `end-*`
     - `text-left` / `text-right` $\to$ `text-start` / `text-end`
2. **Do Not Invert Media or Unidirectional Icons:**
   - Play buttons, brand icons, and progress graphs should **not** be flipped.
   - Only directional indicators (e.g. `ChevronRight`, `ArrowRight` representing back/forward navigation) should flip using `rtl:rotate-180` where appropriate.
3. **Preserve Global Shell Stability:**
   - Do not alter the outer layout widths, viewport wrappers, or sidebar flex rails.
   - The desktop sidebar remains on the start side (`left` in LTR, `right` in RTL).

---

## 6. Page Migration Checklist (For Future Phases)

Before marking a page's translation as complete in future phases:
- [ ] All user-facing strings are extracted into translation resources.
- [ ] English and Arabic resource files have identical key hierarchies.
- [ ] Page layout has been inspected in both English (LTR) and Arabic (RTL).
- [ ] Text direction updates cleanly without horizontal overflow or clipped text.
- [ ] Button labels fit cleanly on small mobile viewports (375px+).
- [ ] Frontend typechecks (`npx tsc -b`) pass with 0 errors.
- [ ] Production build (`npm run build`) succeeds.
