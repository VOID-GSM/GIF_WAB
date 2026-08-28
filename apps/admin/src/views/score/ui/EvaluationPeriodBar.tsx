"use client";

import { useState } from "react";
import EvaluationDatePicker from "./EvaluationDatePicker";
import EvaluationTimePicker from "./EvaluationTimePicker";
import {
  formatKoreanDateTime,
  toIsoStartDate,
  type EvaluationPeriodPayload,
} from "./evaluationPeriod";

interface Props {
  canSet: boolean;
  onConfirmed: (payload: EvaluationPeriodPayload) => void;
}

// 설정 완료 시 부모(ScoreAssignView)가 이 바를 더 이상 렌더링하지 않으므로,
// 여기서는 "아직 설정 전" 흐름(입력 + 확인 모달)만 다룬다.
// 실제 POST /api/score/period 호출과 성공/실패 토스트는 onConfirmed를 통해 부모가 처리한다.
export default function EvaluationPeriodBar({ canSet, onConfirmed }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!canSet) return null;

  function handleConfirm() {
    onConfirmed({ category: "REPORT", startDate: toIsoStartDate(date, time) });
    setShowConfirm(false);
  }

  return (
    <>
      <div className="mb-5 flex w-full flex-col gap-4 rounded-[10px] border border-yellow-600 bg-yellow-50 px-4 py-4 sm:flex-row sm:items-center">
        <span className="shrink-0 text-xs font-semibold text-yellow-800">
          보고서 영역 평가 시작일
        </span>

        <div className="flex flex-1 flex-wrap items-center justify-center gap-4">
          <div className="flex-1 min-w-[140px]">
            <EvaluationDatePicker value={date} onChange={setDate} />
          </div>
          <div className="flex-1 min-w-[110px]">
            <EvaluationTimePicker value={time} onChange={setTime} />
          </div>
          <button
            type="button"
            disabled={!date || !time}
            onClick={() => setShowConfirm(true)}
            className="py-[6px] px-[16px] rounded-[8px] text-[12px] font-semibold bg-yellow-600 hover:bg-yellow-700 text-black cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            설정
          </button>
        </div>

        <span className="w-full text-[11px] text-yellow-700/80 sm:w-auto sm:ml-auto">
          한 번 설정한 시작일은 이후 변경할 수 없습니다.
        </span>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg px-8 py-7 flex flex-col gap-5 w-[320px] sm:w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold text-gray-900">
                평가 시작일을 설정하시겠습니까?
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">
                  {formatKoreanDateTime(date, time)}
                </span>
                로 설정합니다. 한 번 설정한 보고서 영역 평가 시작일은 변경할 수
                없습니다.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors dark:hover:bg-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-600 hover:bg-yellow-700 cursor-pointer transition-colors"
              >
                설정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
