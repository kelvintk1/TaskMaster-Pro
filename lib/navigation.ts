import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  CheckCircle2,
  CircleDashed,
  CalendarRange,
  Settings,
} from "lucide-react";

export type MainNavItem = {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { id: "tasks", label: "Tasks", href: "/", Icon: ClipboardList },
  { id: "completed", label: "Completed", href: "/completed", Icon: CheckCircle2 },
  { id: "uncompleted", label: "Uncompleted", href: "/uncompleted", Icon: CircleDashed },
  { id: "timetable", label: "Timetable", href: "/timetable", Icon: CalendarRange },
  { id: "settings", label: "Settings", href: "/settings", Icon: Settings },
];

export function getActiveNavId(pathname: string): string {
  const match = MAIN_NAV_ITEMS.find((item) => item.href === pathname);
  return match?.id ?? "tasks";
}
