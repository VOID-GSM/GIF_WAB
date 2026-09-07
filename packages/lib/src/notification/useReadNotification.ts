"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchNotificationRead } from "./api";
import { NOTIFICATION_QUERY_KEY } from "./useGetNotifications";

export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    },
  });
}
