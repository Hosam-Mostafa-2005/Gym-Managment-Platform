# STREN — Exercise Image Standardization & Refresh Asset Package

**NEW EXERCISE IMAGES — NOT YET UPLOADED TO CLOUDINARY**

> [!IMPORTANT]
> **Handoff Notice:**
> The files in this package are newly prepared, standardized exercise image assets saved locally on disk.
> **They have not been uploaded to Cloudinary, and no database records or application URLs have been modified.**
>
> **Next Steps Workflow:**
> 1. You will manually upload these prepared `.webp` image assets to your Cloudinary media library under the folder `stren/exercises/` (or your configured root folder).
> 2. Ensure each asset retains its intended public ID matching `stren/exercises/exercise-{slug}-v2`.
> 3. Once uploaded, trigger a separate implementation step to update the database records with the resulting Cloudinary HTTPS URLs.

---

## 1. Visual Target Standard (Reference B Alignment)

Every image prepared in this package strictly adheres to the visual standard established by **Reference B (Realistic Barbell Curl in Gym)**:

- **Medium:** Professional, realistic sports and fitness catalog photography.
- **Subject:** A single, athletic demonstrator performing the exact exercise biomechanics represented by the database record.
- **Environment:** Clean, modern commercial or private gym training environment with subtle background depth-of-field.
- **Equipment & Form:** Clear visibility of the athlete and the specific equipment (barbell, dumbbells, cable column, bench, pull-up rig, etc.) with accurate joint angles and movement execution.
- **Framing & Aspect Ratio:** Centered 4:3 landscape framing (`1200x900 px`), optimized for STREN exercise cards, workout session logs, and mobile viewports.
- **Strictly Excluded:** No line-art illustrations (Reference A), 3D digital renders, cartoons, watermarks, brand logos, or text overlays.

---

## 2. Global Exercise Library Audit & Classification

A complete audit of all **61 exercises** present in the STREN PostgreSQL database was conducted:

| Classification | Count | Description | Action Required |
|:---|:---:|:---|:---|
| **Group A — Missing Images** | `12` | Exercises with `imageUrl === null` or no valid image source (10 newly seeded biceps movements + 2 custom user test records). | Require new photographic assets. |
| **Group B — Style Mismatch (Line Art)** | `39` | Exercises currently utilizing high-contrast anatomical line-art / muscle diagrams on black backgrounds (Reference A style). | Require replacement with Reference B photography. |
| **Target Style Matched (Studio Photography)** | `10` | Exercises already featuring realistic studio fitness photography matching Reference B. | Standardized to 4:3 WebP format in this package. |
| **Total Exercises Audited** | **61** | **Entire STREN Exercise Catalog** | |

---

## 3. Asset Package Inventory & Manifest Summary

All verified replacement assets are located in `./images/`. Each asset was generated/processed as high-quality WebP at 85% quality, 1200x900 (4:3 aspect ratio).

### Verified Files on Disk (18 Completed Assets)

| # | Exercise Name | Slug | Reason | Verified Filename | Intended Cloudinary Public ID | File Size |
|:---:|:---|:---|:---:|:---|:---|:---:|
| 1 | **Barbell Curl** | `barbell-curl` | `style_standardization` | `exercise-barbell-curl-v2.webp` | `stren/exercises/exercise-barbell-curl-v2` | 71.8 KB |
| 2 | **Barbell Bent-Over Row** | `barbell-bent-over-row` | `style_standardization` | `exercise-barbell-bent-over-row-v2.webp` | `stren/exercises/exercise-barbell-bent-over-row-v2` | 97.8 KB |
| 3 | **Barbell Back Squat** | `barbell-back-squat` | `style_standardization` | `exercise-barbell-back-squat-v2.webp` | `stren/exercises/exercise-barbell-back-squat-v2` | 68.1 KB |
| 4 | **Barbell Bench Press** | `barbell-bench-press` | `style_standardization` | `exercise-barbell-bench-press-v2.webp` | `stren/exercises/exercise-barbell-bench-press-v2` | 67.9 KB |
| 5 | **Cable Crossover** | `cable-crossover` | `style_standardization` | `exercise-cable-crossover-v2.webp` | `stren/exercises/exercise-cable-crossover-v2` | 94.0 KB |
| 6 | **Cable Curl** | `cable-curl` | `style_standardization` | `exercise-cable-curl-v2.webp` | `stren/exercises/exercise-cable-curl-v2` | 68.2 KB |
| 7 | **Bulgarian Split Squat** | `bulgarian-split-squat` | `style_standardization` | `exercise-bulgarian-split-squat-v2.webp` | `stren/exercises/exercise-bulgarian-split-squat-v2` | 82.1 KB |
| 8 | **Arnold Press** | `arnold-press` | `style_standardization` | `exercise-arnold-press-v2.webp` | `stren/exercises/exercise-arnold-press-v2` | 61.8 KB |
| 9 | **Ab Wheel Rollout** | `ab-wheel-rollout` | `style_standardization` | `exercise-ab-wheel-rollout-v2.webp` | `stren/exercises/exercise-ab-wheel-rollout-v2` | 58.2 KB |
| 10 | **Bench Dips** | `bench-dips` | `style_standardization` | `exercise-bench-dips-v2.webp` | `stren/exercises/exercise-bench-dips-v2` | 79.5 KB |
| 11 | **Conventional Deadlift** | `conventional-deadlift` | `style_mismatch` | `exercise-conventional-deadlift-v2.webp` | `stren/exercises/exercise-conventional-deadlift-v2` | 124.4 KB |
| 12 | **Push-Ups** | `push-ups` | `style_mismatch` | `exercise-push-ups-v2.webp` | `stren/exercises/exercise-push-ups-v2` | 70.3 KB |
| 13 | **Pull-Ups** | `pull-ups` | `style_mismatch` | `exercise-pull-ups-v2.webp` | `stren/exercises/exercise-pull-ups-v2` | 94.5 KB |
| 14 | **Lat Pulldown** | `lat-pulldown` | `style_mismatch` | `exercise-lat-pulldown-v2.webp` | `stren/exercises/exercise-lat-pulldown-v2` | 112.3 KB |
| 15 | **Incline Dumbbell Press** | `incline-dumbbell-press` | `style_mismatch` | `exercise-incline-dumbbell-press-v2.webp` | `stren/exercises/exercise-incline-dumbbell-press-v2` | 96.8 KB |
| 16 | **Overhead Barbell Press** | `overhead-barbell-press` | `style_mismatch` | `exercise-overhead-barbell-press-v2.webp` | `stren/exercises/exercise-overhead-barbell-press-v2` | 154.8 KB |
| 17 | **Cable Woodchoppers** | `cable-woodchoppers` | `style_mismatch` | `exercise-cable-woodchoppers-v2.webp` | `stren/exercises/exercise-cable-woodchoppers-v2` | 107.6 KB |
| 18 | **EZ-Bar Curl** | `ez-bar-curl` | `missing` | `exercise-ez-bar-curl-v2.webp` | `stren/exercises/exercise-ez-bar-curl-v2` | 101.3 KB |

