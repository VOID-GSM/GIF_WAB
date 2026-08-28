"use client";

import { useState } from "react";
import AssignConfirmModal from "@/widgets/teacher-assign/ui/AssignConfirmModal";

export default function AssignModalDevClient() {
  const [open, setOpen] = useState(true);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4">
      <p className="text-[14px] text-gray-500">
        담당 선생님 배정 확인 모달 미리보기 페이지입니다.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-[10px] bg-yellow-600 px-4 py-2.5 text-[14px] font-semibold text-gray-900 transition-opacity hover:opacity-90"
      >
        모달 다시 열기
      </button>

      <label className="flex items-center gap-2 text-[13px] text-gray-500">
        <input
          type="checkbox"
          checked={isPending}
          onChange={(e) => setIsPending(e.target.checked)}
        />
        배정 중(pending) 상태로 보기
      </label>

      {open && (
        <AssignConfirmModal
          teacherName="김소프트"
          teamName="보이드"
          isPending={isPending}
          onConfirm={() => alert("배정 확정! (실제 API는 호출하지 않음)")}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
