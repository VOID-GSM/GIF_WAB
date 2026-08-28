"use client";

import { formatDeadlineDate, formatDeadlineTime } from "../lib/formatDeadline";
import type { FormSummary } from "../model/types";

// 헤더 행과 데이터 행이 동일한 컬럼 폭을 공유하도록 그리드 정의를 한곳에서 관리한다.
// 컬럼: 제목 / 마감 날짜 / 마감 시간 / 공지 / 관리
export const FORM_TABLE_GRID =
  "grid grid-cols-[1fr_130px_84px_100px_132px] gap-4 items-center min-w-[660px]";

interface FormCardProps {
  form: FormSummary;
  // 공지·수정 권한(아이디어페스티벌 담당)이 있을 때만 전달 — 없으면 버튼을 렌더하지 않는다.
  onAnnounce?: (id: number) => void;
  onEdit?: (id: number) => void;
  // 삭제 권한이 있을 때만 전달 — 없으면 삭제 버튼을 렌더하지 않는다.
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

export default function FormCard({
  form,
  onAnnounce,
  onEdit,
  onDelete,
  onView,
}: FormCardProps) {
  const { id, title, deadline, announced } = form;
  const time = formatDeadlineTime(deadline);

  return (
    <div
      className={`${FORM_TABLE_GRID} border-b border-gray-100 bg-white px-4 py-4 transition-colors hover:bg-yellow-50 ${announced ? "cursor-pointer" : ""}`}
      onClick={announced ? () => onView?.(id) : undefined}
    >
      {/* 제목 */}
      <span className="min-w-0 truncate text-base font-medium text-gray-900 sm:text-lg">
        {title}
      </span>

      {/* 마감 날짜 */}
      <span className="text-sm text-gray-700">
        {formatDeadlineDate(deadline)}
      </span>

      {/* 마감 시간 */}
      <span className="text-sm text-gray-700">{time || "—"}</span>

      {/* 공지 */}
      <div className="flex justify-start">
        {announced ? (
          <span className="inline-flex h-8 items-center rounded-lg bg-gray-100 px-3 text-sm font-medium text-gray-500">
            공지됨
          </span>
        ) : onAnnounce ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnnounce(id);
            }}
            className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-yellow-600 px-3 text-sm font-medium text-black transition-all duration-150 hover:bg-yellow-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600/50"
          >
            공지하기
          </button>
        ) : (
          <span className="inline-flex h-8 items-center rounded-lg bg-gray-100 px-3 text-sm font-medium text-gray-500">
            공지 전
          </span>
        )}
      </div>

      {/* 관리 (수정 / 삭제) — 수정 권한이 없어도 삭제가 밀리지 않도록 수정 자리를 고정 폭으로 유지 */}
      <div className="flex items-center justify-start gap-3">
        {!onEdit ? (
          <span className="h-8 w-14" aria-hidden />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className="inline-flex h-8 w-14 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            수정
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="ml-4 cursor-pointer text-sm font-medium text-red-500 transition-colors duration-150 hover:text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:text-red-400 dark:hover:text-red-300"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
