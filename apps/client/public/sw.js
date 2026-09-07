/*
 * Web Push 서비스 워커.
 * Next.js 는 public 디렉터리만 정적 서빙하므로 admin/client 각각에 같은 파일을 둔다.
 * 한쪽을 고치면 apps/admin/public/sw.js 와 apps/client/public/sw.js 를 함께 맞춰야 한다.
 */

// 새로 배포된 워커가 다음 방문까지 기다리지 않고 바로 푸시를 받도록 한다.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const parsePayload = (event) => {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
};

self.addEventListener("push", (event) => {
  const payload = parsePayload(event);
  const title = payload.title || "GIF 알림";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/logo.png",
      badge: "/logo.png",
      // 같은 알림이 중복 수신돼도 한 개만 보이도록 id 를 태그로 쓴다.
      tag: payload.tag || `gif-notification-${payload.id ?? Date.now()}`,
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // 이미 열려 있는 탭이 있으면 새 창 대신 그 탭을 재사용한다.
      const sameUrlClient = clientList.find((client) => client.url === targetUrl);
      if (sameUrlClient) return sameUrlClient.focus();

      const openedClient = clientList[0];
      if (openedClient) {
        await openedClient.focus();
        if ("navigate" in openedClient) return openedClient.navigate(targetUrl);
        return undefined;
      }

      return self.clients.openWindow(targetUrl);
    })(),
  );
});
