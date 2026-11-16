import prisma from "../config/prisma.js";
import { Equipment, Difficulty } from "../constants/exercise.js";

export interface NewExerciseDef {
  name: string;
  description: string;
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  tips: string[];
  imageUrl?: string;
  videoUrl?: string;
  alternatives?: string[];
}

export const standardNewExercises: NewExerciseDef[] = [
  // ==========================================
  // CHEST
  // ==========================================
  {
    name: "Incline Barbell Bench Press",
    description: "Compound barbell pressing movement emphasizing the clavicular head of the pectoralis major.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
    instructions: [
      "Set an incline bench to 30 degrees.",
      "Grip the barbell slightly wider than shoulder width.",
      "Unrack and lower the bar under control to the upper chest.",
      "Drive feet into the ground and press the barbell back up until arms are extended.",
    ],
    tips: [
      "Avoid bouncing the bar on your sternum.",
      "Keep wrists stacked directly over your elbows.",
    ],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213815/exercise-incline-dumbbell-press-v2.png",
    alternatives: ["Incline Dumbbell Press", "Barbell Bench Press"],
  },
  {
    name: "Flat Dumbbell Press",
    description: "Unilateral compound dumbbell press encouraging balanced pectoral development and natural wrist motion.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    instructions: [
      "Sit on a flat bench with dumbbells resting on thighs.",
      "Lie back and kick weights up into position above your chest.",
      "Lower weights out and down until dumbbells reach chest level.",
      "Press smoothly back up to full extension without clanging weights.",
    ],
    tips: [
      "Keep shoulders retracted and flat against the bench.",
      "Flare elbows at approximately 45-60 degrees, not 90 degrees.",
    ],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-bench-press-v2.png",
    alternatives: ["Barbell Bench Press", "Push-Ups"],
  },
  {
    name: "Decline Dumbbell Press",
    description: "Pressing variation targeting the sternal and lower fibers of the chest with reduced anterior shoulder shear.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    instructions: [
      "Secure legs in the decline bench rollers and lie back holding dumbbells.",
      "Position dumbbells at lower chest level with palms facing forward.",
      "Press the weights upward until arms are straight.",
      "Lower with controlled tempo back to the starting point.",
    ],
    tips: ["Control the descent carefully to maintain balance on the decline bench."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213810/exercise-decline-barbell-press-v2.png",
    alternatives: ["Decline Barbell Press", "Chest Dips"],
  },
  {
    name: "Cable Fly (Low to High)",
    description: "Upward arcing cable fly isolating the clavicular upper pectoral fibers under continuous resistance.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior Deltoids"],
    instructions: [
      "Set pulleys to the lowest position with single D-handles.",
      "Stand staggered-stance in the center, arms low at your sides.",
      "Bring hands upward and inward in an arc toward eye level.",
      "Squeeze upper chest at the top, then slowly lower along the same path.",
    ],
    tips: ["Keep a soft bend in the elbows; avoid turning the movement into a press."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213808/exercise-cable-crossover-v2.png",
    alternatives: ["Cable Crossover", "Incline Dumbbell Press"],
  },
  {
    name: "Dumbbell Pullover",
    description: "Classic chest and serratus anterior movement expanding rib cage excursion and stretching the lats.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Lats", "Triceps"],
    instructions: [
      "Lie across a flat bench perpendicular, upper back supported and hips low.",
      "Hold one dumbbell with both hands forming a diamond grip over your chest.",
      "Lower the dumbbell backward in an arc behind your head until feeling a full stretch.",
      "Pull the dumbbell back over your chest using chest and lat tension.",
    ],
    tips: ["Keep hips lower than the bench to maintain a deep stretch."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213843/exercise-pec-deck-fly-v2.png",
    alternatives: ["Cable Crossover", "Straight-Arm Cable Pulldown"],
  },

  // ==========================================
  // BACK
  // ==========================================
  {
    name: "T-Bar Row",
    description: "Heavy compound rowing movement targeting mid-back thickness, lats, and rhomboids.",
    equipment: [Equipment.BARBELL, Equipment.MACHINE],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Rhomboids", "Traps", "Biceps"],
    instructions: [
      "Straddle the T-bar apparatus with a 45-degree hip hinge.",
      "Grip the handles firmly with neutral or overhand grip.",
      "Pull the weight into your sternum, driving elbows back and retracting shoulder blades.",
      "Lower slowly until arms and lats are fully stretched.",
    ],
    tips: ["Do not jerk your torso upright to cheat the weight up."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-bent-over-row-v2.png",
    alternatives: ["Barbell Bent-Over Row", "Seated Cable Row"],
  },
  {
    name: "Dumbbell Shrugs",
    description: "Isolation movement focusing directly on upper trapezius hypertrophy and neck support.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Traps", "Back"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Stand tall holding dumbbells at your sides with neutral grip.",
      "Elevate your shoulders straight up toward your ears as high as possible.",
      "Hold the peak contraction for a full second.",
      "Lower under control to a deep hanging stretch.",
    ],
    tips: ["Do not roll your shoulders; move strictly vertically."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213781/exercise-seated-dumbbell-press-v2.png",
    alternatives: ["Cable Upright Row", "Barbell Bent-Over Row"],
  },
  {
    name: "Close-Grip Lat Pulldown",
    description: "V-bar neutral grip pulldown maximizing lat elongation and elbow tuck for lower lat recruitment.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Forearms"],
    instructions: [
      "Attach a V-bar handle to the high pulley and secure thighs under rollers.",
      "Grip the handle and lean back slightly (10-15 degrees).",
      "Pull the handle down to your upper chest, leading with the elbows.",
      "Slowly let the handle rise until lats are completely stretched.",
    ],
    tips: ["Focus on depressing the scapula before bending the elbows."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213817/exercise-lat-pulldown-v2.png",
    alternatives: ["Lat Pulldown", "Pull-Ups"],
  },
  {
    name: "Straight-Arm Cable Pulldown",
    description: "Pure lat isolation movement eliminating bicep fatigue to maximize the mind-muscle lat connection.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Core", "Triceps"],
    instructions: [
      "Stand in front of a high pulley with a straight bar attached.",
      "Grip the bar slightly wider than shoulder width with straight arms.",
      "Hinge forward 30 degrees at the hips.",
      "Keeping arms extended with only a micro-bend, pull the bar down to your thighs in an arc.",
      "Squeeze lats hard at bottom, then return slowly to forehead height.",
    ],
    tips: ["Do not bend elbows during the pull; let the lats do the work."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213817/exercise-lat-pulldown-v2.png",
    alternatives: ["Dumbbell Pullover", "Lat Pulldown"],
  },
  {
    name: "Chest-Supported Dumbbell Row",
    description: "Incline bench-supported row that completely removes lower back strain to isolate upper back and lats.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Rhomboids", "Rear Deltoids", "Biceps"],
    instructions: [
      "Set an incline bench to roughly 30-45 degrees.",
      "Lie face down with chest supported, holding a dumbbell in each hand.",
      "Row the dumbbells up toward your ribcage, squeezing the shoulder blades together.",
      "Lower under control until arms are fully extended.",
    ],
    tips: ["Keep your chest anchored to the bench; do not hyperextend your lumbar spine."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213782/exercise-single-arm-dumbbell-row-v2.png",
    alternatives: ["Single-Arm Dumbbell Row", "Seated Cable Row"],
  },

  // ==========================================
  // SHOULDERS
  // ==========================================
  {
    name: "Cable Lateral Raise",
    description: "Constant-tension isolation movement targeting the lateral deltoid throughout the complete range of motion.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Shoulders", "Lateral Deltoids"],
    secondaryMuscles: ["Traps"],
    instructions: [
      "Set the cable pulley to hand or ankle height with a single D-handle.",
      "Stand perpendicular to the stack, grabbing the upright bar with your inside hand for support.",
      "Raise your outer arm up and out to shoulder level in a slight diagonal angle.",
      "Lower under constant tension back to the starting point.",
    ],
    tips: ["Lead with the elbow and avoid shrugging your traps up."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213816/exercise-lateral-raises-v2.png",
    alternatives: ["Lateral Raises", "Cable Upright Row"],
  },
  {
    name: "Dumbbell Rear Delt Fly",
    description: "Bent-over isolation fly specifically targeting the posterior deltoid head for complete 3D shoulder shape.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Shoulders", "Rear Deltoids"],
    secondaryMuscles: ["Rhomboids", "Traps"],
    instructions: [
      "Hinge at hips until torso is nearly parallel to the floor.",
      "Hold light dumbbells beneath chest with neutral or palms-in grip.",
      "Raise arms out wide to the sides leading with elbows until upper arms align with torso.",
      "Control the descent slowly back together.",
    ],
    tips: ["Use moderate weights and avoid bouncing with momentum."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213847/exercise-reverse-pec-deck-v2.png",
    alternatives: ["Reverse Pec Deck", "Face Pulls"],
  },
  {
    name: "Barbell Front Raise",
    description: "Strict isolation exercise building anterior deltoid strength, shoulder stability, and upper chest coordination.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Shoulders", "Anterior Deltoids"],
    secondaryMuscles: ["Upper Chest"],
    instructions: [
      "Stand upright holding a barbell with overhand shoulder-width grip across thighs.",
      "Keeping torso stationary and arms straight, raise the bar upward to eye level.",
      "Hold momentarily at the peak, then lower slowly with control.",
    ],
    tips: ["Avoid swinging backwards to launch the bar up."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213810/exercise-front-dumbbell-raises-v2.png",
    alternatives: ["Front Dumbbell Raises", "Overhead Barbell Press"],
  },
  {
    name: "Standing Dumbbell Shoulder Press",
    description: "Standing overhead dumbbell press recruiting core stabilizers alongside all three deltoid heads.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Shoulders", "Anterior Deltoids"],
    secondaryMuscles: ["Triceps", "Lateral Deltoids", "Core"],
    instructions: [
      "Stand with feet shoulder-width apart, holding dumbbells at ear level.",
      "Brace glutes and core to keep ribs anchored.",
      "Press dumbbells straight overhead until arms lock out with biceps close to ears.",
      "Lower under control back to ear level.",
    ],
    tips: ["Do not arch your lower back excessively as the weights press up."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213781/exercise-seated-dumbbell-press-v2.png",
    alternatives: ["Seated Dumbbell Press", "Overhead Barbell Press"],
  },

  // ==========================================
  // TRICEPS
  // ==========================================
  {
    name: "Tricep Pushdown (Straight Bar)",
    description: "Foundational cable pushdown targeting the lateral and medial heads of the triceps brachii.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Attach a straight bar or revolving short bar to the high cable.",
      "Pin your elbows to the sides of your ribcage.",
      "Push the bar down until elbows are fully extended.",
      "Squeeze triceps hard, then allow the bar to rise back to elbow height.",
    ],
    tips: ["Keep elbows pinned firmly in place throughout the set."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213784/exercise-tricep-rope-pushdown-v2.png",
    alternatives: ["Tricep Rope Pushdown", "Skull Crushers"],
  },
  {
    name: "Overhead Cable Tricep Extension",
    description: "Long-head tricep isolation placing the muscle in a full stretch under continuous cable resistance.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Set cable pulley to elbow height or high with a rope attachment.",
      "Face away from the stack in a forward lunge stance.",
      "Hold the rope behind your neck with elbows pointed forward.",
      "Extend your forearms forward and overhead until arms are straight.",
      "Slowly return to the deep stretch behind the head.",
    ],
    tips: ["Flare the rope ends outward at peak lockout for maximum contraction."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213840/exercise-overhead-tricep-extension-v2.png",
    alternatives: ["Overhead Tricep Extension", "Skull Crushers"],
  },
  {
    name: "Dumbbell Tricep Kickback",
    description: "Peak-contraction triceps movement emphasizing the terminal elbow extension and posterior stability.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Rear Deltoids"],
    instructions: [
      "Place one knee and hand on a flat bench, holding a dumbbell in the other hand.",
      "Lift upper arm parallel to the floor with elbow bent at 90 degrees.",
      "Extend the forearm straight back until the entire arm is parallel to the ground.",
      "Squeeze triceps at peak contraction, then return to 90 degrees.",
    ],
    tips: ["Keep your upper arm frozen in place; move only the forearm."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213808/exercise-cable-kickbacks-v2.png",
    alternatives: ["Cable Kickbacks", "Tricep Rope Pushdown"],
  },
  {
    name: "Parallel Bar Dips",
    description: "Upright bodyweight dip emphasizing triceps overload and heavy pressing power.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Chest", "Anterior Deltoids"],
    instructions: [
      "Grasp parallel dip bars and jump up to straight arm support.",
      "Keep torso upright and elbows tucked close to the ribs.",
      "Lower yourself until elbows reach roughly 90 degrees.",
      "Press through your palms forcefully back to full elbow lockout.",
    ],
    tips: ["Keep body upright to focus on triceps rather than leaning forward for chest."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213808/exercise-bench-dips-v2.png",
    alternatives: ["Bench Dips", "Close-Grip Bench Press"],
  },

  // ==========================================
  // LEGS (Quads / Hamstrings / Glutes / Calves)
  // ==========================================
  {
    name: "Front Squat",
    description: "Anteriorly loaded barbell squat emphasizing upright torso mechanics and heavy quadriceps overload.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Glutes", "Core", "Upper Back"],
    instructions: [
      "Rack the barbell across front deltoids using a clean grip or crossed arms.",
      "Keep elbows elevated high and chest proud throughout.",
      "Descend deep between your knees with an upright spine.",
      "Drive through mid-foot to stand back up to starting position.",
    ],
    tips: ["Keep elbows high to prevent the barbell from rolling forward."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213805/exercise-barbell-back-squat-v2.png",
    alternatives: ["Barbell Back Squat", "Goblet Squat", "Leg Press"],
  },
  {
    name: "Hack Squat",
    description: "Machine-guided compound squat allowing deep knee flexion and maximum quad isolation with back support.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Glutes"],
    instructions: [
      "Position shoulders under pads and back firmly against the pad.",
      "Place feet shoulder-width in the middle of the platform.",
      "Disengage safety levers and descend until thighs are at or below parallel.",
      "Press the platform away through your heels to return to top.",
    ],
    tips: ["Do not lock knees completely at the top; maintain tension on the quads."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213818/exercise-leg-press-v2.png",
    alternatives: ["Leg Press", "Leg Extensions", "Barbell Back Squat"],
  },
  {
    name: "Seated Leg Curl",
    description: "Seated knee flexion machine targeting the hamstrings in a lengthened hip-flexed position.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Sit in the machine with back against the backrest and thigh pad secured snugly.",
      "Position the lower pad just beneath your calf muscles above the Achilles.",
      "Curl your heels down and back underneath your seat.",
      "Pause momentarily at peak contraction, then slowly return to full extension.",
    ],
    tips: ["Point toes up (dorsiflexion) to maximize hamstring tension over calves."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213839/exercise-lying-leg-curls-v2.png",
    alternatives: ["Lying Leg Curls", "Romanian Deadlift"],
  },
  {
    name: "Barbell Hip Thrust",
    description: "Gold-standard horizontal hip extension exercise for maximal gluteus maximus hypertrophy and lockout power.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Sit on the floor with upper back against a sturdy padded bench.",
      "Roll a padded barbell over hips with feet flat on the floor, shoulder-width.",
      "Drive through heels to extend hips fully toward the ceiling.",
      "Hold full glute lockout for a second with ribs tucked, then lower with control.",
    ],
    tips: ["Keep your chin tucked and eyes looking forward, not up at the ceiling."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213779/exercise-romanian-deadlift-v2.png",
    alternatives: ["Romanian Deadlift", "Bulgarian Split Squat"],
  },
  {
    name: "Dumbbell Romanian Deadlift",
    description: "Hip hinge movement using dumbbells for a natural tracking path and deep hamstring stretch.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Forearms", "Core"],
    instructions: [
      "Stand holding dumbbells in front of thighs with slight knee bend.",
      "Push hips straight backward as dumbbells trace down the shins.",
      "Stop when you feel a deep hamstring stretch around mid-shin.",
      "Drive hips forward to return to standing position, squeezing glutes.",
    ],
    tips: ["Movement is a backward hip reach, not a knee squat."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213779/exercise-romanian-deadlift-v2.png",
    alternatives: ["Romanian Deadlift", "Conventional Deadlift"],
  },
  {
    name: "Seated Calf Raise",
    description: "Bent-knee machine calf raise directly isolating the soleus muscle beneath the gastrocnemius.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    instructions: [
      "Sit in the machine and place balls of feet on the edge of the footplate.",
      "Adjust thigh pads snugly above your knees and release the safety lever.",
      "Lower heels deeply until you feel a full calf stretch.",
      "Press through the balls of your feet as high as possible, holding peak contraction.",
    ],
    tips: ["Hold the bottom stretch for 2 seconds to eliminate elastic achilles bounce."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213783/exercise-standing-calf-raises-v2.png",
    alternatives: ["Standing Calf Raises"],
  },
  {
    name: "Calf Press on Leg Press",
    description: "Heavy gastrocnemius overload using the leg press carriage with extended knees.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    instructions: [
      "Sit in the leg press and place balls of feet on the lower lip of the platform.",
      "Keep legs straight with only a slight micro-bend at the knees.",
      "Allow the weight to flex your ankles back into a deep stretch.",
      "Extend your ankles fully, pushing the sled forward with your calves.",
    ],
    tips: ["Never let knees hyperextend or unlock during the set."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213783/exercise-standing-calf-raises-v2.png",
    alternatives: ["Standing Calf Raises", "Seated Calf Raise"],
  },

  // ==========================================
  // FOREARMS
  // ==========================================
  {
    name: "Barbell Wrist Curl",
    description: "Forearm flexion movement building wrist flexor mass, forearm thickness, and crushing grip strength.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    instructions: [
      "Sit on a bench with forearms resting across your thighs, wrists hanging off knees.",
      "Hold a barbell with an underhand grip.",
      "Let the bar roll down toward your fingertips, then curl fingers and wrists upward.",
      "Squeeze forearms at top before slowly lowering back down.",
    ],
    tips: ["Keep forearms glued to thighs throughout; do not let elbows rise."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-curl-v2.png",
    alternatives: ["Reverse Curl", "Hammer Curl"],
  },
  {
    name: "Barbell Reverse Wrist Curl",
    description: "Wrist extension exercise targeting the wrist extensors and upper brachioradialis for forearm balance.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    instructions: [
      "Sit on a bench with forearms on thighs, palms facing down over knees.",
      "Grip a light barbell with an overhand grip.",
      "Extend wrists upward as high as possible, contracting the top of the forearms.",
      "Lower slowly back to the starting point.",
    ],
    tips: ["Use a lightweight bar to maintain strict extension without wrist strain."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-curl-v2.png",
    alternatives: ["Reverse Curl", "Barbell Wrist Curl"],
  },
  {
    name: "Farmer's Walk",
    description: "Functional loaded carry building crushing grip strength, trap endurance, and rigid core posture.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Forearms"],
    secondaryMuscles: ["Traps", "Core", "Calves"],
    instructions: [
      "Deadlift heavy dumbbells or kettlebells to your sides.",
      "Stand tall with shoulders pulled back and core braced tightly.",
      "Walk forward in a straight line with controlled, deliberate steps.",
      "Walk for prescribed distance or time, then lower weights with flat back.",
    ],
    tips: ["Do not let the weights sway; keep them tight to your sides."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213785/exercise-walking-lunges-v2.png",
    alternatives: ["Dumbbell Shrugs", "Plank"],
  },

  // ==========================================
  // CORE
  // ==========================================
  {
    name: "Cable Crunch",
    description: "Kneeling spinal flexion exercise allowing progressive resistance overload for the rectus abdominis.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: [],
    instructions: [
      "Kneel below a high cable with rope attachment, holding rope by your temples.",
      "Keep hips fixed back and bend at the waist, crunching elbows down toward knees.",
      "Contract abs hard at the bottom as your spine rounds naturally.",
      "Slowly return upward while keeping abdominal tension continuous.",
    ],
    tips: ["Do not sit back onto your heels; flex your spine using your abs."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213809/exercise-cable-woodchoppers-v2.png",
    alternatives: ["Decline Crunches", "Hanging Leg Raises"],
  },
  {
    name: "Captain's Chair Leg Raise",
    description: "Supported vertical knee and leg raise targeting lower abdominals with full lumbar stabilization.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: ["Hip Flexors"],
    instructions: [
      "Step into the captain's chair, resting forearms on pads and gripping handles.",
      "Press shoulders down away from ears and let legs hang straight.",
      "Raise knees or straight legs up toward chest, curling pelvis forward at the top.",
      "Lower under control without swinging your legs backward.",
    ],
    tips: ["Focus on curling your pelvis upward at the top of the raise to engage the abs."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213814/exercise-hanging-leg-raises-v2.png",
    alternatives: ["Hanging Leg Raises", "Decline Crunches"],
  },
  {
    name: "Dead Bug",
    description: "Anti-extension core stability exercise training contralateral coordination and lumbar bracing.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: ["Hip Flexors"],
    instructions: [
      "Lie on back with arms pointing toward ceiling and knees bent 90 degrees above hips.",
      "Press lower back firmly into the floor.",
      "Slowly lower right arm and left leg toward floor simultaneously.",
      "Return to start, then repeat on opposite limbs while keeping spine glued to floor.",
    ],
    tips: ["If your lower back arches off the floor, shorten your limb reach."],
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213843/exercise-plank-v2.png",
    alternatives: ["Plank", "Russian Twists"],
  },
];

async function main() {
  console.log("=================================================");
  console.log("STREN — Seed Missing Standard Exercises");
  console.log("=================================================\n");

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of standardNewExercises) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: { equals: item.name, mode: "insensitive" },
        isCustom: false,
      },
    });

    if (!existing) {
      await prisma.exercise.create({
        data: {
          name: item.name,
          description: item.description,
          equipment: item.equipment,
          difficulty: item.difficulty,
          primaryMuscles: item.primaryMuscles,
          secondaryMuscles: item.secondaryMuscles,
          instructions: item.instructions,
          tips: item.tips,
          imageUrl: item.imageUrl,
          isCustom: false,
          isActive: true,
        },
      });
      console.log(`[CREATED] "${item.name}" (${item.primaryMuscles.join(", ")})`);
      insertedCount++;
    } else {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          equipment: item.equipment,
          difficulty: item.difficulty,
          primaryMuscles: item.primaryMuscles,
          secondaryMuscles: item.secondaryMuscles,
          instructions: item.instructions,
          tips: item.tips,
          imageUrl: existing.imageUrl || item.imageUrl,
        },
      });
      console.log(`[UPDATED] "${item.name}"`);
      updatedCount++;
    }
  }

  // Connect alternatives
  console.log("\nEstablishing smart exercise alternatives...");
  for (const item of standardNewExercises) {
    if (!item.alternatives || item.alternatives.length === 0) continue;

    const source = await prisma.exercise.findFirst({
      where: { name: { equals: item.name, mode: "insensitive" } },
    });
    if (!source) continue;

    const targetExercises = await prisma.exercise.findMany({
      where: {
        name: { in: item.alternatives },
        id: { not: source.id },
      },
      select: { id: true },
    });

    if (targetExercises.length > 0) {
      await prisma.exercise.update({
        where: { id: source.id },
        data: {
          alternatives: {
            connect: targetExercises.map((t) => ({ id: t.id })),
          },
        },
      });
    }
  }

  const finalTotal = await prisma.exercise.count();
  console.log(`\n✅ Finished! Added: ${insertedCount}, Updated: ${updatedCount}`);
  console.log(`Total exercises in catalog: ${finalTotal}`);
}

if (process.argv[1]?.replace(/\\/g, "/").includes("seed-standard-exercises")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
