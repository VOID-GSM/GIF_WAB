// 알림 센터는 최근 것만 보여준다. 오래된 알림은 이미 처리된 경우가 대부분이라
// 목록에 남아 있으면 새 알림을 찾기 어려워진다.
export const NOTIFICATION_RETENTION_DAYS = 7;

const RETENTION_MS = NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const isWithinNotificationRetention = (createdAt: string): boolean => {
  const created = new Date(createdAt).getTime();
  // 날짜를 해석하지 못하면 임의로 숨기지 않고 그대로 보여준다.
  if (Number.isNaN(created)) return true;
  return Date.now() - created <= RETENTION_MS;
};
