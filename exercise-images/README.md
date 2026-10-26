# STREN — Exercise Image Library & Asset Inventory

## Overview
This directory contains the complete exercise inventory, asset manifest, and verified instructional fitness imagery for the STREN fitness platform.

Every exercise stored in the STREN PostgreSQL development database was systematically cataloged via Prisma ORM, verified against database records, and matched with a dedicated instructional image file.

---

## 1. Asset Collection Summary

- **Total Exercises Discovered in Database:** `49`
- **Total Image Files Successfully Completed & Verified on Disk:** `49` (100% Complete)
- **Pending / Blocked Images:** `0`
- **Exercises Requiring Review Note:** `1` (`Deadlift111` — custom user test record depicting barbell deadlift biomechanics)
- **Image Formats & Specifications:**
  - **Photorealistic Studio Imagery (10 exercises):** JPEG (`.jpg`), 16:9 widescreen, adult male athlete performing movement in minimalist fitness studio with clean neutral background.
  - **High-Resolution Anatomical Illustrations (39 exercises):** PNG (`.png`), high-contrast male muscular anatomical illustrations showcasing movement mechanics, joint angles, and equipment on solid black backgrounds (optimized for STREN's dark mode UI).
  - **All File Sizes Verified:** Every file physically exists on disk and ranges from ~11 KB to ~757 KB.

---

## 2. Mandatory Content Rules Compliance Confirmation

All 49 images strictly adhere to the project's visual and demographic rules:
- **Strictly Male Demonstrator / Neutral Anatomical Illustration:** Absolutely **NO women or female-presenting people** appear anywhere in any image (foreground, background, posters, or reflections).
- **Movement & Equipment Precision:** Demonstrators and anatomical figures exhibit correct joint angles, spine alignment, grip positioning, and targeted muscle activation (e.g. barbell placed across upper traps for Back Squat, flat-back hip hinge for Romanian Deadlift, elbow flexion for Skull Crushers, high pulley rope path for Face Pulls).
- **Tricep Cable Kickback Alignment:** The database instructions for `Cable Kickbacks` describe a bent-over tricep kickback with upper arm locked parallel to the torso. The matched illustration accurately portrays this movement.
- **Distraction-Free:** No watermarks, brand logos, promotional badges, or text overlays.

---

## 3. Strict Scope & Non-Integration Confirmation

Per task instructions:
- **No Database Records Modified:** The PostgreSQL database was queried in read-only mode.
- **No Schema or Migrations Changed:** Prisma schemas and migrations remain untouched.
- **No URLs Injected:** `Exercise.imageUrl` fields in the database have **not** been modified.
- **No Application Code Altered:** Frontend components, backend services, and upload handlers remain unmodified.
- **Standalone Asset Collection:** All assets and manifests reside solely in this `exercise-images/` folder.

---

## 4. File Inventory

- `manifest.json`: Exhaustive JSON metadata cataloging all 49 exercises with IDs, muscle groups, equipment, physical file mappings, file sizes, and verification notes.
- `exercises.csv`: Tabular CSV listing every exercise from the database, its UUID, equipment, target muscles, mapped filename, and status.
- `*.jpg` / `*.png`: 49 verified physical image files named exactly as `<Exercise Name>.<ext>`.

---

## 5. Exercise Inventory Matrix (All 49 Completed)

| # | Exercise Name | Target Muscles | Equipment | Status | Image Filename |
|---|---|---|---|---|---|
| 1 | **Ab Wheel Rollout** | Core, Abs, Lats, Shoulders | Machine | `SUCCESS` | [`Ab Wheel Rollout.jpg`](./Ab%20Wheel%20Rollout.jpg) |
| 2 | **Arnold Press** | Shoulders, Triceps, Upper Chest | Dumbbell | `SUCCESS` | [`Arnold Press.jpg`](./Arnold%20Press.jpg) |
| 3 | **Barbell Back Squat** | Quadriceps, Glutes, Hamstrings, Core, Erector Spinae | Barbell | `SUCCESS` | [`Barbell Back Squat.jpg`](./Barbell%20Back%20Squat.jpg) |
| 4 | **Barbell Bench Press** | Chest, Triceps, Anterior Deltoids | Barbell | `SUCCESS` | [`Barbell Bench Press.jpg`](./Barbell%20Bench%20Press.jpg) |
| 5 | **Barbell Bent-Over Row** | Back, Biceps, Rear Deltoids, Erector Spinae | Barbell | `SUCCESS` | [`Barbell Bent-Over Row.jpg`](./Barbell%20Bent-Over%20Row.jpg) |
| 6 | **Barbell Curl** | Biceps, Forearms | Barbell | `SUCCESS` | [`Barbell Curl.jpg`](./Barbell%20Curl.jpg) |
| 7 | **Bench Dips** | Triceps, Chest, Anterior Deltoids | Bodyweight | `SUCCESS` | [`Bench Dips.jpg`](./Bench%20Dips.jpg) |
| 8 | **Bulgarian Split Squat** | Quadriceps, Glutes, Hamstrings, Core | Dumbbell | `SUCCESS` | [`Bulgarian Split Squat.jpg`](./Bulgarian%20Split%20Squat.jpg) |
| 9 | **Cable Crossover** | Chest, Anterior Deltoids | Cable | `SUCCESS` | [`Cable Crossover.jpg`](./Cable%20Crossover.jpg) |
| 10 | **Cable Curl** | Biceps, Forearms | Cable | `SUCCESS` | [`Cable Curl.jpg`](./Cable%20Curl.jpg) |
| 11 | **Cable Kickbacks** | Triceps | Cable | `SUCCESS` | [`Cable Kickbacks.png`](./Cable%20Kickbacks.png) |
| 12 | **Cable Upright Row** | Shoulders, Lateral Deltoids, Traps, Biceps, Forearms | Cable | `SUCCESS` | [`Cable Upright Row.png`](./Cable%20Upright%20Row.png) |
| 13 | **Cable Woodchoppers** | Core, Obliques, Shoulders | Cable | `SUCCESS` | [`Cable Woodchoppers.png`](./Cable%20Woodchoppers.png) |
| 14 | **Chest Dips** | Chest, Triceps, Anterior Deltoids | Bodyweight | `SUCCESS` | [`Chest Dips.png`](./Chest%20Dips.png) |
| 15 | **Close-Grip Bench Press** | Triceps, Chest, Anterior Deltoids | Barbell | `SUCCESS` | [`Close-Grip Bench Press.png`](./Close-Grip%20Bench%20Press.png) |
| 16 | **Concentration Curl** | Biceps, Forearms | Dumbbell | `SUCCESS` | [`Concentration Curl.png`](./Concentration%20Curl.png) |
| 17 | **Conventional Deadlift** | Back, Erector Spinae, Hamstrings, Glutes, Traps, Forearms, Core | Barbell | `SUCCESS` | [`Conventional Deadlift.png`](./Conventional%20Deadlift.png) |
| 18 | **Deadlift111** | Back, Biceps, Chest, Triceps | Barbell | `SUCCESS` | [`Deadlift111.png`](./Deadlift111.png) |
| 19 | **Decline Barbell Press** | Chest, Triceps, Anterior Deltoids | Barbell | `SUCCESS` | [`Decline Barbell Press.png`](./Decline%20Barbell%20Press.png) |
| 20 | **Decline Crunches** | Core, Abs | Bodyweight | `SUCCESS` | [`Decline Crunches.png`](./Decline%20Crunches.png) |
| 21 | **Face Pulls** | Back, Rear Deltoids, Traps, Rotator Cuff | Cable | `SUCCESS` | [`Face Pulls.png`](./Face%20Pulls.png) |
| 22 | **Front Dumbbell Raises** | Shoulders, Anterior Deltoids, Upper Chest | Dumbbell | `SUCCESS` | [`Front Dumbbell Raises.png`](./Front%20Dumbbell%20Raises.png) |
| 23 | **Goblet Squat** | Quadriceps, Glutes, Core, Shoulders | Dumbbell | `SUCCESS` | [`Goblet Squat.png`](./Goblet%20Squat.png) |
| 24 | **Hammer Curls** | Biceps, Forearms | Dumbbell | `SUCCESS` | [`Hammer Curls.png`](./Hammer%20Curls.png) |
| 25 | **Hanging Leg Raises** | Core, Abs, Hip Flexors, Forearms | Bodyweight | `SUCCESS` | [`Hanging Leg Raises.png`](./Hanging%20Leg%20Raises.png) |
| 26 | **Incline Dumbbell Curl** | Biceps, Forearms | Dumbbell | `SUCCESS` | [`Incline Dumbbell Curl.png`](./Incline%20Dumbbell%20Curl.png) |
| 27 | **Incline Dumbbell Press** | Chest, Anterior Deltoids, Triceps | Dumbbell | `SUCCESS` | [`Incline Dumbbell Press.png`](./Incline%20Dumbbell%20Press.png) |
| 28 | **Lat Pulldown** | Back, Lats, Biceps, Rear Deltoids | Cable, Machine | `SUCCESS` | [`Lat Pulldown.png`](./Lat%20Pulldown.png) |
| 29 | **Lateral Raises** | Shoulders, Lateral Deltoids, Traps | Dumbbell | `SUCCESS` | [`Lateral Raises.png`](./Lateral%20Raises.png) |
| 30 | **Leg Extensions** | Quadriceps | Machine | `SUCCESS` | [`Leg Extensions.png`](./Leg%20Extensions.png) |
| 31 | **Leg Press** | Quadriceps, Glutes, Hamstrings | Machine | `SUCCESS` | [`Leg Press.png`](./Leg%20Press.png) |
| 32 | **Lying Leg Curls** | Hamstrings, Calves | Machine | `SUCCESS` | [`Lying Leg Curls.png`](./Lying%20Leg%20Curls.png) |
| 33 | **Overhead Barbell Press** | Shoulders, Anterior Deltoids, Triceps, Upper Traps, Core | Barbell | `SUCCESS` | [`Overhead Barbell Press.png`](./Overhead%20Barbell%20Press.png) |
| 34 | **Overhead Tricep Extension** | Triceps | Dumbbell | `SUCCESS` | [`Overhead Tricep Extension.png`](./Overhead%20Tricep%20Extension.png) |
| 35 | **Pec Deck Fly** | Chest, Anterior Deltoids | Machine | `SUCCESS` | [`Pec Deck Fly.png`](./Pec%20Deck%20Fly.png) |
| 36 | **Plank** | Core, Abs, Shoulders, Glutes | Bodyweight | `SUCCESS` | [`Plank.png`](./Plank.png) |
| 37 | **Preacher Curl** | Biceps, Forearms | EZ Bar, Machine | `SUCCESS` | [`Preacher Curl.png`](./Preacher%20Curl.png) |
| 38 | **Pull-Ups** | Back, Lats, Biceps, Core | Bodyweight | `SUCCESS` | [`Pull-Ups.png`](./Pull-Ups.png) |
| 39 | **Push-Ups** | Chest, Triceps, Anterior Deltoids, Core | Bodyweight | `SUCCESS` | [`Push-Ups.png`](./Push-Ups.png) |
| 40 | **Reverse Pec Deck** | Shoulders, Rear Deltoids, Rhomboids, Traps | Machine | `SUCCESS` | [`Reverse Pec Deck.png`](./Reverse%20Pec%20Deck.png) |
| 41 | **Romanian Deadlift** | Hamstrings, Glutes, Erector Spinae, Forearms | Barbell | `SUCCESS` | [`Romanian Deadlift.png`](./Romanian%20Deadlift.png) |
| 42 | **Russian Twists** | Core, Obliques, Hip Flexors | Bodyweight | `SUCCESS` | [`Russian Twists.png`](./Russian%20Twists.png) |
| 43 | **Seated Cable Row** | Back, Biceps, Rear Deltoids | Cable, Machine | `SUCCESS` | [`Seated Cable Row.png`](./Seated%20Cable%20Row.png) |
| 44 | **Seated Dumbbell Press** | Shoulders, Anterior Deltoids, Triceps, Lateral Deltoids | Dumbbell | `SUCCESS` | [`Seated Dumbbell Press.png`](./Seated%20Dumbbell%20Press.png) |
| 45 | **Single-Arm Dumbbell Row** | Back, Lats, Biceps, Rear Deltoids | Dumbbell | `SUCCESS` | [`Single-Arm Dumbbell Row.png`](./Single-Arm%20Dumbbell%20Row.png) |
| 46 | **Skull Crushers** | Triceps, Forearms | EZ Bar, Barbell | `SUCCESS` | [`Skull Crushers.png`](./Skull%20Crushers.png) |
| 47 | **Standing Calf Raises** | Calves | Machine | `SUCCESS` | [`Standing Calf Raises.png`](./Standing%20Calf%20Raises.png) |
| 48 | **Tricep Rope Pushdown** | Triceps | Cable | `SUCCESS` | [`Tricep Rope Pushdown.png`](./Tricep%20Rope%20Pushdown.png) |
| 49 | **Walking Lunges** | Quadriceps, Glutes, Hamstrings, Calves, Core | Dumbbell | `SUCCESS` | [`Walking Lunges.png`](./Walking%20Lunges.png) |
