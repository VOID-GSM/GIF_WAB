"use client";

interface AnnouncedSaveConfirmModalProps {
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// 공지된 양식 저장 확인 모달 — 학생에게 이미 노출된 양식이라 수정 즉시 반영되므로 한 번 더 확인받는다.
export default function AnnouncedSaveConfirmModal({
  isPending,
  onConfirm,
  onClose,
}: AnnouncedSaveConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="flex w-full max-w-[360px] flex-col gap-6 rounded-[16px] bg-white px-6 py-7 shadow-new"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <p className="text-center text-base font-medium text-gray-900">
            이미 공지된 양식을 수정하시겠어요?
          </p>
          <p className="text-center text-sm font-medium text-gray-500">
            수정 내용은 학생에게 즉시 반영되며,
            <br />
            이미 제출된 답변에 영향을 줄 수 있습니다.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-[10px] border border-yellow-600 bg-white py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-[10px] bg-yellow-600 py-2.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "저장 중..." : "수정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
