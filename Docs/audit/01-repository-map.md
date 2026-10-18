# 01 — Repository Map & Technology Inventory

**Verification Status:** `VERIFIED` (100% of non-generated source directories and manifests inspected)

---

## 1. Root Directory Structure

The repository root (`C:\Hosam\Apps\React Projects\GYM\GYM Managment Platform`) contains the following top-level directories and files:

```text
GYM Managment Platform/
├── .agents/                               # Agent workspace metadata
├── .git/                                  # Git repository metadata
├── .gitignore                             # Root gitignore
├── Generated image 1.png                  # Root copy of auth hero image (1.49 MB)
├── backend/                               # Express 5 + Mongoose 9 + TypeScript API server
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts                         # Express app & middleware pipeline
│       ├── server.ts                      # HTTP server, DB connection & Socket.IO bootstrap
│       ├── config/                        # Database (db.ts), env (env.ts), Swagger (swagger.ts)
│       ├── constants/                     # Roles, permissions, enums (10 files)
│       ├── controllers/                   # Route handlers (18 files: 16 active, 2 empty stubs)
│       ├── mappers/                       # DTO response transformers (13 files)
│       ├── middleware/                    # Auth, RBAC, Zod validation, error handlers (6 files)
│       ├── models/                        # Mongoose schemas & models (8 files / 9 schemas)
│       ├── routes/                        # Express routers (18 files: 1 index, 15 active, 2 empty)
│       ├── scripts/                       # Database seed script (seed.ts) & synthetic data (10 files)
│       ├── services/                      # Business logic & DB queries (15 files)
│       ├── socket/                        # Socket.IO initialization (index.ts + 2 empty files)
│       ├── types/                         # TypeScript interfaces & Express augmentations (18 files)
│       ├── utils/                         # ApiFeatures, AppError, catchAsync, JWT helpers (8 files)
│       └── validators/                    # Zod request schemas (9 files)
├── frontend/                              # React 19 + Vite 8 + Tailwind CSS v4 SPA
│   ├── components.json                    # shadcn/ui (base-nova / @base-ui/react) config
│   ├── eslint.config.js                   # ESLint configuration
│   ├── index.html                         # Vite HTML entry point
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json                      # Root TS references
│   ├── tsconfig.app.json                  # App TS config (includes only "src")
│   ├── tsconfig.node.json                 # Node/Vite TS config
│   ├── vite.config.ts                     # Vite config (Tailwind v4 + tsconfigPaths)
│   ├── coach/                             # STRAY DIRECTORY outside src/ (18 empty 0-byte .tsx files)
│   ├── hooks/                             # STRAY DIRECTORY outside src/ (1 empty 0-byte .ts file)
│   ├── public/                            # Static assets (favicon.svg, icons.svg, images/gym-login-hero.png)
│   └── src/
│       ├── main.tsx                       # React DOM root, QueryClientProvider, Sonner Toaster
│       ├── App.tsx                        # Renders <AppRouter />
│       ├── index.css                      # Tailwind v4 @import & custom @theme tokens
│       ├── assets/                        # Bundled assets (Generated image 1.png)
│       ├── components/                    # Shared form wrappers, layouts, Header, Sidebar, UI primitives
│       ├── constants/                     # API base URL, roles, and unused route/nav constants
│       ├── features/                      # 17 feature modules (auth, dashboards, workouts, etc.)
│       ├── lib/                           # Axios client + interceptors, React Query client, cn()
│       ├── routes/                        # AppRouter.tsx & ProtectedRoute.tsx
│       ├── services/                      # token.service.ts & empty storage.service.ts
│       ├── store/                         # Zustand stores (auth.store.ts, empty theme.store.ts)
│       ├── styles/                        # Duplicate unimported theme.css
│       ├── types/                         # Unused auth.types.ts & 3 empty 0-byte type files
│       └── utils/                         # 3 empty 0-byte utility files
├── Deleted files but maybe we need it/    # Archived V1 WorkoutLog implementation (4 files)
│   ├── WorkoutLog.model.ts
│   ├── workout-log.controller.ts
│   ├── workout-log.routes.ts
│   └── workout-log.service.ts
├── Business Side/                         # Product discovery, market research & UVP .docx files (20 files)
├── Docs/                                  # Historical specs, design notes (.docx) & audit output (docs/audit/)
└── Prototype/                             # Stitch HTML/CSS UI prototypes & screenshots
```

