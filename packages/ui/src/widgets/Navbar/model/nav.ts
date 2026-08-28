import { NavItem } from "@repo/ui";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "메인", path: "/" },
  { label: "공지", path: "/notice" },
  { label: "양식", path: "/form" },
  { label: "등수", path: "/rank" },
  { label: "점수", path: "/score" },
  { label: "선생님 관리", path: "/teachers" },
  { label: "문의", path: "/inquiry" },
  { label: "문의 관리", path: "/inquiry/admin" },
];

export const CLIENT_NAV_ITEMS: NavItem[] = [
  { label: "메인", path: "/" },
  { label: "공지", path: "/notice" },
  { label: "양식", path: "/form" },
  { label: "등수", path: "/rank" },
  { label: "문의", path: "/inquiry" },
];
