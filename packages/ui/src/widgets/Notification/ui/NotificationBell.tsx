"use client";

import { useEffect, useRef, useState } from "react";

import { useGetNotificationUnreadCount } from "@repo/lib";

import Bell from "../../../svg/Bell";
import type { NotificationBellProps } from "../model/type";
import NotificationPanel from "./NotificationPanel";

const MAX_BADGE_COUNT = 99;

export default function NotificationBell({
  align = "left",
  className = "",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useGetNotificationUnreadCount();
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0 ? `알림 ${unreadCount}건 읽지 않음` : "알림"
        }
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 ${
          unreadCount > 0 ? "text-gray-900" : "text-gray-600"
        }`}
      >
        <Bell className="h-[22px] w-[22px]" aria-hidden="true" />

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-yellow-300 px-1 text-[10px] leading-none font-bold text-gray-900">
            {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel align={align} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
