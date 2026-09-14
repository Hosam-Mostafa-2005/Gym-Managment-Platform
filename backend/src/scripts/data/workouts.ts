export interface RawWorkoutExercise {
  exercise: any; // ObjectId
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface RawWorkout {
  title: string;
  description: string;
  category: "strength" | "hypertrophy" | "cardio" | "mobility";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number;
  tags: string[];
  isTemplate: boolean;
  createdBy: any; // ObjectId
  exercises: RawWorkoutExercise[];
}

export const generateWorkoutsData = (
  trainers: any[],
  exercises: any[],
): RawWorkout[] => {
  const findEx = (name: string) => {
    const found = exercises.find((e) => e.name === name);
    if (!found) {
      throw new Error(`Exercise not found in database: "${name}"`);
    }
    return found._id;
  };

  const getTrainer = (index: number) => trainers[index % trainers.length]._id;

  return [
    {
      title: "Push Day A (Chest & Triceps Focus)",
      description:
        "Heavy pressing session prioritizing compound upper body pushing strength.",
      category: "strength",
      difficulty: "intermediate",
      estimatedDuration: 60,
      tags: ["Push", "Chest", "Triceps", "Upper Body", "Hypertrophy"],
      isTemplate: true,
      createdBy: getTrainer(0),
      exercises: [
        {
          exercise: findEx("Barbell Bench Press"),
          sets: 4,
          reps: "6-8",
          restSeconds: 180,
          order: 1,
          notes: "Warm up thoroughly before working sets.",
        },
        {
          exercise: findEx("Incline Dumbbell Press"),
          sets: 3,
          reps: "8-10",
          restSeconds: 120,
          order: 2,
        },
        {
          exercise: findEx("Overhead Barbell Press"),
          sets: 3,
          reps: "8-10",
          restSeconds: 120,
          order: 3,
        },
        {
          exercise: findEx("Lateral Raises"),
          sets: 4,
          reps: "12-15",
          restSeconds: 60,
          order: 4,
          notes: "Control the eccentric descent.",
        },
        {
          exercise: findEx("Tricep Rope Pushdown"),
          sets: 3,
          reps: "10-12",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Overhead Tricep Extension"),
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
          order: 6,
        },
      ],
    },
    {
      title: "Pull Day A (Back & Biceps Focus)",
      description:
        "Comprehensive pulling routine designed for back width and bicep peak development.",
      category: "hypertrophy",
      difficulty: "intermediate",
      estimatedDuration: 65,
      tags: ["Pull", "Back", "Biceps", "Upper Body", "Hypertrophy"],
      isTemplate: true,
      createdBy: getTrainer(1),
      exercises: [
        {
          exercise: findEx("Conventional Deadlift"),
          sets: 3,
          reps: "5",
          restSeconds: 180,
          order: 1,
          notes: "Keep spine neutral.",
        },
        {
          exercise: findEx("Lat Pulldown"),
          sets: 4,
          reps: "8-10",
          restSeconds: 90,
          order: 2,
        },
        {
          exercise: findEx("Seated Cable Row"),
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
          order: 3,
        },
        {
          exercise: findEx("Face Pulls"),
          sets: 4,
          reps: "15",
          restSeconds: 60,
          order: 4,
        },
        {
          exercise: findEx("Barbell Curl"),
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Incline Dumbbell Curl"),
          sets: 3,
          reps: "10-12",
          restSeconds: 60,
          order: 6,
        },
      ],
    },
    {
      title: "Leg Day Hypertrophy",
      description:
        "High-volume lower body conditioning and muscle growth routine.",
      category: "hypertrophy",
      difficulty: "advanced",
      estimatedDuration: 75,
      tags: ["Legs", "Lower Body", "Volume", "Hypertrophy", "Advanced"],
      isTemplate: true,
      createdBy: getTrainer(2),
      exercises: [
        {
          exercise: findEx("Barbell Back Squat"),
          sets: 4,
          reps: "6-8",
          restSeconds: 180,
          order: 1,
        },
        {
          exercise: findEx("Romanian Deadlift"),
          sets: 4,
          reps: "8-10",
          restSeconds: 120,
          order: 2,
        },
        {
          exercise: findEx("Leg Press"),
          sets: 3,
          reps: "12-15",
          restSeconds: 90,
          order: 3,
        },
        {
          exercise: findEx("Walking Lunges"),
          sets: 3,
          reps: "12 per leg",
          restSeconds: 90,
          order: 4,
        },
        {
          exercise: findEx("Leg Extensions"),
          sets: 3,
          reps: "15",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Lying Leg Curls"),
          sets: 3,
          reps: "15",
          restSeconds: 60,
          order: 6,
        },
        {
          exercise: findEx("Standing Calf Raises"),
          sets: 4,
          reps: "15-20",
          restSeconds: 45,
          order: 7,
        },
      ],
    },
    {
      title: "Upper Body Strength & Power",
      description:
        "Compound heavy upper body routine targeting raw strength gains.",
      category: "strength",
      difficulty: "advanced",
      estimatedDuration: 70,
      tags: ["Upper Body", "Strength", "Powerbuilding", "Advanced", "Compound"],
      isTemplate: false,
      createdBy: getTrainer(0),
      exercises: [
        {
          exercise: findEx("Barbell Bench Press"),
          sets: 5,
          reps: "5",
          restSeconds: 180,
          order: 1,
        },
        {
          exercise: findEx("Barbell Bent-Over Row"),
          sets: 5,
          reps: "5",
          restSeconds: 180,
          order: 2,
        },
        {
          exercise: findEx("Overhead Barbell Press"),
          sets: 4,
          reps: "6",
          restSeconds: 150,
          order: 3,
        },
        {
          exercise: findEx("Pull-Ups"),
          sets: 4,
          reps: "8-10",
          restSeconds: 120,
          order: 4,
        },
        {
          exercise: findEx("Close-Grip Bench Press"),
          sets: 3,
          reps: "8",
          restSeconds: 90,
          order: 5,
        },
        {
          exercise: findEx("Barbell Curl"),
          sets: 3,
          reps: "8",
          restSeconds: 90,
          order: 6,
        },
      ],
    },
    {
      title: "Lower Body Power & Conditioning",
      description:
        "Explosive leg training focusing on motor unit recruitment and athleticism.",
      category: "strength",
      difficulty: "intermediate",
      estimatedDuration: 60,
      tags: ["Lower Body", "Athletic", "Power", "Strength", "Intermediate"],
      isTemplate: false,
      createdBy: getTrainer(1),
      exercises: [
        {
          exercise: findEx("Conventional Deadlift"),
          sets: 4,
          reps: "3-5",
          restSeconds: 180,
          order: 1,
        },
        {
          exercise: findEx("Bulgarian Split Squat"),
          sets: 3,
          reps: "8 per leg",
          restSeconds: 120,
          order: 2,
        },
        {
          exercise: findEx("Leg Press"),
          sets: 3,
          reps: "10",
          restSeconds: 90,
          order: 3,
        },
        {
          exercise: findEx("Lying Leg Curls"),
          sets: 4,
          reps: "10-12",
          restSeconds: 60,
          order: 4,
        },
        {
          exercise: findEx("Standing Calf Raises"),
          sets: 4,
          reps: "12-15",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Hanging Leg Raises"),
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
          order: 6,
        },
      ],
    },
    {
      title: "Full Body Fundamentals",
      description:
        "An ideal starter routine hitting every major muscle group in a single session.",
      category: "hypertrophy",
      difficulty: "beginner",
      estimatedDuration: 50,
      tags: ["Full Body", "Beginner", "Foundations", "General", "Hypertrophy"],
      isTemplate: true,
      createdBy: getTrainer(2),
      exercises: [
        {
          exercise: findEx("Goblet Squat"),
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
          order: 1,
        },
        {
          exercise: findEx("Push-Ups"),
          sets: 3,
          reps: "8-12",
          restSeconds: 60,
          order: 2,
        },
        {
          exercise: findEx("Lat Pulldown"),
          sets: 3,
          reps: "10-12",
          restSeconds: 60,
          order: 3,
        },
        {
          exercise: findEx("Seated Dumbbell Press"),
          sets: 3,
          reps: "10",
          restSeconds: 60,
          order: 4,
        },
        {
          exercise: findEx("Romanian Deadlift"),
          sets: 3,
          reps: "10",
          restSeconds: 90,
          order: 5,
        },
        {
          exercise: findEx("Plank"),
          sets: 3,
          reps: "45 sec",
          restSeconds: 45,
          order: 6,
        },
      ],
    },
    {
      title: "Shoulders & Arms Blast",
      description:
        "High-intensity isolation workout focusing on upper extremity aesthetics.",
      category: "hypertrophy",
      difficulty: "intermediate",
      estimatedDuration: 55,
      tags: ["Arms", "Shoulders", "Isolation", "Hypertrophy", "Intermediate"],
      isTemplate: false,
      createdBy: getTrainer(0),
      exercises: [
        {
          exercise: findEx("Seated Dumbbell Press"),
          sets: 4,
          reps: "8-10",
          restSeconds: 90,
          order: 1,
        },
        {
          exercise: findEx("Arnold Press"),
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
          order: 2,
        },
        {
          exercise: findEx("Lateral Raises"),
          sets: 4,
          reps: "12-15",
          restSeconds: 60,
          order: 3,
        },
        {
          exercise: findEx("Barbell Curl"),
          sets: 4,
          reps: "8-10",
          restSeconds: 60,
          order: 4,
        },
        {
          exercise: findEx("Skull Crushers"),
          sets: 4,
          reps: "8-10",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Hammer Curls"),
          sets: 3,
          reps: "12",
          restSeconds: 60,
          order: 6,
        },
        {
          exercise: findEx("Cable Kickbacks"),
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
          order: 7,
        },
      ],
    },
    {
      title: "Beginner Strength Circuit",
      description:
        "Simple, highly effective compound routine designed to master lifting technique.",
      category: "strength",
      difficulty: "beginner",
      estimatedDuration: 45,
      tags: ["Beginner", "Strength", "Circuit", "Foundations", "Compound"],
      isTemplate: true,
      createdBy: getTrainer(1),
      exercises: [
        {
          exercise: findEx("Barbell Bench Press"),
          sets: 3,
          reps: "8-10",
          restSeconds: 120,
          order: 1,
        },
        {
          exercise: findEx("Seated Cable Row"),
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
          order: 2,
        },
        {
          exercise: findEx("Leg Press"),
          sets: 3,
          reps: "10-12",
          restSeconds: 90,
          order: 3,
        },
        {
          exercise: findEx("Front Dumbbell Raises"),
          sets: 2,
          reps: "12",
          restSeconds: 60,
          order: 4,
        },
        {
          exercise: findEx("Cable Curl"),
          sets: 2,
          reps: "12",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Tricep Rope Pushdown"),
          sets: 2,
          reps: "12",
          restSeconds: 60,
          order: 6,
        },
      ],
    },
    {
      title: "Advanced Chest & Back Superset",
      description:
        "Antagonistic superset training for extreme pumps and time efficiency.",
      category: "hypertrophy",
      difficulty: "advanced",
      estimatedDuration: 65,
      tags: ["Chest", "Back", "Supersets", "Advanced", "Hypertrophy"],
      isTemplate: false,
      createdBy: getTrainer(2),
      exercises: [
        {
          exercise: findEx("Incline Dumbbell Press"),
          sets: 4,
          reps: "8-10",
          restSeconds: 90,
          order: 1,
        },
        {
          exercise: findEx("Barbell Bent-Over Row"),
          sets: 4,
          reps: "8-10",
          restSeconds: 90,
          order: 2,
        },
        {
          exercise: findEx("Decline Barbell Press"),
          sets: 3,
          reps: "10",
          restSeconds: 90,
          order: 3,
        },
        {
          exercise: findEx("Lat Pulldown"),
          sets: 3,
          reps: "10",
          restSeconds: 90,
          order: 4,
        },
        {
          exercise: findEx("Cable Crossover"),
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Single-Arm Dumbbell Row"),
          sets: 3,
          reps: "12 per arm",
          restSeconds: 60,
          order: 6,
        },
      ],
    },
    {
      title: "Powerbuilding Core & Conditioning",
      description:
        "Core reinforcement combined with heavy compound conditioning.",
      category: "strength",
      difficulty: "intermediate",
      estimatedDuration: 50,
      tags: [
        "Core",
        "Functional",
        "Conditioning",
        "Powerbuilding",
        "Intermediate",
      ],
      isTemplate: false,
      createdBy: getTrainer(0),
      exercises: [
        {
          exercise: findEx("Conventional Deadlift"),
          sets: 3,
          reps: "5",
          restSeconds: 180,
          order: 1,
        },
        {
          exercise: findEx("Walking Lunges"),
          sets: 3,
          reps: "12 per leg",
          restSeconds: 90,
          order: 2,
        },
        {
          exercise: findEx("Hanging Leg Raises"),
          sets: 4,
          reps: "10-15",
          restSeconds: 60,
          order: 3,
        },
        {
          exercise: findEx("Ab Wheel Rollout"),
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          order: 4,
        },
        {
          exercise: findEx("Cable Woodchoppers"),
          sets: 3,
          reps: "12 per side",
          restSeconds: 60,
          order: 5,
        },
        {
          exercise: findEx("Russian Twists"),
          sets: 3,
          reps: "20 total",
          restSeconds: 45,
          order: 6,
        },
      ],
    },
  ];
};
