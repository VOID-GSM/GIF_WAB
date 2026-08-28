"use client";

import { ScoreButton } from "@repo/ui";
import type { CriterionRow, ScoreValue } from "./constants";

interface Props {
  isLoading: boolean;
  rows: CriterionRow[];
  onSelectScore: (key: string, score: ScoreValue) => void;
}

const TABLE_HEADERS = ["평가 항목", "점수"];

export default function ScoreAreaTable({
  isLoading,
  rows,
  onSelectScore,
}: Props) {
  if (isLoading) {
    return <p className="py-10 text-center text-gray-400">불러오는 중...</p>;
  }

  return (
    <>
      {/* 모바일: 항목별 카드 레이아웃 */}
      <div className="sm:hidden divide-y divide-[var(--color-gray-100)] dark:divide-gray-800">
        {rows.map((row) => (
          <div key={row.key} className="py-3 flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-800">
              {row.label}
            </span>
            <div className="flex w-full justify-center gap-3">
              {row.scores.map((score) => (
                <ScoreButton
                  key={score}
                  score={score}
                  variant={row.selectedScore === score ? "active" : "inactive"}
                  onClick={() => onSelectScore(row.key, score)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* sm 이상: 그리드 테이블 레이아웃 */}
      <div className="hidden sm:flex sm:flex-col w-full overflow-x-auto h-full">
        <div className="grid grid-cols-[1fr_180px] gap-4 px-4 py-2.5 bg-[var(--color-yellow-50)] border-b border-t border-[var(--color-yellow-600)] dark:bg-[#85782c] dark:border-yellow-500/20 min-w-[340px]">
          {TABLE_HEADERS.map((h) => (
            <span
              key={h}
              className="font-semibold text-xs text-[var(--color-gray-700)] dark:text-gray-100"
            >
              {h}
            </span>
          ))}
        </div>
        <div className="flex-1 flex flex-col divide-y divide-[var(--color-gray-100)] dark:divide-gray-800 min-w-[340px]">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex-1 grid grid-cols-[1fr_180px] gap-4 px-4 py-3 items-center"
            >
              <span className="text-sm font-medium text-gray-800">
                {row.label}
              </span>
              <div className="flex gap-1.5">
                {row.scores.map((score) => (
                  <ScoreButton
                    key={score}
                    score={score}
                    variant={
                      row.selectedScore === score ? "active" : "inactive"
                    }
                    onClick={() => onSelectScore(row.key, score)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
