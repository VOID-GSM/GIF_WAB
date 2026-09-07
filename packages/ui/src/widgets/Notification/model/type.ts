export type NotificationPanelAlign = "left" | "right";

export interface NotificationBellProps {
  // 사이드바(왼쪽 고정)와 모바일 헤더(오른쪽 끝)에서 패널이 화면 밖으로 나가지 않도록
  // 여는 방향을 호출부에서 지정한다.
  align?: NotificationPanelAlign;
  className?: string;
}

export interface NotificationPanelProps {
  align: NotificationPanelAlign;
  onClose: () => void;
}
