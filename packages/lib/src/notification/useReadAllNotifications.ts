"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getNotifications, patchNotificationRead } from "./api";
import { NOTIFICATION_QUERY_KEY } from "./useGetNotifications";

// 서버에 일괄 읽음 API 가 없어서 안 읽은 알림을 모아 개별로 읽음 처리한다.
//
// 목록은 보관 기간(7일)만 보여주지만 읽음 처리는 기간을 가리지 않는다.
// 헤더 배지가 쓰는 unread-count 는 기간 제한 없는 전체 개수라서,
// 7일 이내만 읽음 처리하면 "모두 읽기"를 눌러도 배지가 그대로 남는다.
const UNREAD_SWEEP_PAGE_SIZE = 100;
// 응답이 비정상일 때 무한 루프에 빠지지 않도록 조회 페이지 수에 상한을 둔다.
const MAX_SWEEP_PAGES = 20;
// 한 번에 수백 건을 동시에 PATCH 하지 않도록 나눠서 보낸다.
const READ_REQUEST_CHUNK_SIZE = 10;

const collectUnreadNotificationIds = async (): Promise<number[]> => {
  const unreadIds: number[] = [];

  for (let page = 0; page < MAX_SWEEP_PAGES; page += 1) {
    const slice = await getNotifications({
      page,
      size: UNREAD_SWEEP_PAGE_SIZE,
    });

    slice.content
      .filter(({ isRead }) => !isRead)
      .forEach(({ id }) => unreadIds.push(id));

    if (slice.last) break;
  }

  return unreadIds;
};

const readNotificationsInChunks = async (ids: number[]) => {
  for (let index = 0; index < ids.length; index += READ_REQUEST_CHUNK_SIZE) {
    const chunk = ids.slice(index, index + READ_REQUEST_CHUNK_SIZE);
    await Promise.all(chunk.map(patchNotificationRead));
  }
};

export function useReadAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const unreadIds = await collectUnreadNotificationIds();
      await readNotificationsInChunks(unreadIds);
      return unreadIds.length;
    },
    onSuccess: (readCount) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      toast.success(
        readCount > 0
          ? "모든 알림을 읽음 처리했어요."
          : "읽지 않은 알림이 없어요.",
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      toast.error("알림을 읽음 처리하지 못했어요. 다시 시도해주세요.");
    },
  });
}
