// POST /api/push/subscribe — 브라우저 PushSubscription 등록
export interface CreatePushSubscriptionRequest {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// DELETE /api/push/unsubscribe — 구독 해제
export interface DeletePushSubscriptionRequest {
  endpoint: string;
}

// GET /api/push/vapid-key — { publicKey: "..." } 형태의 단일 문자열 맵
export type VapidKeyResponse = Record<string, string>;
