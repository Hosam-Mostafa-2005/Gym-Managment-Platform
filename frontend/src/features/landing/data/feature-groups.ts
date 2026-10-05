// src/features/landing/data/feature-groups.ts
import {
  Users,
  LayoutDashboard,
  Dumbbell,
  Activity,
  Ruler,
  Bell,
  LineChart,
} from "lucide-react";

export const featureGroups = [
  {
    category: "OPERATIONS",
    features: [
      { name: "Members Management", icon: Users },
      { name: "Program Assignments", icon: LayoutDashboard },
    ],
  },
  {
    category: "TRAINING",
    features: [
      { name: "Exercise Library", icon: Dumbbell },
      { name: "Workout Builder", icon: Dumbbell },
      { name: "Workout Sessions", icon: Activity },
    ],
  },
  {
    category: "PROGRESS",
    features: [
      { name: "Body Measurements", icon: Ruler },
      { name: "Member Insights", icon: LineChart }, // Handled dynamically in component
    ],
  },
  {
    category: "COMMUNICATION",
    features: [
      { name: "Real-time Notifications", icon: Bell },
      { name: "Status Indicators", icon: Activity },
    ],
  },
];