*Detailed machine-readable metadata is provided in `exercise-image-manifest.json` and `exercise-image-manifest.csv`.*

---

## 4. Uncompleted Items & API Quota Limitations

During image synthesis for the remaining exercises, the generative model reached its platform capacity limit:
- **Error:** `429 RESOURCE_EXHAUSTED: You have exhausted your capacity on this model. Your quota will reset after 4h48m`.
- **Enforcement:** Per strict operational safety instructions, quota errors are not retried in speculative loops.
- **Pending Exercises:**
  - **Group A (Remaining Missing Images, 11 exercises):** `Dumbbell Biceps Curl`, `Alternating Dumbbell Curl`, `Spider Curl`, `Hammer Curl`, `Cross-body Hammer Curl`, `Cable Biceps Curl`, `Bayesian Cable Curl`, `Machine Biceps Curl`, `Reverse Curl`, plus custom user test records (`HOSAMELDEEN MOSTAFA`, `Up to Low`).
  - **Group B (Remaining Style Replacements, 32 exercises):** `Cable Kickbacks`, `Cable Upright Row`, `Chest Dips`, `Close-Grip Bench Press`, `Concentration Curl`, `Deadlift111`, `Decline Barbell Press`, `Decline Crunches`, `Face Pulls`, `Front Dumbbell Raises`, `Goblet Squat`, `Hammer Curls`, `Hanging Leg Raises`, `Incline Dumbbell Curl`, `Lateral Raises`, `Leg Extensions`, `Leg Press`, `Lying Leg Curls`, `Overhead Tricep Extension`, `Pec Deck Fly`, `Plank`, `Preacher Curl`, `Reverse Pec Deck`, `Romanian Deadlift`, `Russian Twists`, `Seated Cable Row`, `Seated Dumbbell Press`, `Single-Arm Dumbbell Row`, `Skull Crushers`, `Standing Calf Raises`, `Tricep Rope Pushdown`, `Walking Lunges`.

These exercises remain operational in the STREN application with their current assets or fallback dumbbell badges until the next generation batch is triggered following the quota reset window.

---

## 5. Image Display Consistency Recommendations (Frontend UI)

Inspection of existing frontend image-rendering components (`ExerciseImage.tsx`, `ExerciseCard.tsx`, `WorkoutExerciseItem.tsx`, `ExerciseDetailsPage.tsx`) identified two specific legacy treatments that should be adjusted in the subsequent integration step:

1. **Card Container Background (`bg-white` removal):**
   - In `ExerciseImage.tsx` line 102, the image frame applies `bg-white`. This was originally added to frame line-art illustrations that had transparent backgrounds. For full-bleed realistic photography, this white border bleed can distract from the dark STREN theme (`#090B0F` / `#13181E`).
   - *Recommendation:* Replace `bg-white` with `bg-[#13181E] border-[#2A313A]`.

2. **Aspect Ratio & Object-Fit (`object-contain` vs `object-cover`):**
   - In `ExerciseCard.tsx` line 76, `ExerciseImage` is invoked with `fit="contain"`. This causes 4:3 and 16:9 photographic images to letterbox inside the container with blank padding.
   - *Recommendation:* Standardize all catalog cards to use `fit="cover"` with `object-center`. Because all new v2 assets are rendered at a uniform 4:3 ratio (`1200x900`), `object-cover` will fill the card cleanly without distortion, stretching, or letterboxing.

3. **Fallback & Error Handling:**
   - `ExerciseImage.tsx` already features a robust `onError={() => setHasError(true)}` state displaying the STREN `#5BE584` dumbbell icon on dark `#13181E` surface. This behavior operates gracefully when URLs are null or slow to load.
