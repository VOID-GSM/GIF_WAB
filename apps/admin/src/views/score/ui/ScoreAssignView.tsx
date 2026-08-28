"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import ScoreTabNav from "./ScoreTabNav";
import ScoreAssignFilterBar from "./ScoreAssignFilterBar";
import ScoreAssignTable from "./ScoreAssignTable";
import EvaluationPeriodBar from "./EvaluationPeriodBar";
import {
  getIsPeriodSetSnapshot,
  markPeriodAsSet,
  type EvaluationPeriodPayload,
} from "./evaluationPeriod";
import { useGetFilteredProjects } from "@/entities/project";
import type { Grade } from "@/entities/project";
import { isAlreadySetError, useScoreStatuses, useSetScorePeriod } from "@/entities/score";
import { useGetMyInfo } from "@/entities/mypage";
import { PRIVILEGED_ADMIN_EMAIL } from "@/shared/constants";
import { matchesTeamQuery } from "@/shared/utils";
import type { ScoreFilter, ScoreArea } from "./constants";
import { getAllowedAreas } from "./constants";

const GRADE_STORAGE_KEY = "score_assign_grade";

export default function ScoreAssignView() {
  const subscribe = useMemo(() => (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);
  const grade = useSyncExternalStore(
    subscribe,
    () => (localStorage.getItem(GRADE_STORAGE_KEY) === "2" ? 2 : 1) as Grade,
    () => 1 as Grade,
  );
  // 새로고침해도 "이미 설정됨" 상태가 유지되도록 로컬 저장값을 그대로 구독한다.
  // 서버에 조회용 GET이 생기기 전까지의 임시 방편 — evaluationPeriod.ts 주석 참고.
  const isPeriodSet = useSyncExternalStore(
    subscribe,
    getIsPeriodSetSnapshot,
    () => false,
  );
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [teamQuery, setTeamQuery] = useState("");
  // 새로고침 전(같은 세션)에는 방금 설정한 값을 그대로 기억해서 배지에 정확한 날짜·시간을
  // 보여준다. localStorage에는 boolean만 남기 때문에 새로고침하면 이 값은 사라진다.
  const [confirmedPeriod, setConfirmedPeriod] =
    useState<EvaluationPeriodPayload | null>(null);
  const { mutate: setScorePeriod } = useSetScorePeriod();

  function handleGradeChange(g: Grade) {
    localStorage.setItem(GRADE_STORAGE_KEY, String(g));
    window.dispatchEvent(new Event("storage"));
  }

  function handlePeriodConfirmed(payload: EvaluationPeriodPayload) {
    setScorePeriod(payload, {
      onSuccess: () => {
        markPeriodAsSet();
        setConfirmedPeriod(payload);
      },
      // 다른 담당자가 이미 설정을 완료한 경우(409)에도 "실패"가 아니라 완료 상태로 반영한다.
      // 이땐 실제 값을 모르므로 배지는 일반 완료 문구만 보여준다.
      onError: (error) => {
        if (isAlreadySetError(error)) markPeriodAsSet();
      },
    });
  }

  const { data: myInfo, isLoading: isMyInfoLoading } = useGetMyInfo();
  // void 관리자 계정은 실제 채점 권한이 없는 단순 관리 계정이라 항상 점수 부여가 불가능해야 한다.
  const isPrivilegedAdmin = myInfo?.email === PRIVILEGED_ADMIN_EMAIL;
  const canSetPeriod = myInfo?.adminRole === "MASTER";
  const allowedAreas: ScoreArea[] = isPrivilegedAdmin
    ? []
    : getAllowedAreas(myInfo?.adminRole, myInfo?.gradeHead);

  const { data: projects = [], isLoading: isProjectsLoading } = useGetFilteredProjects(grade);

  const scoreQueries = useScoreStatuses(projects.map((project) => project.id));

  const isScoreLoading = scoreQueries.some((q) => q.isPending);
  const isLoading = isProjectsLoading || isScoreLoading || isMyInfoLoading;

  const teamsWithScores = projects
    .map((project, i) => {
      const scoredAreas = scoreQueries[i]?.data?.scoredAreas ?? [] as ScoreArea[];
      // 완료 여부는 3개 영역 전체가 아니라, 로그인한 계정이 담당하는 영역 기준으로 판단한다.
      const isComplete = allowedAreas.length > 0 && allowedAreas.every((a) => scoredAreas.includes(a));
      return {
        id: project.id,
        teamName: project.teamName,
        name: project.name,
        scoredAreas,
        isComplete,
      };
    })
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  const teams = teamsWithScores
    .filter((t) => {
      if (scoreFilter === "all") return true;
      return scoreFilter === "complete" ? t.isComplete : !t.isComplete;
    })
    .filter((t) => matchesTeamQuery(t.teamName, teamQuery));

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-4xl flex flex-col gap-5">
        <ScoreTabNav />
        <div className="w-full flex flex-col sm:max-h-[600px] bg-white rounded-2xl border border-gray-200 shadow-new p-4 sm:p-7 md:p-10">
          <ScoreAssignFilterBar
            grade={grade}
            onGradeChange={handleGradeChange}
            scoreFilter={scoreFilter}
            onFilterChange={setScoreFilter}
            teamNames={teamsWithScores.map((t) => t.teamName)}
            teamQuery={teamQuery}
            onTeamQueryChange={setTeamQuery}
            isPeriodSet={isPeriodSet}
            confirmedPeriod={confirmedPeriod}
          />
          {!isPeriodSet && (
            <EvaluationPeriodBar
              canSet={canSetPeriod}
              onConfirmed={handlePeriodConfirmed}
            />
          )}
          <ScoreAssignTable isLoading={isLoading} teams={teams} allowedAreas={allowedAreas} />
        </div>
      </div>
    </div>
  );
}
