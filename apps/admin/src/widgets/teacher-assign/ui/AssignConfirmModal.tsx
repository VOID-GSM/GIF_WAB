"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface AssignConfirmModalProps {
  teacherName: string;
  teamName: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// 담당 선생님 배정 확인 모달 — 프로젝트 → 선생님을 클릭했을 때 실제 배정 전에 한 번 더 확인시킨다.
export default function AssignConfirmModal({
  teacherName,
  teamName,
  isPending,
  onConfirm,
  onClose,
}: AssignConfirmModalProps) {
  // 모달이 떠 있는 동안 뒤 배경(body)이 스크롤되지 않게 막는다.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // 배정 패널(aside)이 transform(translate-x)을 가지고 있어 새로운 containing block이 되므로,
  // 이 모달을 그 안에서 그냥 fixed로 띄우면 화면이 아니라 패널 기준으로 위치가 잡혀버린다.
  // document.body에 포털로 그려서 항상 뷰포트 정중앙에 뜨도록 한다.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 px-4"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="flex w-full max-w-[320px] flex-col gap-6 rounded-[16px] bg-white px-6 py-7 shadow-new"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-base font-medium text-gray-900">
          <span className="text-sm text-gray-500">Team</span>{" "}
          <span className="text-lg font-bold">{teamName}</span> 담당으로
          <br />
          <span className="text-lg font-bold">{teacherName}</span> 선생님을
          <br />
          배정하시겠습니다.
        </p>

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
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 cursor-pointer rounded-[10px] bg-yellow-600 py-2.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "배정 중..." : "배정하기"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
