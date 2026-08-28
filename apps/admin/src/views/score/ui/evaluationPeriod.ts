// 보고서 영역 평가 시작일 설정 — EvaluationPeriodBar(입력)와 EvaluationPeriodBadge(조회)가 공유하는 타입·유틸.

// POST /api/score/period 스펙과 동일한 모양으로 맞춰둔다.
export interface EvaluationPeriodPayload {
  category: "REPORT";
  startDate: string; // ISO 8601
}

export function formatKoreanDateTime(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일 ${timeStr}`;
}

// 날짜(YYYY-MM-DD) + 시각(HH:mm) 로컬 입력값을 ISO 8601(UTC) 문자열로 변환한다.
export function toIsoStartDate(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

// ISO 문자열을 로컬 타임존 기준 "YYYY년 M월 D일 HH:mm"으로 되돌린다.
export function formatIsoKoreanDateTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${hh}:${mm}`;
}

// 조회용 GET 엔드포인트가 없어서 정확한 설정값 자체는 알 수 없다. 대신 "이 브라우저에서
// 설정을 완료했거나, 이미 다른 담당자가 설정해둔 걸 확인했다"는 사실만 기억해 뒀다가
// 안내 문구("설정이 완료되었습니다")만 보여준다 — 날짜·시간 값을 캐시하지 않으므로
// useSyncExternalStore 스냅샷도 boolean이라 별도 참조 캐싱이 필요 없다.
const PERIOD_SET_STORAGE_KEY = "score_report_period_set";

export function getIsPeriodSetSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PERIOD_SET_STORAGE_KEY) === "1";
}

export function markPeriodAsSet() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERIOD_SET_STORAGE_KEY, "1");
  window.dispatchEvent(new Event("storage"));
}
