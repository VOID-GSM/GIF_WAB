"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getNotifications } from "./api";

export const NOTIFICATION_QUERY_KEY = ["notifications"];
export const NOTIFICATION_PAGE_SIZE = 15;

export function useGetNotifications(enabled = true) {
  return useInfiniteQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, "list"],
    queryFn: ({ pageParam }) =>
      getNotifications({ page: pageParam, size: NOTIFICATION_PAGE_SIZE }),
    initialPageParam: 0,
    // Slice 응답은 전체 개수 없이 last 플래그만 주므로 그것으로 다음 페이지를 판단한다.
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled,
  });
}
