// 사용자는 "github.com/void" 처럼 프로토콜 없이 입력하는 경우가 많아 https 를 보충한다.
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

// 프로토콜을 보충한 뒤에도 URL 로 해석되지 않으면 잘못된 주소로 본다.
export const isValidUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(normalizeUrl(url));
    // "https://" 만 남는 입력(호스트 없음)이나 점 없는 호스트는 주소로 취급하지 않는다.
    return hostname.includes(".");
  } catch {
    return false;
  }
};

// 호스트 뒤에 붙는 경로·쿼리. 링크를 호스트와 나눠 보여줄 때 아랫줄로 쓴다.
// 루트 주소("https://canva.com/")처럼 경로가 없으면 빈 문자열.
export const getLinkPath = (url: string): string => {
  try {
    const { pathname, search } = new URL(normalizeUrl(url));
    const path = `${pathname}${search}`;
    return path === "/" ? "" : path;
  } catch {
    return "";
  }
};

// 링크에 보조 정보로 노출할 호스트명 (www. 제거)
export const getLinkHost = (url: string): string => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// 외부 링크 제출인지 판별한다.
// 업로드된 파일도 API 서버의 절대 URL(https://api.../files/form/xxx.png)로 내려오기 때문에
// "http(s) 절대 URL 인가" 만으로는 사용자가 붙여넣은 링크와 구분되지 않는다.
// API 서버가 아닌 곳을 가리켜야 외부 링크다.
export const isExternalSubmissionUrl = (url: string): boolean => {
  try {
    const target = new URL(url);
    if (target.protocol !== "http:" && target.protocol !== "https:") return false;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBaseUrl) return true;

    return target.origin !== new URL(apiBaseUrl).origin;
  } catch {
    return false;
  }
};

// 서버가 내려준 파일 경로를 실제로 받아올 수 있는 절대 URL 로 바꾼다.
// 이미 절대 URL(외부 링크 제출 등)이면 그대로 둔다.
export const resolveApiFileUrl = (filePath: string): string => {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};
