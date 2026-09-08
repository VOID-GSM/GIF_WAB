const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "avif"];

export type PreviewKind = "image" | "pdf" | null;

const getExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex + 1).toLowerCase();
};

// 브라우저가 그대로 그릴 수 있는 형식만 미리보기 대상이다.
// hwp·docx·pptx·xlsx·zip 등은 내려받아야 열 수 있어 기존 파일 카드를 그대로 쓴다.
export const getPreviewKind = (fileName: string): PreviewKind => {
  const extension = getExtension(fileName);
  if (IMAGE_EXTENSIONS.includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  return null;
};

// 서버에 저장된 파일은 원본 파일명이 없으면 경로 마지막(UUID)이 이름이 되어
// 확장자가 아예 없다. 이때는 내려받은 실제 MIME 타입으로 형식을 정한다.
export const getPreviewKindFromMime = (mimeType?: string): PreviewKind => {
  if (!mimeType) return null;
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return null;
};

// 미리보기를 시도해볼 만한지. 확장자가 없어 판별이 불가능한 경우도 포함한다.
export const canAttemptPreview = (fileName: string): boolean =>
  getPreviewKind(fileName) !== null || getExtension(fileName) === "";
