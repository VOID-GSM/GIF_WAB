import type { CreatePushSubscriptionRequest } from "./types";

export const SERVICE_WORKER_PATH = "/sw.js";

// 서비스 워커 + PushManager + Notification 이 모두 있어야 Web Push 를 쓸 수 있다.
// (iOS Safari 는 홈 화면에 추가한 PWA 에서만 PushManager 가 노출된다.)
export const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// VAPID 공개키는 URL-safe base64 라서 subscribe 에 넘기기 전 바이트 배열로 바꿔야 한다.
// applicationServerKey 는 SharedArrayBuffer 를 허용하지 않으므로 ArrayBuffer 로 직접 만든다.
export const urlBase64ToUint8Array = (
  base64String: string,
): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// 새로 설치된 워커가 활성화되기 전에 pushManager 를 건드리면 실패하므로 ready 까지 기다린다.
export const registerPushServiceWorker =
  async (): Promise<ServiceWorkerRegistration> => {
    await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" });
    return navigator.serviceWorker.ready;
  };

export const toCreatePushSubscriptionRequest = (
  subscription: PushSubscription,
): CreatePushSubscriptionRequest => {
  const { endpoint, keys } = subscription.toJSON();

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("푸시 구독 정보를 읽지 못했습니다.");
  }

  return { endpoint, p256dh: keys.p256dh, auth: keys.auth };
};

const toBytes = (key: ArrayBuffer | null | undefined): Uint8Array | null =>
  key ? new Uint8Array(key) : null;

// 서버 VAPID 키가 교체되면 기존 구독은 더 이상 유효하지 않아 재구독해야 한다.
export const hasSameApplicationServerKey = (
  subscription: PushSubscription,
  applicationServerKey: Uint8Array,
): boolean => {
  const current = toBytes(subscription.options?.applicationServerKey);
  if (!current) return false;
  if (current.length !== applicationServerKey.length) return false;
  return current.every((byte, index) => byte === applicationServerKey[index]);
};
