"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetMyInfo } from "@/entities/mypage";
import { useGetFilteredProjects } from "@/entities/project";
import type { Grade } from "@/entities/project";
import { useScoreNotice, useGetAllProjectFieldAverages } from "@/entities/score";
import { getRank } from "@repo/lib";
import ScoreTabNav from "./ScoreTabNav";
import ScoreCollectionFilterBar from "./ScoreCollectionFilterBar";
import ScoreCollectionTable from "./ScoreCollectionTable";

const GRADE_STORAGE_KEY = "score_assign_grade";

export default function ScoreView() {
  const subscribe = useMemo(() => (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);
  const grade = useSyncExternalStore(
    subscribe,
    () => (localStorage.getItem(GRADE_STORAGE_KEY) === "2" ? 2 : 1) as Grade,
    () => 1 as Grade,
  );

  function handleGradeChange(g: Grade) {
    localStorage.setItem(GRADE_STORAGE_KEY, String(g));
    window.dispatchEvent(new Event("storage"));
  }

  const { mutate: noticeScore, isPending: isNoticing } = useScoreNotice();
  const { data: myInfo } = useGetMyInfo();
  const canNotice = myInfo?.adminRole === "MASTER";

  const {
    data: rankRows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["score", "rank", grade],
    queryFn: async () => (await getRank(grade)).data,
  });

  const { data: fieldAverages } = useGetAllProjectFieldAverages();
  const { data: filteredProjects = [] } = useGetFilteredProjects(grade);

  const scoreRows = useMemo(() => {
    // projectId → teamName 매핑 (공지 발행 여부와 무관하게 항상 채워지는 프로젝트 목록 기준)
    const teamNameByProjectId = new Map(filteredProjects.map((p) => [p.id, p.teamName]));
    // teamName → 영역별 평균 매핑 (field-averages는 projectId만 보유 → 위 맵으로 연결)
    const fieldByTeam = new Map(
      (fieldAverages ?? []).flatMap((f) => {
        const teamName = teamNameByProjectId.get(f.projectId);
        return teamName ? [[teamName, f] as const] : [];
      }),
    );

    return [...(rankRows ?? [])]
      .sort((a, b) => a.rank - b.rank)
      .map(({ rank, teamName }) => {
        const field = fieldByTeam.get(teamName);
        return {
          rank,
          teamName,
          majorAverage: field?.majorAverage,
          reportAverage: field?.reportAverage,
          communityAverage: field?.communityAverage,
          grandTotalAverage: field?.grandTotalAverage,
        };
      });
  }, [rankRows, fieldAverages, filteredProjects]);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-4xl flex flex-col gap-5">
        <ScoreTabNav />
        <div className="w-full flex flex-col sm:max-h-[600px] bg-white rounded-2xl border border-gray-200 shadow-new p-4 sm:p-7 md:p-10">
          <ScoreCollectionFilterBar
            grade={grade}
            onGradeChange={handleGradeChange}
            canNotice={canNotice}
            isNoticing={isNoticing}
            onNotice={() => noticeScore()}
          />
          <ScoreCollectionTable isLoading={isLoading} isError={isError} scoreRows={scoreRows} />
          <p className="mt-2 text-xs text-gray-400">
            전공·보고서·사회 점수는 채점 항목 합계가 아닌 평균 점수입니다.
            <br />
            총점수는 이 세 평균의 합입니다(반올림으로 1점 정도 차이가 날 수 있습니다).
          </p>
        </div>
      </div>
    </div>
  );
}
