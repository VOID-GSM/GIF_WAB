"use client";
import { useState } from "react";
import { SubmitAnswer } from "@/entities/from-management/model/type";
import {
  File,
  FilePreview,
  SubmittedLinkCard,
  canAttemptPreview,
} from "@repo/ui";
import { isExternalSubmissionUrl } from "@repo/lib";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 상대 경로면 API 주소를 붙여 절대 URL로 만든다
function resolveFileUrl(filePath: string) {
  if (/^https?:\/\//.test(filePath)) return filePath;
  return `${BASE_URL ?? ""}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
}

export default function FileAnswer({
  answer,
}: {
  answer: SubmitAnswer | undefined;
}) {
  const [downloading, setDownloading] = useState(false);

  const rawFilePath = answer?.filePath;
  // 파일 대신 외부 링크(URL)로 제출한 경우 링크는 textAnswer 로 내려오며,
  // 서버 필수 검사를 통과시키려고 filePath 에도 같은 URL 을 함께 저장한다.
  // 따라서 filePath 가 외부 URL 이면 업로드 파일이 아니라 링크로 표시한다.
  const isExternalPath = !!rawFilePath && isExternalSubmissionUrl(rawFilePath);
  const filePath = isExternalPath ? undefined : rawFilePath;
  const submittedUrl =
    answer?.textAnswer?.trim() || (isExternalPath ? rawFilePath : undefined);

  if (!filePath) {
    if (submittedUrl) {
      return <SubmittedLinkCard url={submittedUrl} />;
    }
    return <span className="text-gray-400">파일 없음</span>;
  }

  // 서버에 저장된 원본 파일명을 우선 사용하고, 없으면 경로 마지막(UUID)으로 폴백
  const fileName =
    answer?.originalFileName || filePath.split("/").pop() || "file";
  const fileUrl = resolveFileUrl(filePath);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // a[download]는 교차 출처에서 무시되므로 blob으로 받아 강제 저장
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`다운로드 실패: ${res.status}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // blob 다운로드 실패 시(CORS 등) 새 탭으로 열기
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  // 이미지·PDF 는 내려받지 않고 바로 확인할 수 있게 미리보기로 보여준다.
  // 미리보기가 곧 파일이라 아래에 파일 카드를 겹치지 않고 이름만 캡션으로 적는다.
  if (canAttemptPreview(fileName)) {
    return (
      <div className="w-full">
        <div className="overflow-hidden rounded-[10px] border border-gray-80">
          <FilePreview filePath={filePath} fileName={fileName} />
        </div>

        <div className="mt-2 flex items-baseline gap-2 text-[12px]">
          <span className="min-w-0 truncate font-medium text-gray-700">
            {fileName}
          </span>
          <span className="flex-shrink-0 text-gray-400">
            {answer?.fileSize
              ? `${(answer.fileSize / 1024 / 1024).toFixed(1)}MB`
              : ""}
          </span>

          {/* 미리보기만으로는 원본을 받을 수 없으므로 내려받기는 항상 노출한다. */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="ml-auto flex-shrink-0 cursor-pointer font-medium text-gray-700 underline underline-offset-2 transition-colors hover:text-gray-900 disabled:cursor-default disabled:opacity-60"
          >
            {downloading ? "내려받는 중..." : "내려받기"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="flex w-full items-center justify-between rounded-[10px] border border-gray-80 pl-[24px] pr-[30px] py-[15px] text-left cursor-pointer transition-colors hover:bg-gray-50 disabled:cursor-default disabled:opacity-60"
      >
        <div className="flex gap-[22px]">
          <File />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-gray-900">
              {fileName}
            </span>
            <span className="text-[11px] text-gray-400">
              {downloading
                ? "다운로드 중..."
                : answer?.fileSize
                  ? `${(answer.fileSize / 1024 / 1024).toFixed(1)}MB`
                  : ""}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
