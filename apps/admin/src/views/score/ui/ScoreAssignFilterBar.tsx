"use client";

import { useState, useRef, useEffect } from "react";
import { Chevron, GrantButton } from "@repo/ui";
import type { GrantStatus, Grade } from "@repo/ui";
import type { ScoreFilter } from "./constants";
import TeamFilter from "@/features/team-filter/ui/TeamFilter";
import EvaluationPeriodBadge from "./EvaluationPeriodBadge";
import type { EvaluationPeriodPayload } from "./evaluationPeriod";

const GRADE_OPTIONS: { value: Grade; label: string }[] = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
];

const LEGEND = [
  { dot: "bg-green-50 border-green-500",   label: "점수 부여 완료" },
  { dot: "bg-orange-50 border-orange-400", label: "점수 미부여"   },
  { dot: "bg-gray-100 border-gray-300",    label: "해당 없음"     },
];

interface Props {
  grade: Grade;
  onGradeChange: (grade: Grade) => void;
  scoreFilter: ScoreFilter;
  onFilterChange: (filter: ScoreFilter) => void;
  teamNames: string[];
  teamQuery: string;
  onTeamQueryChange: (query: string) => void;
  isPeriodSet: boolean;
  // 새로고침 전 같은 세션에서 방금 확인된 값 — 있으면 배지에 정확한 날짜·시간을 보여준다.
  confirmedPeriod?: EvaluationPeriodPayload | null;
}

export default function ScoreAssignFilterBar({
  grade,
  onGradeChange,
  scoreFilter,
  onFilterChange,
  teamNames,
  teamQuery,
  onTeamQueryChange,
  isPeriodSet,
  confirmedPeriod,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = GRADE_OPTIONS.find((o) => o.value === grade)?.label ?? "1학년";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5 w-full">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1 w-fit py-[6.5px] px-[10px] rounded-[8px] text-[12px] border border-gray-500 text-gray-500 bg-white cursor-pointer dark:border-gray-600"
        >
          {selectedLabel}
          <Chevron className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {dropdownOpen && (
          <ul className="absolute top-full mt-1 left-0 z-20 bg-white rounded-lg shadow-[var(--shadow-new)] overflow-hidden min-w-[100px]">
            {GRADE_OPTIONS.map(({ value, label }) => (
              <li key={value}>
                <button
                  onClick={() => { onGradeChange(value); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-[var(--color-gray-100)] dark:hover:bg-gray-800 cursor-pointer ${
                    grade === value ? "text-[var(--color-gray-900)] dark:text-white" : "text-[var(--color-gray-600)] dark:text-gray-400"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <TeamFilter teamNames={teamNames} value={teamQuery} onChange={onTeamQueryChange} />
      {(["ungranted", "granted"] as GrantStatus[]).map((status) => {
        const filter: ScoreFilter = status === "ungranted" ? "incomplete" : "complete";
        return (
          <GrantButton
            key={status}
            status={status}
            isActive={scoreFilter === filter}
            onClick={() => onFilterChange(scoreFilter === filter ? "all" : filter)}
          />
        );
      })}
      {isPeriodSet && <EvaluationPeriodBadge period={confirmedPeriod} />}
      <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-x-4 text-xs text-gray-500">
        {LEGEND.map(({ dot, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full border inline-block ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
