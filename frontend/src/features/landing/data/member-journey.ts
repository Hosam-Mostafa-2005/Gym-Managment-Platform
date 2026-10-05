// src/features/landing/data/member-journey.ts
import {
  BellRing,
  PlayCircle,
  Edit3,
  TrendingUp,
  CheckSquare,
} from "lucide-react";

export const memberJourney = [
  {
    step: "01",
    title: "Assignment Received",
    description: "Get notified when a new training block is assigned.",
    icon: BellRing,
  },
  {
    step: "02",
    title: "Workout Available",
    description: "Review upcoming prescribed exercises and targets.",
    icon: CheckSquare,
  },
  {
    step: "03",
    title: "Workout Session",
    description: "Perform the workout using the live session tracker.",
    icon: PlayCircle,
  },
  {
    step: "04",
    title: "Progress Logging",
    description: "Record sets, reps, and body measurements seamlessly.",
    icon: Edit3,
  },
  {
    step: "05",
    title: "Analytics",
    description: "Track personal volume and consistency over time.",
    icon: TrendingUp,
  },
];
