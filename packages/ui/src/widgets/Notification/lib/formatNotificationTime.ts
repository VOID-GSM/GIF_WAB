const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

// 알림 목록은 최신순이라 최근 항목일수록 상대 시간이 읽기 쉽다.
// 일주일이 넘어가면 상대 표기가 오히려 헷갈려서 날짜로 보여준다.
export const formatNotificationTime = (createdAt: string): string => {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "";

  const diff = Date.now() - created.getTime();
  if (diff < MINUTE) return "방금 전";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < DAY * 7) return `${Math.floor(diff / DAY)}일 전`;

  return created.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
