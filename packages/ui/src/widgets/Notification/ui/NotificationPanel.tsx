"use client";

import { useRouter } from "next/navigation";

import type { GetNotificationResponse } from "@repo/lib";
import {
  NOTIFICATION_RETENTION_DAYS,
  isWithinNotificationRetention,
  useGetNotificationUnreadCount,
  useGetNotifications,
  usePushSubscription,
  useReadAllNotifications,
  useReadNotification,
} from "@repo/lib";

import type { NotificationPanelProps } from "../model/type";
import NotificationItem from "./NotificationItem";

export default function NotificationPanel({
  align,
  onClose,
}: NotificationPanelProps) {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetNotifications();
  const { data: unreadCountData } = useGetNotificationUnreadCount();
  const { mutate: readNotification } = useReadNotification();
  const { mutate: readAllNotifications, isPending: isReadingAll } =
    useReadAllNotifications();
  const { isSupported, isSubscribed, isChecking, isPending, togglePush } =
    usePushSubscription();

  const loadedNotifications = data?.pages.flatMap((page) => page.content) ?? [];
  const notifications = loadedNotifications.filter(({ createdAt }) =>
    isWithinNotificationRetention(createdAt),
  );

  // 목록이 최신순이라 보관 기간을 벗어난 항목이 한 번 나오면 그 뒤는 모두 오래된 알림이다.
  const hasExpiredNotification =
    loadedNotifications.length !== notifications.length;
  const canLoadMore = hasNextPage && !hasExpiredNotification;

  const unreadCount = unreadCountData?.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;
  // 배지의 안 읽음 개수는 기간 제한이 없어서, 목록이 비었는데 배지만 남는 상황이 생긴다.
  // 왜 그런지와 어떻게 정리하는지를 빈 목록에서 안내한다.
  const hasOnlyExpiredUnread = hasUnread && notifications.length === 0;

  // 읽음 처리는 서버 응답을 기다리지 않고, 이동할 경로가 있으면 바로 넘어간다.
  const handleSelect = ({ id, isRead, url }: GetNotificationResponse) => {
    if (!isRead) readNotification(id);
    if (!url) return;

    onClose();
    router.push(url);
  };

  return (
    <div
      role="dialog"
      aria-label="알림"
      className={`absolute top-[calc(100%+8px)] z-[110] flex max-h-[440px] w-[calc(100vw-32px)] max-w-[340px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-new ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      <div className="shrink-0 border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">
            알림
            <span className="ml-1.5 text-[11px] font-medium text-gray-500">
              최근 {NOTIFICATION_RETENTION_DAYS}일
            </span>
          </h2>

          <button
            type="button"
            onClick={() => readAllNotifications()}
            disabled={!hasUnread || isReadingAll}
            className="cursor-pointer rounded-md px-1.5 py-1 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            {isReadingAll ? "처리 중..." : "모두 읽기"}
          </button>
        </div>

        {isSupported && (
          <button
            type="button"
            onClick={togglePush}
            disabled={isChecking || isPending}
            aria-pressed={isSubscribed}
            className="mt-2 cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubscribed ? "기기 알림 끄기" : "기기 알림 받기"}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <p className="px-4 py-10 text-center text-[13px] text-gray-500">
            알림을 불러오는 중이에요.
          </p>
        )}

        {isError && (
          <p className="px-4 py-10 text-center text-[13px] text-gray-500">
            알림을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="px-4 py-10 text-center text-[13px] text-gray-500">
            <p>최근 {NOTIFICATION_RETENTION_DAYS}일 동안 도착한 알림이 없어요.</p>
            {hasOnlyExpiredUnread && (
              <p className="mt-1 text-[12px] text-gray-400">
                {NOTIFICATION_RETENTION_DAYS}일이 지난 안 읽은 알림 {unreadCount}
                건은 모두 읽기로 정리할 수 있어요.
              </p>
            )}
          </div>
        )}

        {notifications.length > 0 && (
          <ul>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}

        {canLoadMore && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full cursor-pointer border-t border-gray-100 px-4 py-3 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? "불러오는 중..." : "이전 알림 더 보기"}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 cursor-pointer border-t border-gray-100 px-4 py-2 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
      >
        닫기
      </button>
    </div>
  );
}
