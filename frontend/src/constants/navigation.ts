import {
  Home,
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  ClipboardCheck,
  Activity,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Exercises",
    href: "/exercises",
    icon: Dumbbell,
  },
  {
    title: "Workouts",
    href: "/workouts",
    icon: ClipboardList,
  },
  {
    title: "Assignments",
    href: "/assignments",
    icon: ClipboardCheck,
  },
  {
    title: "Sessions",
    href: "/sessions",
    icon: Activity,
  },
];
