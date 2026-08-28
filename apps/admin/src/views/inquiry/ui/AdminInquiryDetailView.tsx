"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chevron, File as FileIcon, Markdown, Textarea } from "@repo/ui";
import { formatTimestamp } from "@/entities/form/lib/formatDeadline";
import { useGetMyInfo } from "@/entities/mypage";
import {
  useAnswerInquiry,
  useDownloadInquiryFile,
  useGetAdminInquiryDetail,
} from "@/entities/inquiry";
import type { InquiryStatus } from "@/entities/inquiry";
import { PRIVILEGED_ADMIN_EMAIL } from "@/shared/constants";

const MAX_ANSWER_LENGTH = 2000;

const STATUS_META: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "답변 대기",
    className:
      "bg-gray-100 text-gray-500 border-gray-200",
  },
  ANSWERED: {
    label: "답변 완료",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-600",
  },
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

interface AdminInquiryDetailViewProps {
  inquiryId: number;
}

export default function AdminInquiryDetailView({
  inquiryId,
}: AdminInquiryDetailViewProps) {
  const router = useRouter();
  const { data, isPending, isError } = useGetAdminInquiryDetail(inquiryId);
  const { data: myInfo, isLoading: isMyInfoLoading } = useGetMyInfo();
  const { mutate: answer, isPending: isAnswering } = useAnswerInquiry();
  const { mutate: download, isPending: isDownloading } = useDownloadInquiryFile();

  const [answerContent, setAnswerContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  // 새로운 문의가 로드되면 기존 답변으로 폼을 초기화한다. (렌더 중 상태 조정 패턴)
  const [loadedId, setLoadedId] = useState<number | null>(null);
  if (data && data.id !== loadedId) {
    setLoadedId(data.id);
    setAnswerContent(data.answerContent ?? "");
    setIsPreview(false);
  }

  const canAnswer = myInfo?.email === PRIVILEGED_ADMIN_EMAIL;

  // 문의 관리 페이지는 답변 권한 계정만 접근할 수 있다. 그 외 계정은 홈으로 돌려보낸다.
  useEffect(() => {
    if (!isMyInfoLoading && !canAnswer) router.replace("/");
  }, [isMyInfoLoading, canAnswer, router]);

  const handleSubmit = () => {
    if (isAnswering) return;
    const trimmed = answerContent.trim();
    if (!trimmed) return;
    answer(
      { inquiryId, body: { answerContent: trimmed } },
      { onSuccess: () => setIsPreview(false) },
    );
  };

  if (isMyInfoLoading || !canAnswer) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-8">
        <p className="text-[13px] font-medium text-gray-400">불러오는 중</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[600px]">
        {/* 상단 이동 */}
        <button
          type="button"
          onClick={() => router.push("/inquiry/admin")}
          className="group -ml-1 flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600"
        >
          <Chevron
            direction="left"
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
          />
          문의 관리
        </button>

        {isPending ? (
          <p className="py-16 text-center text-[13px] font-medium text-gray-400">
            불러오는 중
          </p>
        ) : isError || !data ? (
          <p className="py-16 text-center text-[13px] font-medium text-red-500">
            문의 내용을 불러오지 못했습니다.
          </p>
        ) : (
          <>
            {/* 헤더 */}
            <div className="mt-2.5 border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-[19px] font-semibold tracking-[-0.3px] text-gray-900">
                  {data.title}
                </h1>
                <span
                  className={`mt-1 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_META[data.status].className}`}
                >
                  {STATUS_META[data.status].label}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-gray-400">
                {data.createdByName} · {formatTimestamp(data.createdAt)}
              </p>
            </div>

            {/* 내용 */}
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-gray-700">
                  문의 내용
                </span>
                <div className="rounded-[10px] border border-gray-200 bg-white px-3.5 py-3">
                  <Markdown content={data.content} />
                </div>
              </div>

              {/* 첨부파일 */}
              {data.filePath && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-gray-700">
                    첨부파일
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isDownloading || !data.filePath) return;
                      download({
                        fileUrl: data.filePath,
                        fileName:
                          data.originalFileName ??
                          data.filePath.split("/").pop() ??
                          "첨부파일",
                      });
                    }}
                    disabled={isDownloading}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:border-yellow-600 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <FileIcon className="h-[18px] w-[15px] shrink-0" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[13px] font-medium text-gray-700">
                          {data.originalFileName ??
                            data.filePath.split("/").pop() ??
                            "첨부파일"}
                        </span>
                        {typeof data.fileSize === "number" && (
                          <span className="text-[11px] text-gray-500">
                            {formatFileSize(data.fileSize)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* 기존 답변 (답변 완료 상태) */}
              {data.status === "ANSWERED" && (
                <div className="mt-2 flex flex-col gap-1.5 rounded-[12px] border border-yellow-600 bg-yellow-50 px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-yellow-700">
                      답변
                    </span>
                    {data.answeredAt && (
                      <span className="text-[11px] text-gray-500">
                        {formatTimestamp(data.answeredAt)}
                      </span>
                    )}
                  </div>
                  <Markdown content={data.answerContent ?? ""} />
                </div>
              )}

              {/* 답변 작성/수정 폼 */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsPreview(false)}
                      className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                        !isPreview
                          ? "bg-yellow-600 text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      작성
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                        isPreview
                          ? "bg-yellow-600 text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      미리보기
                    </button>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      answerContent.length >= MAX_ANSWER_LENGTH
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {answerContent.length}/{MAX_ANSWER_LENGTH}
                  </span>
                </div>
                {isPreview ? (
                  <div className="h-[150px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white px-[16px] py-[13px]">
                    {answerContent.trim() ? (
                      <Markdown content={answerContent} />
                    ) : (
                      <p className="text-[13px] text-gray-400">
                        미리볼 내용이 없습니다.
                      </p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    title="답변 내용을 입력해주세요 (마크다운 문법 지원)"
                    value={answerContent}
                    onChange={(e) =>
                      setAnswerContent(e.target.value.slice(0, MAX_ANSWER_LENGTH))
                    }
                    rows={6}
                    maxLength={MAX_ANSWER_LENGTH}
                    textClassName="text-[13px] leading-relaxed text-gray-700"
                    className="h-[150px]"
                  />
                )}
                <div className="mt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isAnswering || !answerContent.trim()}
                    className="h-10 cursor-pointer rounded-[10px] bg-yellow-600 px-5 text-[13px] font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:active:scale-100"
                  >
                    {isAnswering
                      ? "등록 중..."
                      : data.status === "ANSWERED"
                        ? "답변 수정하기"
                        : "답변 등록하기"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
