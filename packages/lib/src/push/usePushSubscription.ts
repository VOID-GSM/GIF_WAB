"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deletePushSubscription,
  getVapidPublicKey,
  postPushSubscription,
} from "./api";
import {
  hasSameApplicationServerKey,
  isPushSupported,
  registerPushServiceWorker,
  toCreatePushSubscriptionRequest,
  urlBase64ToUint8Array,
} from "./lib";

// 이미 허용된 기기는 서버 구독 정보가 유실됐을 수 있어 한 번 다시 등록해 동기화한다.
// 탭마다 한 번이면 충분해서 sessionStorage 로 중복 호출을 막는다.
const SYNC_FLAG_KEY = "gif:push-subscription-synced";

const subscribeOnDevice = async (): Promise<PushSubscription> => {
  const registration = await registerPushServiceWorker();
  const applicationServerKey = urlBase64ToUint8Array(await getVapidPublicKey());

  let subscription = await registration.pushManager.getSubscription();

  if (subscription && !hasSameApplicationServerKey(subscription, applicationServerKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  return (
    subscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }))
  );
};

export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isActive = true;

    const syncSubscription = async () => {
      if (!isPushSupported()) {
        setIsChecking(false);
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      if (Notification.permission !== "granted") {
        setIsChecking(false);
        return;
      }

      try {
        const registration = await registerPushServiceWorker();
        const subscription = await registration.pushManager.getSubscription();
        if (!isActive) return;

        setIsSubscribed(Boolean(subscription));

        if (subscription && !sessionStorage.getItem(SYNC_FLAG_KEY)) {
          await postPushSubscription(
            toCreatePushSubscriptionRequest(subscription),
          );
          sessionStorage.setItem(SYNC_FLAG_KEY, "true");
        }
      } catch {
        // 초기 동기화 실패는 조용히 넘기고 사용자가 직접 다시 켤 수 있게 둔다.
      } finally {
        if (isActive) setIsChecking(false);
      }
    };

    syncSubscription();

    return () => {
      isActive = false;
    };
  }, []);

  const { mutateAsync: enableMutate, isPending: isEnabling } = useMutation({
    mutationFn: async () => {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        throw new Error("permission-not-granted");
      }

      const subscription = await subscribeOnDevice();
      await postPushSubscription(toCreatePushSubscriptionRequest(subscription));
      sessionStorage.setItem(SYNC_FLAG_KEY, "true");
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast.success("이 기기에서 알림을 받습니다.");
    },
    onError: (error: Error) => {
      if (error.message === "permission-not-granted") {
        toast.error("브라우저에서 알림 권한을 허용해주세요.");
        return;
      }
      toast.error("기기 알림을 켜지 못했습니다. 다시 시도해주세요.");
    },
  });

  const { mutateAsync: disableMutate, isPending: isDisabling } = useMutation({
    mutationFn: async () => {
      const registration = await registerPushServiceWorker();
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      await deletePushSubscription({ endpoint: subscription.endpoint });
      await subscription.unsubscribe();
      sessionStorage.removeItem(SYNC_FLAG_KEY);
    },
    onSuccess: () => {
      setIsSubscribed(false);
      toast.success("이 기기에서 알림을 끕니다.");
    },
    onError: () => {
      toast.error("기기 알림을 끄지 못했습니다. 다시 시도해주세요.");
    },
  });

  const isPending = isEnabling || isDisabling;

  const togglePush = useCallback(async () => {
    if (isPending) return;

    if (isSubscribed) {
      await disableMutate().catch(() => undefined);
      return;
    }

    if (permission === "denied") {
      toast.error("브라우저 설정에서 이 사이트의 알림 차단을 해제해주세요.");
      return;
    }

    await enableMutate().catch(() => undefined);
  }, [disableMutate, enableMutate, isPending, isSubscribed, permission]);

  return {
    isSupported,
    isSubscribed,
    isChecking,
    isPending,
    permission,
    togglePush,
  };
}
