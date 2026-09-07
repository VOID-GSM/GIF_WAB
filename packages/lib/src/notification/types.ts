// GET /api/notifications — 알림 단건
export interface GetNotificationResponse {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  // 이동할 서비스 내 경로. 현재 서버 응답에는 없어서 선택 필드로 두고,
  // 값이 있을 때만 알림 클릭 시 해당 경로로 이동한다. (푸시 payload 의 url 과 동일한 용도)
  url?: string;
}

// Spring Slice 응답 (알림 목록은 total count 없이 다음 페이지 유무만 내려온다)
export interface SliceGetNotificationResponse {
  content: GetNotificationResponse[];
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// GET /api/notifications/unread-count — 안 읽은 알림 개수
export interface GetNotificationUnreadCountResponse {
  unreadCount: number;
}

export interface GetNotificationsParams {
  page: number;
  size: number;
}