---

## 2. Technology Stack Summary

### 2.1 Backend Stack (`backend/package.json`)

| Category | Package | Version | Usage in Repository |
| :--- | :--- | :--- | :--- |
| **Runtime & Language** | Node.js (ESM `"type": "module"`) + TypeScript | `^6.0.3` | Compiled with `NodeNext` module resolution (`tsconfig.json:4-5`); dev server uses `tsx watch src/server.ts`. |
| **Web Framework** | `express` | `^5.2.1` | Express v5 HTTP server (`src/app.ts`). |
| **Database & ODM** | `mongoose` | `^9.7.3` | MongoDB object modeling, aggregations, and virtuals (`src/models/*`). |
| **Authentication** | `jsonwebtoken`, `bcrypt`, `cookie-parser` | `^9.0.3`, `^6.0.0`, `^1.4.7` | JWT signing/verification (`utils/generateToken.ts`, `middleware/auth.middleware.ts`) and password hashing (`models/User.model.ts:106-117`). |
| **Validation** | `zod` | `^4.4.3` | Request schema validation via `middleware/validate.middleware.ts` and `validators/*.ts`. |
| **Real-Time** | `socket.io` | `^4.8.3` | WebSocket server attached to `httpServer` (`socket/index.ts`), emitting `"notification"` events (`services/notification.service.ts:22`). |
| **API Documentation** | `swagger-jsdoc`, `swagger-ui-express` | `^6.3.0`, `^5.0.1` | Serves Swagger UI at `/api-docs` (`app.ts:42`, `config/swagger.ts`). |
| **CORS** | `cors` | `^2.8.6` | Configured in `app.ts:21-36` for `localhost:5173` and `*.vercel.app`. |

### 2.2 Frontend Stack (`frontend/package.json`)

| Category | Package | Version | Usage in Repository |
| :--- | :--- | :--- | :--- |
| **Framework & Build** | `react`, `react-dom`, `vite` | `^19.2.7`, `^8.1.0` | React 19 SPA bundled by Vite 8 with `vite-tsconfig-paths`. |
| **Routing** | `react-router-dom` | `^7.18.0` | Data router (`createBrowserRouter`, `RouterProvider`) in `src/routes/AppRouter.tsx`. |
| **Server State** | `@tanstack/react-query` | `^5.101.2` | Primary data-fetching, caching, and mutation layer across all features (`src/lib/query-client.ts`). |
| **HTTP Client** | `axios` | `^1.18.1` | Configured in `src/lib/axios.ts` with Bearer token injection and 401 redirect interceptor. |
| **Client State** | `zustand` | `^5.0.14` | Defined in `src/store/auth.store.ts` (written on login, never read anywhere) and `src/store/theme.store.ts` (0-byte empty file). |
| **Forms & Validation** | `react-hook-form`, `@hookform/resolvers`, `zod` | `^7.81.0`, `^5.4.0`, `^4.4.3` | Used in Auth, Exercises, Workouts, and Assignments forms (`src/components/form/*`). |
| **Styling & Primitives** | `tailwindcss`, `@tailwindcss/vite`, `@base-ui/react` | `^4.3.1`, `^1.6.0` | Tailwind CSS v4 with `@base-ui/react` headless primitives (`src/components/ui/*`) and `cmdk` (`^1.1.1`). |
| **Data Visualization** | `recharts` | `^3.10.1` | Used in `coach-dashboard`, `dashboard` (member), `member-insights`, and `profile` (coach). |
| **Icons & Toasts** | `lucide-react`, `react-icons`, `sonner` | `^1.23.0`, `^5.7.0`, `^2.0.7` | Iconography and toast notifications (`main.tsx:16`). |

---

## 3. Application Entry Points

