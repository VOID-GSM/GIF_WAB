"use client";

import { useQuery } from "@tanstack/react-query";

import { getNotificationUnreadCount } from "./api";
import { NOTIFICATION_QUERY_KEY } from "./useGetNotifications";

// 헤더 배지는 패널을 열지 않아도 최신값이어야 해서 주기적으로 갱신한다.
const UNREAD_COUNT_REFETCH_INTERVAL = 1000 * 60;

export function useGetNotificationUnreadCount(enabled = true) {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, "unread-count"],
    queryFn: getNotificationUnreadCount,
    refetchInterval: UNREAD_COUNT_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    enabled,
  });
}
