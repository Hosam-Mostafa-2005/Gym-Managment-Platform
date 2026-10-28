import dotenv from "dotenv";
import prisma from "../config/prisma.js";
import { Equipment, Difficulty } from "../constants/exercise.js";

dotenv.config();

export const bicepExercises = [
  {
    name: "Barbell Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-curl-v2.png",
    description: "The classic standing barbell curl for building overall biceps mass and peak.",
    equipment: [Equipment.BARBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Stand upright with feet hip-width apart holding a barbell with an underhand shoulder-width grip.",
      "Keep elbows pinned to your sides and curl the bar toward your chest.",
      "Squeeze your biceps at peak contraction, then lower with control to full extension.",
    ],
    tips: [
      "Avoid swinging your torso or using momentum.",
      "Keep wrists firm throughout the movement.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
  },
  {
    name: "EZ-Bar Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213800/Muscular_Man_Curling_an_EZ_Barbell.png",
    description: "Cambered bar curl reducing wrist and elbow strain while overloading the biceps.",
    equipment: [Equipment.EZ_BAR],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Grip the cambered EZ-bar on the angled inner grips with an underhand grip.",
      "Keep elbows tucked by your ribcage and curl the bar up toward shoulder height.",
      "Squeeze biceps firmly at the top and lower under control.",
    ],
    tips: [
      "The angled grip relieves wrist and forearm strain compared to straight bars.",
      "Maintain strict upright posture.",
    ],
  },
  {
    name: "Dumbbell Biceps Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213806/Faceless_Muscular_Dumbbell_Curl_Illustration.png",
    description: "Bilateral or synchronized free weight curl allowing natural wrist positioning.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Stand tall with a dumbbell in each hand at your sides, palms facing forward.",
      "Curl both dumbbells upward simultaneously while keeping upper arms vertical.",
      "Pause at the peak squeeze, then lower smoothly back to full extension.",
    ],
    tips: [
      "Do not let elbows drift forward excessively.",
      "Control the lowering phase for 2-3 seconds.",
    ],
  },
  {
    name: "Alternating Dumbbell Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/Faceless_Muscular_Man_Performing_Dumbbell_Curl.png",
    description: "Classic unilateral curl allowing full focus and wrist supination on each repetition.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Hold a pair of dumbbells at your sides with neutral grip (palms facing inward).",
      "Curl one dumbbell upward while supinating your forearm so your palm faces up at the top.",
      "Lower that dumbbell under control, then repeat with the opposite arm.",
    ],
    tips: [
      "Focus on the forearm supination at mid-curl for maximum biceps recruitment.",
      "Avoid leaning your torso to the working side.",
    ],
  },
  {
    name: "Incline Dumbbell Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213814/exercise-incline-dumbbell-curl-v2.png",
    description: "Extreme long-head stretch isolation curl performed on an angled bench.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Set an incline bench to 45-60 degrees and sit back with arms hanging straight down.",
      "Curl both dumbbells upward, keeping shoulders pinned back against the bench.",
      "Squeeze the long head of the biceps at the top, then lower until you feel a deep stretch at the bottom.",
    ],
    tips: [
      "Keep upper arms perpendicular to the floor to maximize long head stretch.",
      "Do not allow shoulders to round forward.",
    ],
  },
  {
    name: "Preacher Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213844/exercise-preacher-curl-v2.png",
    description: "Supported isolation movement eliminating shoulder involvement for pure biceps peak tension.",
    equipment: [Equipment.EZ_BAR],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Sit at a preacher bench and position the top of the pad firmly in your armpits.",
      "Grasp the bar with an underhand grip and arms fully extended across the pad.",
      "Curl the bar upward toward your chin until your forearms are vertical.",
      "Lower slowly until arms are near full extension without hyper-extending the elbows.",
    ],
    tips: [
      "Keep your chest against the support pad throughout the set.",
      "Stop just short of total elbow lockout at the bottom.",
    ],
  },
  {
    name: "Concentration Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213809/exercise-concentration-curl-v2.png",
    description: "Seated single-arm curl isolating the biceps brachii peak contraction.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Sit on the edge of a flat bench with legs spread and lean forward.",
      "Rest the back of your working tricep against the inside of your same-side thigh.",
      "Curl the dumbbell upward until fully contracted, keeping upper arm stationary.",
      "Lower slowly back to the starting hanging position.",
    ],
    tips: [
      "Do not swing the torso or push off the thigh with your elbow.",
      "Focus on the peak squeeze at the top.",
    ],
  },
  {
    name: "Spider Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213801/Prone_Incline_Dumbbell_Curls.png",
    description: "Prone incline curl maximizing short-head activation without torso momentum.",
    equipment: [Equipment.EZ_BAR, Equipment.DUMBBELL],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Brachialis", "Forearms"],
    instructions: [
      "Lie prone (chest-down) on a 45-degree incline bench with arms hanging vertically over the front.",
      "Grasp the barbell or dumbbells with an underhand grip.",
      "Curl the weight upward toward your face while keeping upper arms perpendicular to the floor.",
      "Squeeze firmly at the top contraction and lower under full control.",
    ],
    tips: [
      "This position eliminates torso momentum and maximizes short head tension.",
      "Do not flare elbows outward.",
    ],
  },
  {
    name: "Hammer Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213813/exercise-hammer-curl-v2.png",
    description: "Neutral-grip curl emphasizing the brachialis and brachioradialis for forearm and arm thickness.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: ["Brachialis"],
    instructions: [
      "Stand upright holding dumbbells at your sides with palms facing inward toward each other (neutral grip).",
      "Keep upper arms stationary and curl the dumbbells upward until thumbs are near shoulder level.",
      "Pause and squeeze the brachialis and forearms, then lower under control.",
    ],
    tips: [
      "Maintain neutral wrist alignment throughout the rep.",
      "Avoid letting dumbbells swing forward.",
    ],
  },
  {
    name: "Cross-body Hammer Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213792/Faceless_Cross-Body_Curl_Illustration.png",
    description: "Neutral-grip curl across the chest to heavily recruit the brachialis and outer biceps.",
    equipment: [Equipment.DUMBBELL],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: ["Brachialis"],
    instructions: [
      "Hold dumbbells at sides with palms facing inward.",
      "Curl one dumbbell across your torso toward the opposite pectoral/collarbone.",
      "Squeeze the brachialis and outer biceps head at peak contraction, then lower and alternate sides.",
    ],
    tips: [
      "Keep the movement strictly in the frontal plane across your chest.",
      "Keep shoulders level and stationary.",
    ],
  },
  {
    name: "Cable Biceps Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213811/Cable_Machine_Biceps_Curl_Illustration.png",
    description: "Continuous-tension standing cable curl targeting the entire biceps curve.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Attach a straight bar or EZ-attachment to the low pulley of a cable station.",
      "Stand 1-2 feet back, gripping the bar with an underhand grip.",
      "Curl the handle upward towards your chest, maintaining constant cable resistance.",
      "Slowly return to the starting position with elbows fully extended.",
    ],
    tips: [
      "Cable provides continuous tension through the entire range of motion.",
      "Keep shoulders relaxed and elbows stationary.",
    ],
  },
  {
    name: "Bayesian Cable Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213806/Black-and-White_Cable_Curl_Illustration.png",
    description: "Facing-away cable curl creating peak stretch tension on the long head behind the torso.",
    equipment: [Equipment.CABLE],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Set single D-handle pulleys to wrist height on a dual cable station.",
      "Face away from the machine and take a step forward so arms are extended behind your torso in a stretch.",
      "Lean slightly forward and curl the cables forward and upward into full flexion.",
      "Allow arms to travel back into the lengthened stretch behind your body under control.",
    ],
    tips: [
      "Target the long head in the extreme lengthened position.",
      "Keep your torso angle stable throughout.",
    ],
  },
  {
    name: "Machine Biceps Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213801/Seated_Preacher_Curl_Machine_Illustration.png",
    description: "Strict machine-guided curl with consistent resistance profile throughout the range.",
    equipment: [Equipment.MACHINE],
    difficulty: Difficulty.BEGINNER,
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Brachialis"],
    instructions: [
      "Adjust the seat so your upper arms rest flush against the angled pad with elbows aligned with the machine pivot point.",
      "Grasp the handles with an underhand grip.",
      "Curl the handles toward your shoulders until your biceps are fully contracted.",
      "Lower slowly under the control of the weight stack without letting the plates crash.",
    ],
    tips: [
      "Align your elbow joint exactly with the axis of machine rotation.",
      "Control the negative phase.",
    ],
  },
  {
    name: "Reverse Curl",
    imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213792/Faceless_Bodybuilder_Holding_Barbell.png",
    description: "Overhand grip curl targeting the brachioradialis, forearms, and brachialis.",
    equipment: [Equipment.BARBELL, Equipment.EZ_BAR],
    difficulty: Difficulty.INTERMEDIATE,
    primaryMuscles: ["Forearms", "Biceps"],
    secondaryMuscles: ["Brachioradialis", "Brachialis"],
    instructions: [
      "Stand upright holding a straight barbell or EZ-bar with an overhand (pronated) grip, palms facing down.",
      "Keep elbows tight to your sides and curl the bar upward toward chest level.",
      "Squeeze the brachioradialis and forearm extensors at the top, then lower with control.",
    ],
    tips: [
      "Use lighter weight than a standard curl to maintain strict overhand wrist position.",
      "Do not allow wrists to flex upward.",
    ],
  },
];