### 3.1 Backend Entry Flow
1. **`backend/src/server.ts` (Lines 1–26):**
   - Loads environment variables via `dotenv.config()`.
   - Calls `await connectDB()` (`backend/src/config/db.ts:3-13`), connecting to `process.env.MONGO_URI`.
   - Wraps Express `app` in Node's `http.createServer(app)`.
   - Initializes Socket.IO on the HTTP server via `initSocket(httpServer)` (`backend/src/socket/index.ts:11-50`).
   - Listens on `process.env.PORT || 5000`.
2. **`backend/src/app.ts` (Lines 1–58):**
   - Registers `express.json()`, `cookieParser()`, and `cors(...)`.
   - Mounts all API v1 routers at `/api/v1` via `backend/src/routes/index.ts`.
   - Mounts Swagger UI at `/api-docs` and health check at `GET /`.
   - Registers `notFound` (`404`) and `globalErrorHandler` (`backend/src/middleware/error.middleware.ts`).

### 3.2 Frontend Entry Flow
1. **`frontend/index.html` → `frontend/src/main.tsx` (Lines 1–23):**
   - Loads `@fontsource/inter/index.css` and `./index.css`.
   - Wraps `<App />` in `<QueryClientProvider client={queryClient}>`, alongside `<Toaster />` (`sonner`) and `<ReactQueryDevtools />`.
2. **`frontend/src/App.tsx` (Lines 1–8) → `frontend/src/routes/AppRouter.tsx` (Lines 1–275):**
   - Defines public routes (`/`, `/login`, `/register`), protected routes wrapped in `<ProtectedRoute />` and `<AppLayout />`, and a wildcard `*` route (`<NotFoundPage />`).

---

## 4. Stray, Orphaned, and Empty (0-Byte) Files Inventory

A significant number of empty placeholder files, duplicate modules, and archived files exist in the repository. These must be accounted for to avoid confusion during development:

### 4.1 Backend Empty (0-Byte) & Orphaned Files (`VERIFIED`)

| File Path | Status | Details |
| :--- | :--- | :--- |
| `backend/src/controllers/member.controller.ts` | **0-byte empty file** | Replaced by `member-profile`, `member-insights`, and `members-management` controllers. |
| `backend/src/controllers/trainer.controller.ts` | **0-byte empty file** | Replaced by `coach-dashboard` and `coach-profile` controllers. |
| `backend/src/routes/member.routes.ts` | **Empty router (6 lines)** | Mounted at `/api/v1/members` (`routes/index.ts:28`) with 0 endpoints. |
| `backend/src/routes/trainer.routes.ts` | **Empty router (6 lines)** | Mounted at `/api/v1/trainers` (`routes/index.ts:27`) with 0 endpoints. |
| `backend/src/socket/socket.ts` | **0-byte empty file** | Unused; Socket.IO logic is in `backend/src/socket/index.ts`. |
| `backend/src/socket/socketEvents.ts` | **0-byte empty file** | Unused; event name `"notification"` is hardcoded in `notification.service.ts:24`. |
| `backend/src/utils/formatZodErrors.ts` | **0-byte empty file** | Unused; Zod error formatting is inline in `error.middleware.ts:15-23`. |
| `backend/src/utils/logger.ts` | **0-byte empty file** | Unused; codebase uses `console.log` / `console.error`. |
| `backend/src/middleware/workoutOwnership.middleware.ts` | **Orphaned middleware** | Defines `ownsWorkout`, but is never imported in `workout.routes.ts` or anywhere else. |
| `backend/src/mappers/workout-log.mapper.ts` | **Orphaned V1 file** | Left over from deleted `WorkoutLog` module; never imported in `backend/src/`. |
| `backend/src/validators/workout-log.validator.ts` | **Orphaned V1 file** | Left over from deleted `WorkoutLog` module; only imported by `Deleted files.../workout-log.routes.ts`. |
| `backend/src/types/workout-log.types.ts` | **Orphaned V1 file** | Left over from deleted `WorkoutLog` module. |
| `backend/src/scripts/data/workoutLogs.ts` | **Orphaned V1 seed data** | Never imported by `backend/src/scripts/seed.ts`. |
| `Deleted files but maybe we need it/*` | **Archived V1 module** | Contains `WorkoutLog.model.ts`, `workout-log.controller.ts`, `workout-log.routes.ts`, `workout-log.service.ts`. Superseded by `WorkoutExerciseLog` + `WorkoutSetLog`. |

