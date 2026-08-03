import { Equipment, Difficulty } from "../../constants/exercise.js";

export interface RawExercise {
  name: string;
  description: string;
  equipment: Equipment[];
  difficulty: Difficulty;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  alternatives?: any[];
}

export const exercisesData: RawExercise[] = [
  // CHEST
  {
    name: "Barbell Bench Press",
    description:
      "The premier compound pressing movement for building upper body strength and mass.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    instructions: [
      "Lie on the flat bench with feet firmly planted on the floor.",
      "Grip the barbell slightly wider than shoulder-width.",
      "Unrack the bar and lower it under control to your mid-chest.",
      "Press the bar upward explosively until elbows are locked.",
    ],
    tips: [
      "Keep your shoulder blades retracted and depressed.",
      "Do not bounce the bar off your chest.",
    ],
    videoUrl: "https://example.com/videos/barbell-bench-press.mp4",
  },
  {
    name: "Incline Dumbbell Press",
    description:
      "Unilateral pressing variation targeting the clavicular head of the pectorals.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
    instructions: [
      "Set an adjustable bench to a 30-45 degree incline.",
      "Kick the dumbbells up to shoulder height using your thighs.",
      "Press the dumbbells straight up until arms are extended.",
      "Lower the dumbbells until you feel a deep stretch in your upper chest.",
    ],
    tips: [
      "Keep your wrists straight and elbows tucked at a 45-degree angle.",
      "Focus on squeezing the chest at the peak of the movement.",
    ],
  },
  {
    name: "Cable Crossover",
    description:
      "Constant-tension isolation movement for pectoral hypertrophy.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior Deltoids"],
    instructions: [
      "Set the cable pulleys to the highest position with D-handle attachments.",
      "Take a step forward to create tension and bend your torso slightly.",
      "Bring your hands together in an arcing motion in front of your chest.",
      "Return slowly to the starting position, allowing the chest to open up.",
    ],
    tips: ["Maintain a slight bend in your elbows throughout the entire set."],
  },
  {
    name: "Push-Ups",
    description:
      "A foundational bodyweight exercise for pushing strength and core stability.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Anterior Deltoids", "Core"],
    instructions: [
      "Assume a high plank position with hands shoulder-width apart.",
      "Lower your body until your chest nearly touches the floor.",
      "Push through your palms to return to the starting position.",
    ],
    tips: ["Keep your glutes and core braced so your hips do not sag."],
  },
  {
    name: "Pec Deck Fly",
    description:
      "Machine-based isolation exercise that eliminates stability requirements.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior Deltoids"],
    instructions: [
      "Sit on the machine with your back flat against the pad.",
      "Place your forearms or hands on the levers at chest height.",
      "Squeeze the handles together until they meet in the center.",
      "Reverse the motion slowly under complete control.",
    ],
    tips: [
      "Adjust the seat height so your elbows are level with your mid-chest.",
    ],
  },
  {
    name: "Decline Barbell Press",
    description:
      "Pressing variation targeting the lower sternal fibers of the pectorals.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    instructions: [
      "Secure your feet under the leg braces of the decline bench.",
      "Unrack the barbell and lower it toward your lower chest.",
      "Press upward until your arms are fully extended.",
    ],
    tips: ["Use a spotter as reracking on a decline angle can be challenging."],
  },
  {
    name: "Chest Dips",
    description:
      "Heavy bodyweight pressing movement emphasizing lower chest and triceps.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    instructions: [
      "Mount the dip bars with arms locked and torso leaning slightly forward.",
      "Lower your body by bending your elbows until shoulders are below elbows.",
      "Drive through your palms to extend the arms back to the starting position.",
    ],
    tips: [
      "Lean forward and flare your elbows slightly to target the chest over triceps.",
    ],
  },

  // BACK
  {
    name: "Lat Pulldown",
    description:
      "Vertical pulling machine exercise designed to build back width.",
    equipment: [Equipment.CABLE, Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    instructions: [
      "Sit at the lat pulldown machine and secure your thighs under the pads.",
      "Grip the wide bar with an overhand grip.",
      "Pull the bar down toward your upper chest while driving elbows down.",
      "Extend your arms fully on the eccentric phase to stretch the lats.",
    ],
    tips: ["Avoid using momentum or swinging your torso backward."],
  },
  {
    name: "Barbell Bent-Over Row",
    description:
      "Heavy horizontal pulling movement for overall back thickness and density.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps", "Rear Deltoids", "Erector Spinae"],
    instructions: [
      "Hinge at the hips until your torso is roughly parallel to the floor.",
      "Grip the barbell with an overhand or underhand grip.",
      "Row the bar toward your lower ribcage, squeezing your shoulder blades.",
      "Lower the weight slowly without letting it touch the floor between reps.",
    ],
    tips: ["Keep your lower back in a neutral, flat position throughout."],
  },
  {
    name: "Seated Cable Row",
    description:
      "Horizontal pulling movement providing constant tension across the rhomboids and lats.",
    equipment: [Equipment.CABLE, Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    instructions: [
      "Sit on the machine bench with knees slightly bent and feet on the footplates.",
      "Grip the handle with both hands with an upright posture.",
      "Pull the handle to your abdomen, retracting your scapula at the peak.",
      "Extend your arms forward slowly without rounding your lower back.",
    ],
    tips: [
      "Initiate the pull by pulling your shoulders back before bending the elbows.",
    ],
  },
  {
    name: "Pull-Ups",
    description:
      "The ultimate upper-body bodyweight vertical pulling movement.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Core"],
    instructions: [
      "Grip the overhead bar with an overhand grip slightly wider than shoulders.",
      "Engage your lats and pull your chin over the bar.",
      "Lower yourself under control until your arms are fully locked out.",
    ],
    tips: ["Think about driving your elbows down to your hip pockets."],
  },
  {
    name: "Conventional Deadlift",
    description:
      "Full-body compound pull developing posterior chain strength and stability.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Back", "Erector Spinae", "Hamstrings", "Glutes"],
    secondaryMuscles: ["Traps", "Forearms", "Core"],
    instructions: [
      "Stand with your mid-foot directly under the barbell.",
      "Bend at the hips and knees to grip the bar outside your shins.",
      "Flatten your back, brace your core, and drive through the floor to stand up.",
      "Lock out your hips and knees at the top, then hinge backward to lower the bar.",
    ],
    tips: [
      "Keep the barbell dragging against your shins and thighs during the pull.",
    ],
  },
  {
    name: "Single-Arm Dumbbell Row",
    description:
      "Unilateral row allowing for greater range of motion and core anti-rotation.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    instructions: [
      "Place your left knee and left hand on a flat bench for support.",
      "Hold a dumbbell in your right hand with your arm hanging straight down.",
      "Pull the dumbbell up toward your hip pocket, keeping the elbow close to your body.",
      "Lower the dumbbell until your shoulder and lat are fully stretched.",
    ],
    tips: [
      "Do not twist your torso to lift heavier weights; keep your shoulders square.",
    ],
  },
  {
    name: "Face Pulls",
    description:
      "Crucial postural exercise targeting rear delts, rhomboids, and external rotators.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Back", "Rear Deltoids"],
    secondaryMuscles: ["Traps", "Rotator Cuff"],
    instructions: [
      "Set the pulley to upper chest or eye level with a rope attachment.",
      "Grip the rope with an overhand grip and step back to create tension.",
      "Pull the rope toward your face while externally rotating your shoulders.",
      "Squeeze your upper back for a second before returning to the start.",
    ],
    tips: ["Pull with your rear deltoids and upper traps, not your biceps."],
  },

  // LEGS
  {
    name: "Barbell Back Squat",
    description:
      "The foundational lower-body compound exercise for leg hypertrophy and strength.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Erector Spinae"],
    instructions: [
      "Rest the barbell comfortably across your upper traps or rear deltoids.",
      "Unrack the bar and take two shoulder-width steps back.",
      "Initiate the squat by bending your knees and hips simultaneously.",
      "Descend until your thighs are parallel to the floor, then drive up through your mid-foot.",
    ],
    tips: ["Keep your chest proud and knees tracking outward over your toes."],
  },
  {
    name: "Romanian Deadlift",
    description:
      "Hip-hinge movement that heavily emphasizes hamstring stretch and glute engagement.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Erector Spinae", "Forearms"],
    instructions: [
      "Stand upright holding a barbell with a shoulder-width overhand grip.",
      "Keep a slight, fixed bend in your knees throughout the movement.",
      "Hinge at the hips, pushing your glutes backward while lowering the bar along your thighs.",
      "Stop when you feel a maximum hamstring stretch, then drive hips forward to stand.",
    ],
    tips: [
      "Do not allow your lumbar spine to round at the bottom of the movement.",
    ],
  },
  {
    name: "Leg Press",
    description:
      "High-loading machine exercise for lower body volume without spinal compression.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    instructions: [
      "Sit in the machine with your feet placed shoulder-width apart on the sled.",
      "Release the safety catches and lower the platform until knees form a 90-degree angle.",
      "Press the sled back up through your heels and mid-foot.",
    ],
    tips: ["Never lock out your knees forcefully at the top of the press."],
  },
  {
    name: "Walking Lunges",
    description:
      "Dynamic unilateral leg movement developing balance, coordination, and glute strength.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    instructions: [
      "Hold two dumbbells at your sides and stand tall.",
      "Take a long step forward with your right foot and bend both knees to 90 degrees.",
      "Drive through your lead foot to step forward into the next lunge with your left leg.",
    ],
    tips: [
      "Keep your torso upright and do not let your back knee slam into the floor.",
    ],
  },
  {
    name: "Leg Extensions",
    description:
      "Open-chain isolation exercise designed to target the quadriceps muscles directly.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: [],
    instructions: [
      "Sit on the machine with the padded bar resting against your lower shins.",
      "Hold the side handles firmly and extend your legs until fully straight.",
      "Pause and squeeze your quads at the top before lowering under control.",
    ],
    tips: ["Align your knee joint directly with the machine's pivot point."],
  },
  {
    name: "Lying Leg Curls",
    description:
      "Machine isolation movement emphasizing knee flexion to target the hamstrings.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Lie face down on the machine with the roller pad placed just above your ankles.",
      "Curl your legs upward toward your glutes as far as comfortably possible.",
      "Lower the weight slowly to achieve a full extension in the hamstrings.",
    ],
    tips: [
      "Keep your hips pressed firmly against the bench pad throughout the set.",
    ],
  },
  {
    name: "Standing Calf Raises",
    description:
      "Heavy isolation exercise targeting the gastrocnemius muscle of the calf.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    instructions: [
      "Position your shoulders under the pads and place the balls of your feet on the step.",
      "Lower your heels as far as possible to get a deep stretch.",
      "Drive through the balls of your feet to elevate your heels as high as you can.",
    ],
    tips: ["Pause for one second at the bottom stretch and top contraction."],
  },
  {
    name: "Bulgarian Split Squat",
    description:
      "Intense unilateral leg movement elevating the rear foot to isolate the lead leg.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Stand a couple of feet in front of a flat bench holding dumbbells.",
      "Reach one foot backward and rest the top of your foot on the bench.",
      "Lower your rear knee toward the floor while bending your front knee.",
      "Drive through the heel of your front foot to return to the top position.",
    ],
    tips: [
      "Lean your torso slightly forward to shift more load onto the glutes.",
    ],
  },
  {
    name: "Goblet Squat",
    description:
      "An accessible anterior-loaded squat variation teaching proper mechanics.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Core", "Shoulders"],
    instructions: [
      "Hold a single dumbbell or kettlebell vertically against your chest.",
      "Squat down by pushing your hips back and bending your knees.",
      "Allow your elbows to track inside your knees at the bottom of the squat.",
      "Stand up by pushing the floor away.",
    ],
    tips: [
      "Keep the weight pressed against your chest so your upper back doesn't round.",
    ],
  },

  // SHOULDERS
  {
    name: "Overhead Barbell Press",
    description:
      "Strict vertical pressing compound movement building shoulder and core strength.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Shoulders", "Anterior Deltoids"],
    secondaryMuscles: ["Triceps", "Upper Traps", "Core"],
    instructions: [
      "Unrack the barbell at upper chest height with hands just outside shoulder width.",
      "Brace your core and glutes firmly.",
      "Press the bar directly overhead, moving your head slightly backward to clear the bar path.",
      "Lock out your elbows overhead with the bar positioned directly over your mid-foot.",
    ],
    tips: ["Do not bend your knees or use leg drive; keep it a strict press."],
  },
  {
    name: "Seated Dumbbell Press",
    description:
      "Stable overhead pressing variation allowing independent arm movement.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Shoulders", "Anterior Deltoids"],
    secondaryMuscles: ["Triceps", "Lateral Deltoids"],
    instructions: [
      "Sit on an upright bench holding two dumbbells at shoulder height.",
      "Press the dumbbells overhead until they nearly touch at the top.",
      "Lower slowly until your elbows reach a 90-degree angle or slightly lower.",
    ],
    tips: ["Keep your back pressed against the bench pad for stability."],
  },
  {
    name: "Lateral Raises",
    description:
      "Essential isolation exercise for building shoulder width by targeting the lateral deltoids.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Shoulders", "Lateral Deltoids"],
    secondaryMuscles: ["Traps"],
    instructions: [
      "Stand tall holding dumbbells at your sides with palms facing each other.",
      "Raise your arms out to the sides until they are level with your shoulders.",
      "Lower the dumbbells slowly back to your sides without letting them swing.",
    ],
    tips: ["Lead the lift with your elbows slightly higher than your wrists."],
  },
  {
    name: "Front Dumbbell Raises",
    description:
      "Isolation movement focused specifically on the anterior deltoid head.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Shoulders", "Anterior Deltoids"],
    secondaryMuscles: ["Upper Chest"],
    instructions: [
      "Hold two dumbbells in front of your thighs with palms facing your legs.",
      "Lift one or both dumbbells forward and upward until shoulder height.",
      "Lower slowly under control to the starting position.",
    ],
    tips: ["Avoid leaning backward to initiate the lift."],
  },
  {
    name: "Reverse Pec Deck",
    description:
      "Machine isolation movement targeting the rear deltoids and upper back musculature.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Shoulders", "Rear Deltoids"],
    secondaryMuscles: ["Rhomboids", "Traps"],
    instructions: [
      "Sit facing the machine chest pad with handles set to the rear position.",
      "Grip the horizontal handles with your arms extended in front of you.",
      "Pull your hands outward and backward in an arc until arms are beside your torso.",
      "Return slowly to the front starting position.",
    ],
    tips: [
      "Focus on pushing your hands away from the body rather than squeezing scapula.",
    ],
  },
  {
    name: "Cable Upright Row",
    description:
      "Compound pulling movement targeting lateral deltoids and upper trapezius.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Shoulders", "Lateral Deltoids", "Traps"],
    secondaryMuscles: ["Biceps", "Forearms"],
    instructions: [
      "Attach a straight bar or rope to the lowest pulley setting.",
      "Grip the bar with an overhand grip slightly narrower than shoulder width.",
      "Pull the bar vertically up your torso until your elbows reach shoulder height.",
      "Lower the weight smoothly back to the bottom position.",
    ],
    tips: [
      "Do not pull the bar higher than shoulder level to avoid shoulder impingement.",
    ],
  },
  {
    name: "Arnold Press",
    description:
      "Rotational dumbbell press engaging all three heads of the deltoids.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Upper Chest"],
    instructions: [
      "Hold dumbbells in front of your chest with palms facing your torso.",
      "As you press the dumbbells overhead, rotate your wrists outward.",
      "At the top lockout, your palms should be facing away from you.",
      "Reverse the rotation as you lower the weights back to your chest.",
    ],
    tips: [
      "Use lighter weights than standard presses until you master the rotation.",
    ],
  },

  // BICEPS
  {
    name: "Barbell Curl",
    description:
      "The classic mass-building isolation movement for the biceps brachii.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Stand upright holding a barbell with a shoulder-width underhand grip.",
      "Keep your upper arms stationary against your sides.",
      "Curl the bar upward toward your chest by flexing your elbows.",
      "Lower the bar slowly until your arms are completely extended.",
    ],
    tips: [
      "Keep your elbows pinned to your ribs; do not let them drift forward.",
    ],
  },
  {
    name: "Incline Dumbbell Curl",
    description:
      "Places the biceps in a stretched position behind the body for maximum muscle fiber recruitment.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Set an incline bench to 45 degrees and lie back holding dumbbells.",
      "Let your arms hang straight down toward the floor with palms facing forward.",
      "Curl the dumbbells upward without moving your upper arm or shoulder.",
      "Lower slowly to experience a deep stretch at the bottom.",
    ],
    tips: [
      "Keep your shoulders retracted against the bench pad throughout the set.",
    ],
  },
  {
    name: "Hammer Curls",
    description:
      "Neutral-grip curl emphasizing the brachialis and brachioradialis for arm thickness.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: [],
    instructions: [
      "Stand holding dumbbells at your sides with palms facing each other (neutral grip).",
      "Curl the weights upward while maintaining the neutral hand position.",
      "Squeeze your forearms and biceps at the top before lowering.",
    ],
    tips: ["You can alternate arms or curl both dumbbells simultaneously."],
  },
  {
    name: "Preacher Curl",
    description:
      "Strict isolation exercise preventing momentum by anchoring the upper arms.",
    equipment: [Equipment.EZ_BAR, Equipment.MACHINE],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Rest your upper arms and chest flat against the angled preacher pad.",
      "Grip the EZ Bar with an underhand grip.",
      "Curl the bar toward your shoulders until biceps are fully contracted.",
      "Lower the weight under control until elbows are almost locked out.",
    ],
    tips: [
      "Do not drop the weight into the bottom stretch to prevent tendon strain.",
    ],
  },
  {
    name: "Cable Curl",
    description:
      "Provides continuous cable tension throughout the entire contraction cycle.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Attach a bar handle to the low pulley of a cable station.",
      "Grip the bar underhand and stand tall with elbows at your sides.",
      "Curl the handle up to shoulder level, squeezing the biceps hard.",
      "Lower the handle smoothly without letting the weight stack touch down.",
    ],
    tips: ["Keep your wrists straight and rigid during the curl."],
  },
  {
    name: "Concentration Curl",
    description:
      "Unilateral peak-focus curl performed seated with elbow braced against the thigh.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Sit on a bench with legs spread wide and lean forward slightly.",
      "Brace your working elbow against the inside of your corresponding thigh.",
      "Curl the dumbbell toward your face while keeping the upper arm completely still.",
      "Lower slowly to full arm extension.",
    ],
    tips: [
      "Focus intensely on squeezing the bicep at the top of the movement.",
    ],
  },

  // TRICEPS
  {
    name: "Tricep Rope Pushdown",
    description:
      "Cable isolation movement targeting the lateral and long heads of the triceps.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    instructions: [
      "Attach a rope to the high pulley station and grip it with neutral hands.",
      "Keep your elbows tucked firmly against your ribcage.",
      "Push the rope downward, spreading the handles apart at the bottom lockout.",
      "Allow your forearms to rise back up to 90 degrees under control.",
    ],
    tips: [
      "Do not allow your elbows to drift forward or upward during the eccentric phase.",
    ],
  },
  {
    name: "Skull Crushers",
    description:
      "Lying barbell extension providing heavy loading for overall tricep mass.",
    equipment: [Equipment.EZ_BAR, Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Lie flat on a bench holding an EZ Bar directly over your chest with arms extended.",
      "Keep your shoulders and upper arms completely stationary.",
      "Bend your elbows to lower the bar toward your forehead or slightly behind your head.",
      "Extend your elbows to drive the bar back to the starting position.",
    ],
    tips: [
      "Angle your arms slightly backward from vertical to keep constant tension on the triceps.",
    ],
  },
  {
    name: "Overhead Tricep Extension",
    description:
      "Places the long head of the triceps under extreme stretch for maximum hypertrophy.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    instructions: [
      "Sit or stand holding a single heavy dumbbell overhead with both hands cupping the top plate.",
      "Lower the weight behind your head by bending your elbows as far as comfortable.",
      "Press the dumbbell back up overhead until elbows are locked.",
    ],
    tips: ["Keep your elbows pointing forward rather than flaring out wide."],
  },
  {
    name: "Close-Grip Bench Press",
    description:
      "Heavy compound pressing variation shifting primary emphasis from chest to triceps.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Chest", "Anterior Deltoids"],
    instructions: [
      "Lie on the flat bench and grip the barbell at shoulder width or slightly narrower.",
      "Unrack the bar and lower it to your lower chest, keeping elbows tucked close to your body.",
      "Press the bar upward explosively until your triceps lock out.",
    ],
    tips: [
      "Do not grip the bar too close together as this puts excessive torque on the wrists.",
    ],
  },
  {
    name: "Bench Dips",
    description:
      "Accessible bodyweight tricep builder performed using a flat workout bench.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Chest", "Anterior Deltoids"],
    instructions: [
      "Place your hands shoulder-width apart on the edge of a flat bench behind you.",
      "Extend your legs out in front of you with heels on the floor.",
      "Lower your torso by bending your elbows until they reach roughly 90 degrees.",
      "Push through your palms to elevate your body back to starting extension.",
    ],
    tips: [
      "Keep your hips close to the bench edge to protect your shoulder joints.",
    ],
  },
  {
    name: "Cable Kickbacks",
    description:
      "Strict unilateral isolation movement maximizing peak tricep contraction at full extension.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    instructions: [
      "Set a pulley to ankle height and hinge forward at the hips with a flat back.",
      "Hold the cable ball or handle and raise your upper arm until parallel to the floor.",
      "Extend your elbow backward until your arm is completely straight and flexed.",
      "Return the forearm slowly to the 90-degree start position.",
    ],
    tips: [
      "Keep your upper arm locked parallel to the ceiling throughout the set.",
    ],
  },

  // CORE
  {
    name: "Hanging Leg Raises",
    description:
      "Advanced core exercise targeting the lower rectus abdominis and hip flexors.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: ["Hip Flexors", "Forearms"],
    instructions: [
      "Hang from a pull-up bar with an overhand grip and arms fully extended.",
      "Keep your legs straight or slightly bent and raise them until parallel to the floor.",
      "Lower your legs slowly under control to prevent swinging.",
    ],
    tips: [
      "Tilt your pelvis upward at the top of the movement to truly contract the abs.",
    ],
  },
  {
    name: "Plank",
    description:
      "Isometric core stability movement building endurance across the entire abdominal wall.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    instructions: [
      "Support your bodyweight on your forearms and toes with elbows under shoulders.",
      "Brace your core, squeeze your glutes, and maintain a rigid, straight body line.",
      "Hold the isometric position for the designated duration.",
    ],
    tips: [
      "Do not let your hips sag toward the floor or hike up toward the ceiling.",
    ],
  },
  {
    name: "Cable Woodchoppers",
    description:
      "Rotational core exercise developing oblique strength and functional power transfer.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Set the cable pulley to shoulder height and stand sideways to the machine.",
      "Grip the handle with both hands with arms extended toward the pulley.",
      "Rotate your torso and pull the handle across your body in a downward or horizontal chopping motion.",
      "Return slowly to the starting position resisting the cable pull.",
    ],
    tips: [
      "Initiate the rotation from your core and hips rather than pulling with your arms.",
    ],
  },
  {
    name: "Russian Twists",
    description:
      "Seated rotational core exercise targeting the internal and external obliques.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Hip Flexors"],
    instructions: [
      "Sit on the floor with knees bent, feet elevated slightly, and torso leaning back at 45 degrees.",
      "Hold a weight or clasp hands together in front of your chest.",
      "Rotate your torso smoothly to touch the floor on your right side.",
      "Rotate back through center to touch the floor on your left side.",
    ],
    tips: [
      "Follow the moving weight with your eyes and shoulders to ensure full lumbar rotation.",
    ],
  },
  {
    name: "Ab Wheel Rollout",
    description:
      "Challenging anti-extension abdominal exercise recruiting the entire anterior core chain.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.ADVANCED,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: ["Lats", "Shoulders"],
    instructions: [
      "Kneel on a padded mat holding the ab wheel handles beneath your shoulders.",
      "Brace your core tightly and roll the wheel forward, extending your body toward the floor.",
      "Go as far as you can without letting your lower back arch.",
      "Use your abdominal muscles to pull the wheel back to the kneeling start position.",
    ],
    tips: [
      "If your lower back hurts, you have rolled out too far beyond your core strength limit.",
    ],
  },
  {
    name: "Decline Crunches",
    description:
      "Weighted or bodyweight spinal flexion exercise utilizing a decline angle for added resistance.",
    equipment: [Equipment.BODYWEIGHT],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Core", "Abs"],
    secondaryMuscles: [],
    instructions: [
      "Secure your legs in the decline bench foot braces and lie back.",
      "Place your hands lightly across your chest or behind your ears.",
      "Flex your spine to curl your torso upward toward your knees.",
      "Lower your torso back under control without resting completely on the bench pad.",
    ],
    tips: ["Do not pull on the back of your head or neck with your hands."],
  },
];
