import { apiClient } from "../axios";

import type {
  CreatePushSubscriptionRequest,
  DeletePushSubscriptionRequest,
  VapidKeyResponse,
} from "./types";

// 서버가 키 이름을 확정하지 않은 맵(Map<String, String>)으로 내려주므로
// 알려진 후보를 우선 확인하고, 없으면 첫 번째 문자열 값을 공개키로 사용한다.
const VAPID_KEY_CANDIDATES = [
  "publicKey",
  "vapidPublicKey",
  "vapidKey",
  "key",
] as const;

export const getVapidPublicKey = async (): Promise<string> => {
  const { data } = await apiClient.get<VapidKeyResponse>("/api/push/vapid-key");

  const publicKey =
    VAPID_KEY_CANDIDATES.map((candidate) => data?.[candidate]).find(Boolean) ??
    Object.values(data ?? {}).find(
      (value) => typeof value === "string" && value.length > 0,
    );

  if (!publicKey) {
    throw new Error("VAPID 공개키를 받아오지 못했습니다.");
  }

  return publicKey;
};

export const postPushSubscription = async (
  body: CreatePushSubscriptionRequest,
): Promise<void> => {
  await apiClient.post("/api/push/subscribe", body);
};

export const deletePushSubscription = async (
  body: DeletePushSubscriptionRequest,
): Promise<void> => {
  await apiClient.delete("/api/push/unsubscribe", { data: body });
};
