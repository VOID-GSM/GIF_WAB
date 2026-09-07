import { apiClient } from "../axios";

import type {
  GetNotificationUnreadCountResponse,
  GetNotificationsParams,
  SliceGetNotificationResponse,
} from "./types";

export const getNotifications = async ({
  page,
  size,
}: GetNotificationsParams): Promise<SliceGetNotificationResponse> => {
  const { data } = await apiClient.get<SliceGetNotificationResponse>(
    "/api/notifications",
    { params: { page, size } },
  );
  return data;
};

export const getNotificationUnreadCount =
  async (): Promise<GetNotificationUnreadCountResponse> => {
    const { data } = await apiClient.get<GetNotificationUnreadCountResponse>(
      "/api/notifications/unread-count",
    );
    return data;
  };

export const patchNotificationRead = async (
  notificationId: number,
): Promise<void> => {
  await apiClient.patch(`/api/notifications/${notificationId}/read`);
};
