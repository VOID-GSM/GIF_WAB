"use client";

import type { GetNotificationResponse } from "@repo/lib";

import { formatNotificationTime } from "../lib/formatNotificationTime";

interface NotificationItemProps {
  notification: GetNotificationResponse;
  onSelect: (notification: GetNotificationResponse) => void;
}

export default function NotificationItem({
  notification,
  onSelect,
}: NotificationItemProps) {
  const { title, body, isRead, createdAt, url } = notification;

  // 읽은 알림이어도 이동할 경로가 있으면 다시 눌러 이동할 수 있어야 한다.
  const isInteractive = !isRead || Boolean(url);

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelect(notification)}
        disabled={!isInteractive}
        aria-label={isRead ? title : `${title} (읽지 않음)`}
        className={`flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors ${
          isRead
            ? "bg-white hover:bg-gray-100 disabled:cursor-default disabled:hover:bg-white"
            : "bg-yellow-50 hover:bg-yellow-100"
        } ${isInteractive ? "cursor-pointer" : ""}`}
      >
        <div className="flex w-full items-center gap-2">
          {!isRead && (
            <span
              aria-hidden="true"
              className="h-[6px] w-[6px] shrink-0 rounded-full bg-yellow-700"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-gray-900">
            {title}
          </span>
          <span className="shrink-0 text-[11px] text-gray-500">
            {formatNotificationTime(createdAt)}
          </span>
        </div>

        {body && (
          <p className="w-full text-[13px] leading-[1.5] whitespace-pre-wrap text-gray-600">
            {body}
          </p>
        )}
      </button>
    </li>
  );
}
