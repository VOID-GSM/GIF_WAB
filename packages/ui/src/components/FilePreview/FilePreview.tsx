"use client";

import {
  canAttemptPreview,
  getPreviewKind,
  getPreviewKindFromMime,
} from "./lib";
import { useFileObjectUrl } from "./useFileObjectUrl";

interface FilePreviewProps {
  /** 아직 업로드하지 않고 방금 고른 파일 */
  file?: File | null;
  /** 서버에 저장된 파일 경로 */
  filePath?: string;
  fileName: string;
}

// 이미지·PDF 만 그린다. 그 외 형식이면 null 을 돌려주고 호출부의 파일 카드만 남는다.
export default function FilePreview({
  file,
  filePath,
  fileName,
}: FilePreviewProps) {
  const source = file ?? filePath;
  const { objectUrl, mimeType, status } = useFileObjectUrl(
    source ?? undefined,
    canAttemptPreview(fileName),
  );

  // 파일명으로 먼저 정하고, 확장자가 없으면 내려받은 MIME 타입으로 판별한다.
  const kind = getPreviewKind(fileName) ?? getPreviewKindFromMime(mimeType);

  if (!source || !canAttemptPreview(fileName)) return null;
  // 받아보니 그릴 수 없는 형식이면 아무것도 그리지 않는다.
  if (status === "ready" && !kind) return null;

  if (status === "error") {
    return (
      <div className="flex h-[120px] items-center justify-center bg-gray-100 px-4 text-center text-[12px] text-gray-500">
        미리보기를 불러오지 못했어요. 내려받아서 확인해주세요.
      </div>
    );
  }

  if (status !== "ready" || !objectUrl) {
    return (
      <div className="flex h-[120px] items-center justify-center bg-gray-100 text-[12px] text-gray-500">
        미리보기 불러오는 중
      </div>
    );
  }

  if (kind === "image") {
    return (
      <a
        href={objectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gray-100"
        aria-label={`${fileName} 원본 크기로 보기`}
      >
        {/* blob object URL 이라 next/image 최적화 대상이 아니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={objectUrl}
          alt={fileName}
          className="mx-auto max-h-[320px] w-auto max-w-full object-contain"
        />
      </a>
    );
  }

  return (
    <iframe
      src={objectUrl}
      title={`${fileName} 미리보기`}
      className="h-[280px] w-full bg-gray-100 sm:h-[420px]"
    />
  );
}
