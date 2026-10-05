// src/features/landing/data/coach-journey.ts
import {
  Users,
  ClipboardList,
  Dumbbell,
  Activity,
  Ruler,
  LineChart,
} from "lucide-react";

export const coachJourney = [
  {
    step: "01",
    title: "Members",
    description: "View your active roster and monitor athlete status globally.",
    icon: Users,
  },
  {
    step: "02",
    title: "Assignments",
    description: "Assign targeted training plans and periodized blocks.",
    icon: ClipboardList,
  },
  {
    step: "03",
    title: "Workouts",
    description: "Program custom routines using the exercise library.",
    icon: Dumbbell,
  },
  {
    step: "04",
    title: "Sessions",
    description: "Athletes execute and log the programmed sessions.",
    icon: Activity,
  },
  {
    step: "05",
    title: "Measurements",
    description: "Record body metrics and physiological baselines.",
    icon: Ruler,
  },
  {
    step: "06",
    title: "Insights",
    description: "Analyze compliance and adapt future programming.",
    icon: LineChart,
  },
];
