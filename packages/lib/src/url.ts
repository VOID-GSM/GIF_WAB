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

// 링크에 보조 정보로 노출할 호스트명 (www. 제거)
export const getLinkHost = (url: string): string => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
