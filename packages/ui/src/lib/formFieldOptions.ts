// FILE 타입 항목의 "외부 링크(URL) 제출 허용" 여부를 나타내는 센티널 값.
// 백엔드 폼 필드 DTO 에 별도 플래그가 없어, 문자열 배열인 allowedExtensions 안에
// 이 값을 함께 저장해 admin 의 설정을 전달한다. 실제 파일 확장자가 아니므로
// 확장자 목록을 다룰 때는 반드시 splitAllowedExtensions 로 걸러내고 사용한다.
export const URL_SUBMISSION_FLAG = "url";

// admin 이 FILE 타입 항목에서 허용할 수 있는 제출 파일 확장자 목록
export const ALLOWED_EXTENSION_OPTIONS = [
  "pdf",
  "hwp",
  "hwpx",
  "docx",
  "pptx",
  "xlsx",
  "png",
  "jpg",
  "zip",
] as const;

// allowedExtensions 를 실제 확장자 목록과 URL 허용 여부로 분리한다.
export function splitAllowedExtensions(allowedExtensions?: string[]) {
  const normalized = (allowedExtensions ?? []).map((ext) => ext.toLowerCase());
  return {
    extensions: normalized.filter((ext) => ext !== URL_SUBMISSION_FLAG),
    allowUrl: normalized.includes(URL_SUBMISSION_FLAG),
  };
}

// 외부 링크로 인정하는 형식 — http/https 절대 URL 이고 호스트가 있어야 한다.
export function isValidSubmissionUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return (
      (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname
    );
  } catch {
    return false;
  }
}