export async function seedBicepsExercises() {
  console.log("🌱 Starting idempotent seeding of complete Biceps exercise movements...");
  let createdCount = 0;
  let updatedCount = 0;

  for (const item of bicepExercises) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: item.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      if (!existing.isCustom) {
        await prisma.exercise.update({
          where: { id: existing.id },
          data: {
            description: item.description,
            equipment: item.equipment as any,
            difficulty: item.difficulty as any,
            primaryMuscles: item.primaryMuscles,
            secondaryMuscles: item.secondaryMuscles,
            instructions: item.instructions,
            tips: item.tips,
            videoUrl: item.videoUrl || existing.videoUrl,
          },
        });
        updatedCount++;
      }
    } else {
      await prisma.exercise.create({
        data: {
          name: item.name,
          description: item.description,
          equipment: item.equipment as any,
          difficulty: item.difficulty as any,
          primaryMuscles: item.primaryMuscles,
          secondaryMuscles: item.secondaryMuscles,
          instructions: item.instructions,
          tips: item.tips,
          videoUrl: item.videoUrl,
          isCustom: false,
          createdById: null,
          isActive: true,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Completed Biceps Seeding: ${createdCount} created, ${updatedCount} verified/updated.`);
}

if (process.argv[1]?.endsWith("seed-biceps-exercises.ts")) {
  seedBicepsExercises()
    .catch((err) => {
      console.error("❌ Failed to seed biceps exercises:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
