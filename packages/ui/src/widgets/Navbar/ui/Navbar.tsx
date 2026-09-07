"use client";
import { useState } from "react";

import { Sidebar } from "@repo/ui";
import { NavbarProps } from "@repo/ui";
import { Menu } from "@repo/ui";
import NotificationBell from "../../Notification/ui/NotificationBell";
import { useGetScoreNotice } from "@repo/lib";

export default function Navbar({ navItems }: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: notice } = useGetScoreNotice();
  const isRankPublished = notice?.isPublished ?? false;

  const filteredNavItems = navItems.filter((item) => {
    if (item.path !== "/rank") return true;
    return isRankPublished;
  });

  return (
    <>
      <div className="fixed top-0 left-0 z-40 flex h-14 w-full items-center bg-background px-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex cursor-pointer items-center justify-center"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>

        <NotificationBell align="right" className="ml-auto" />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/5 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        navItems={filteredNavItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
