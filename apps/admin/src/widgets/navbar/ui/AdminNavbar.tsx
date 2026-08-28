"use client";

import { Navbar, ADMIN_NAV_ITEMS } from "@repo/ui";

import { useGetMyInfo } from "@/entities/mypage";
import { PRIVILEGED_ADMIN_EMAIL } from "@/shared/constants";

export default function AdminNavbar() {
  const { data: myInfo } = useGetMyInfo();
  const canManageInquiry = myInfo?.email === PRIVILEGED_ADMIN_EMAIL;
  // 선생님 관리는 아이디어페스티벌 담당(MASTER)만 사이드바에서 볼 수 있다.
  const isMaster = myInfo?.adminRole === "MASTER";

  const navItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.path === "/inquiry/admin") return canManageInquiry;
    if (item.path === "/teachers") return isMaster;
    return true;
  });

  return <Navbar navItems={navItems} />;
}
