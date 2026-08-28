"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface RejectAssignmentModalProps {
  teamName: string;
  isPending: boolean;
  onConfirm: (rejectReason: string) => void;
  onClose: () => void;
}

const REASON_MAX_LENGTH = 200;

// 담당 배정 거절 모달 — 거절 사유를 필수로 입력받은 뒤 거절을 확정한다.
export default function RejectAssignmentModal({
  teamName,
  isPending,
  onConfirm,
  onClose,
}: RejectAssignmentModalProps) {
  const [reason, setReason] = useState("");
  const isReasonEmpty = reason.trim().length === 0;

  // 모달이 떠 있는 동안 뒤 배경(body)이 스크롤되지 않게 막는다.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 px-4"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="flex w-full max-w-[360px] flex-col gap-5 rounded-[16px] bg-white px-6 py-7 shadow-new"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3">
          <p className="whitespace-nowrap text-center text-base font-medium text-gray-900">
            <span className="text-sm text-gray-500">Team</span>{" "}
            <span className="text-lg font-bold">{teamName}</span> 배정을
            거절하시겠습니까?
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX_LENGTH))}
            placeholder="거절 사유를 입력해주세요"
            rows={3}
            maxLength={REASON_MAX_LENGTH}
            className="w-full resize-none rounded-[10px] border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/10"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">거절 사유는 필수 입력입니다.</p>
            <p className="text-xs text-gray-400">
              {reason.length}/{REASON_MAX_LENGTH}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 cursor-pointer rounded-[10px] border border-yellow-600 bg-white py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isPending || isReasonEmpty}
            className="flex-1 cursor-pointer rounded-[10px] bg-yellow-600 py-2.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "거절하기"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
