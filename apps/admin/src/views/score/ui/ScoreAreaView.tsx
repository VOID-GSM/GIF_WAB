"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScoreAreaHeader from "./ScoreAreaHeader";
import ScoreAreaTable from "./ScoreAreaTable";
import { useScoreArea } from "./useScoreArea";

interface Props {
  area: string;
  projectId: number;
  teamName: string;
}

export default function ScoreAreaView({ area, projectId, teamName }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    rows,
    allScored,
    isAreaScored,
    isQueryLoading,
    isMutating,
    selectScore,
    handleSave,
  } = useScoreArea({ area, projectId });

  function goToScorePage() {
    router.push("/score");
  }

  function handleSaveClick() {
    if (isAreaScored) {
      setShowConfirm(true);
    } else {
      handleSave(goToScorePage);
    }
  }

  function handleConfirm() {
    setShowConfirm(false);
    handleSave(goToScorePage);
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-[980px] flex flex-col gap-5">
        <ScoreAreaHeader onBack={() => router.back()} teamName={teamName} area={area} />
        <div className="bg-white rounded-2xl border border-gray-200 shadow-new overflow-hidden p-4 sm:p-7 md:p-10 flex flex-col">
          <div className="flex flex-col">
            <ScoreAreaTable
              isLoading={isQueryLoading}
              rows={rows}
              onSelectScore={selectScore}
            />
          </div>
          {!isQueryLoading && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveClick}
                disabled={!allScored || isMutating}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isMutating ? "저장 중..." : isAreaScored ? "점수 수정" : "점수 부여"}
              </button>
            </div>
          )}
        </div>
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
              <p className="text-base font-semibold text-gray-900">점수를 수정하시겠습니까?</p>
              <p className="text-sm text-gray-500">이미 부여된 점수가 새 점수로 덮어씌워집니다.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors dark:hover:bg-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isMutating}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isMutating ? "저장 중..." : "수정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
