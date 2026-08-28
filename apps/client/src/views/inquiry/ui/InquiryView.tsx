"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Input,
  Textarea,
  Markdown,
  File as FileIcon,
  Upload,
  Close,
} from "@repo/ui";
import { usePostInquiry } from "@/entities/inquiry";
import InquiryTabs from "./InquiryTabs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 1000;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default function InquiryView() {
  const router = useRouter();
  const { mutate, isPending } = usePostInquiry();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      toast.error("파일 용량이 커서 업로드할 수 없습니다. (최대 10MB)");
      e.target.value = "";
      return;
    }
    setFile(selected);
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (isPending) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    mutate(
      { title: trimmedTitle, content: trimmedContent, file },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setFile(null);
          setIsPreview(false);
          router.push("/inquiry/my");
        },
      },
    );
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[600px]">
        <InquiryTabs />

        {/* 헤더 */}
        <div className="mt-2.5 border-b border-gray-200 pb-4">
          <h1 className="text-[19px] font-semibold tracking-[-0.3px] text-gray-900">
            문의하기
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
            서비스 이용 중 불편한 점이나 궁금한 점을 남겨주세요.
          </p>
        </div>

        {/* 폼 */}
        <div className="mt-5 flex flex-col gap-4">
          {/* 제목 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-gray-700">
                제목
              </label>
              <span
                className={`text-[11px] font-medium ${
                  title.length >= MAX_TITLE_LENGTH
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <Input
              title="제목을 입력하세요"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
              }
              maxLength={MAX_TITLE_LENGTH}
              textClassName="text-[13px] text-gray-700"
            />
          </div>

          {/* 내용 */}
          <div className="flex flex-col gap-1.5">
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
                  content.length >= MAX_CONTENT_LENGTH
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            {isPreview ? (
              <div className="h-[150px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white px-[16px] py-[13px]">
                {content.trim() ? (
                  <Markdown content={content} />
                ) : (
                  <p className="text-[13px] text-gray-400">
                    미리볼 내용이 없습니다.
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                title="문의 내용을 자세히 입력해주세요 (마크다운 문법 지원)"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))
                }
                rows={6}
                maxLength={MAX_CONTENT_LENGTH}
                textClassName="text-[13px] leading-relaxed text-gray-700"
                className="h-[150px]"
              />
            )}
          </div>

          {/* 첨부파일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">
              첨부파일
              <span className="ml-1 text-[12px] font-normal text-gray-400">
                (선택)
              </span>
            </label>
            {file ? (
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <FileIcon className="h-[18px] w-[15px] shrink-0" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-medium text-gray-700">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={isPending}
                  aria-label="첨부파일 제거"
                  className="shrink-0 cursor-pointer text-gray-400 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Close width={13} height={13} />
                </button>
              </div>
            ) : (
              <label
                className={`group flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-gray-300 bg-white py-3.5 transition-colors ${
                  isPending
                    ? "pointer-events-none opacity-50"
                    : "hover:border-yellow-600 hover:bg-yellow-50"
                }`}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isPending}
                />
                <Upload className="h-4 w-4 text-gray-400 transition-colors group-hover:text-yellow-700" />
                <span className="text-[12px] font-medium text-gray-500 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-200">
                  클릭하여 파일 첨부 (최대 10MB)
                </span>
              </label>
            )}
          </div>
        </div>

        {/* 액션 */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="h-10 cursor-pointer rounded-[10px] px-4 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="h-10 cursor-pointer rounded-[10px] bg-yellow-600 px-5 text-[13px] font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:active:scale-100"
          >
            {isPending ? "접수 중..." : "문의 접수하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
