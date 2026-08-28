import { ChangeEvent, DragEvent, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  File,
  Close,
  splitAllowedExtensions,
  isValidSubmissionUrl,
} from "@repo/ui";
import { useDeleteFormUpload } from "../hooks/useDeleteFormUpload";
import { useDownloadFile } from "../hooks/useDownloadFile";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type SubmitMode = "file" | "link";

interface FileFieldProps {
  fieldId: number;
  file: { name: string; size: number } | null;
  filePath?: string;
  fileSize?: number;
  originalFileName?: string; // 서버에 저장된 파일의 원본 파일명
  readOnly?: boolean;
  submitId?: number; // 추가
  allowedExtensions?: string[]; // admin 이 지정한 허용 확장자(비어 있으면 제한 없음)
  url?: string; // 외부 링크 제출 값 — 비어 있지 않으면 링크 제출로 간주한다
  onChange: (fieldId: number, file: File | null) => void;
  onUrlChange?: (fieldId: number, url: string) => void;
}

// 파일명에서 소문자 확장자를 추출한다. 확장자가 없으면 빈 문자열.
const getExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex + 1).toLowerCase();
};

export default function FileField({
  fieldId,
  file,
  filePath,
  fileSize,
  originalFileName,
  readOnly = false,
  submitId,
  allowedExtensions,
  url = "",
  onChange,
  onUrlChange,
}: FileFieldProps) {
  const { mutate: deleteUpload, isPending: isDeleting } = useDeleteFormUpload();
  const { mutate: download, isPending: isDownloading } = useDownloadFile();
  const [isDragging, setIsDragging] = useState(false);

  // admin 이 확장자·URL 허용 여부를 지정한 경우에만 제한한다.
  const { extensions, allowUrl } = splitAllowedExtensions(allowedExtensions);
  const hasExtensionLimit = extensions.length > 0;

  // 링크 값이 있으면 링크 탭에서 시작하고, 사용자가 탭을 누르면 그 선택을 따른다.
  const [modeOverride, setModeOverride] = useState<SubmitMode | null>(null);
  const mode: SubmitMode = modeOverride ?? (url ? "link" : "file");

  const handleModeChange = (next: SubmitMode) => {
    setModeOverride(next);
    // 파일 탭으로 돌아오면 링크 값을 비워, 제출 시 파일이 우선되도록 한다.
    if (next === "file" && url) onUrlChange?.(fieldId, "");
  };

  const handleDelete = () => {
    if (filePath && submitId) {
      deleteUpload(
        { fieldId, submitId }, // submitId 추가
        { onSuccess: () => onChange(fieldId, null) },
      );
    } else {
      onChange(fieldId, null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // 파일 선택 여부·수정 상태와 무관하게 항상 노출되는 허용 형식 안내.
  const formatHint = hasExtensionLimit ? (
    <span className="mt-2 block text-[12px] text-gray-400 font-regular">
      허용 형식: {extensions.join(", ")} (최대 10MB)
    </span>
  ) : null;

  // 확장자·용량 검증 — click으로 고른 파일과 드래그해서 놓은 파일 모두 여기를 거친다.
  const validateAndSetFile = (selected: File) => {
    if (
      hasExtensionLimit &&
      !extensions.includes(getExtension(selected.name))
    ) {
      toast.error(
        `허용된 파일 형식이 아닙니다. (${extensions.join(", ")} 형식만 업로드 가능)`,
      );
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast.error("파일 용량이 커서 업로드할 수 없습니다. (최대 10MB)");
      return;
    }
    onChange(fieldId, selected);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    validateAndSetFile(selected);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSetFile(dropped);
  };

  // 제출된 링크를 읽기 전용으로 보여주는 카드
  const submittedLink = url.trim() ? (
    <a
      href={url.trim()}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-[22px] rounded-[10px] border border-gray-80 pl-[24px] pr-[30px] py-[15px] transition-colors hover:bg-gray-100/60"
    >
      <span className="flex-shrink-0">
        <File />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[14px] font-semibold text-gray-900">
          {url.trim()}
        </span>
        <span className="text-[11px] text-gray-400">외부 링크</span>
      </div>
    </a>
  ) : null;

  // 파일 첨부 영역 — 선택된 파일이 있으면 카드, 없으면 업로드 박스
  const renderFileArea = () => {
    if (file || filePath) {
      // 새로 선택한 파일 > 서버 원본 파일명 > 경로 마지막(UUID) 순으로 표시
      const fileName =
        file?.name ??
        originalFileName ??
        filePath?.split("/").pop() ??
        "첨부파일";
      const size = file?.size ?? fileSize ?? 0;

      return (
        <div>
          <div
            className={`flex items-center justify-between gap-3 rounded-[10px] border border-gray-80 pl-[24px] pr-[30px] py-[15px] ${
              filePath ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (filePath && !isDownloading) {
                download({ fileUrl: filePath, fileName });
              }
            }}
          >
            <div className="flex gap-[22px] min-w-0 flex-1 items-center">
              <span className="flex-shrink-0">
                <File />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold truncate text-gray-900">
                  {fileName}
                </span>
                <span className="text-[11px] text-gray-400">
                  {formatFileSize(size)}
                </span>
              </div>
            </div>

            {!readOnly && (
              <Close
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!isDeleting) handleDelete();
                }}
                width={15}
                height={15}
                className="flex-shrink-0 text-gray-40 hover:opacity-60 transition-colors cursor-pointer"
              />
            )}
          </div>
          {!readOnly && formatHint}
        </div>
      );
    }

    return (
      <div>
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex items-center justify-center w-full border-2 border-dashed rounded-[10px] cursor-pointer transition-colors ${
            isDragging
              ? "border-yellow-600 bg-yellow-50"
              : "border-gray-600 bg-gray-100 hover:border-gray-600/60 hover:bg-gray-100/60"
          }`}
        >
          <input
            type="file"
            className="hidden"
            accept={
              hasExtensionLimit
                ? extensions.map((ext) => `.${ext}`).join(",")
                : undefined
            }
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-3 my-[30px]">
            <Upload className="text-gray-50" />
            <span className="text-gray-50 font-regular">
              클릭하거나 파일을 드래그하여 업로드
            </span>
            {hasExtensionLimit && (
              <span className="text-[12px] text-gray-400 font-regular">
                허용 형식: {extensions.join(", ")}
              </span>
            )}
          </div>
        </label>
        {formatHint}
      </div>
    );
  };

  // 외부 링크 입력 영역
  const renderLinkArea = () => {
    const trimmed = url.trim();
    const isInvalid = trimmed.length > 0 && !isValidSubmissionUrl(trimmed);

    return (
      <div>
        <input
          type="url"
          inputMode="url"
          value={url}
          placeholder="https://www.canva.com/design/..."
          onChange={(e) => onUrlChange?.(fieldId, e.target.value)}
          className={`w-full rounded-[10px] border px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 bg-white ${
            isInvalid
              ? "border-red-500"
              : "border-gray-80 focus:border-gray-600"
          }`}
        />
        <span
          className={`mt-2 block text-[12px] font-regular ${
            isInvalid ? "text-red-500" : "text-gray-400"
          }`}
        >
          {isInvalid
            ? "http:// 또는 https:// 로 시작하는 링크를 입력해주세요."
            : "캔바·미리캔버스·Google 드라이브 등 공유 링크를 붙여넣어 주세요. 권한이 '링크가 있는 모든 사용자'인지 확인해주세요."}
        </span>
      </div>
    );
  };

  if (readOnly) {
    if (file || filePath) return renderFileArea();
    if (submittedLink) return submittedLink;
    return (
      <div className="flex items-center justify-center w-full border border-gray-80 rounded-[10px] py-[30px]">
        <span className="text-gray-400 text-[13px]">
          {allowUrl ? "제출된 파일·링크 없음" : "업로드된 파일 없음"}
        </span>
      </div>
    );
  }

  // admin 이 URL 제출을 허용하지 않았다면 기존 파일 업로드 UI 그대로 사용한다.
  if (!allowUrl) return renderFileArea();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(
          [
            ["file", "파일 업로드"],
            ["link", "링크 제출"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => handleModeChange(value)}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              mode === value
                ? "border-yellow-600 bg-yellow-600/10 text-gray-900 dark:bg-yellow-500/15"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "file" ? renderFileArea() : renderLinkArea()}
    </div>
  );
}