### 4.2 Frontend Empty (0-Byte), Stray & Dead Files (`VERIFIED`)

| File Path | Status | Details |
| :--- | :--- | :--- |
| `frontend/coach/**/*` (18 `.tsx` files) | **All 0-byte empty files** | Located **outside** `frontend/src/`! Abandoned scaffold; real coach dashboard is in `frontend/src/features/coach-dashboard/`. |
| `frontend/hooks/use-dashboard.ts` | **0-byte empty file** | Located **outside** `frontend/src/`. Real hook is in `frontend/src/features/dashboard/hooks/use-dashboard.ts`. |
| `frontend/src/store/theme.store.ts` | **0-byte empty file** | Theme switching is not implemented. |
| `frontend/src/services/storage.service.ts` | **0-byte empty file** | Unused placeholder. |
| `frontend/src/types/api.ts`, `common.ts`, `pagination.ts` | **All 0-byte empty files** | Unused placeholders. |
| `frontend/src/utils/calculateDuration.ts`, `formatDate.ts`, `formatTime.ts` | **All 0-byte empty files** | Unused placeholders. |
| `frontend/src/styles/theme.css` | **Dead duplicate CSS** | Duplicate of `src/index.css`; never imported anywhere. |
| `frontend/src/lib/cn.ts` | **Dead duplicate util** | Duplicate of `src/lib/utils.ts`; never imported anywhere. |
| `frontend/src/constants/routes.ts` & `navigation.ts` | **Dead constants** | Never imported anywhere (`AppRouter.tsx` and `Sidebar.tsx` hardcode paths). |
| `frontend/src/components/shared/layouts/AuthLayout.tsx` | **Dead layout** | Never imported (`AppRouter.tsx:7` imports `features/auth/components/layouts/AuthLayout.tsx`). |
| `frontend/src/features/home/**/*` (12 files) | **Dead feature module** | `HomePage.tsx` and 8 child components are never mounted in `AppRouter.tsx`; `home.api.ts` and `useHomeData.ts` are 0-byte files. |
| `frontend/src/features/landing/components/{footer/LandingFooter,navigation/LandingMobileMenu,navigation/LandingNavbar}.tsx` | **All 0-byte empty files** | Empty files inside `features/landing/`. |
| `frontend/src/features/coach-dashboard/components/states/{DashboardEmpty,DashboardSkeleton}.tsx` | **All 0-byte empty files** | Empty files inside `features/coach-dashboard/`. |
| `frontend/src/features/workout-sessions/components/{ExerciseProgress,SessionCard,SessionStatusBadge,WorkoutTimer}.tsx` & `utils/session.utils.ts` | **All 5 are 0-byte empty files** | Empty placeholders inside `features/workout-sessions/`. |
| `frontend/src/features/exercises/components/ExerciseCard.tsx` | **0-byte empty file** | Unused placeholder. |
| `frontend/src/features/workouts/components/ArchiveWorkoutDialog.tsx` | **0-byte empty file** | Unused placeholder. |
| `frontend/src/features/assignments/utils/assignmentStatus.ts` | **0-byte empty file** | Unused placeholder. |
| `frontend/src/features/assignments/components/{ArchiveAssignmentDialog,AssignmentCard,DeleteAssignmentDialog}.tsx` | **Stub `<div></div>` files** | 6-line stubs, never imported. |
| `frontend/src/features/assignments/pages/DeleteAssignmentPage.tsx` | **Unmounted page (219 lines)** | Complete delete page, never routed in `AppRouter.tsx`. |
| `frontend/src/features/exercises/pages/{ExerciseDetailsPage,EditExercisePage}.tsx` | **Mounted `<div></div>` stubs** | Routed in `AppRouter.tsx:194,198`, but render empty `<div></div>`! |
| `frontend/src/features/auth/pages/NotFoundPage.tsx` | **Mounted `<div></div>` stub** | Routed at `*` in `AppRouter.tsx:268`, but renders empty `<div></div>`! |
