"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";

import {
  GRADES,
  ProjectCard,
  useGetFilteredProjects,
  useStoredGrade,
} from "@/entities/project";
import GradeFilter from "@/features/project-filter/ui/GradeFilter";
import StatusFilter from "@/features/project-filter/ui/StatusFilter";
import { useGetMyInfo } from "@/entities/mypage";
import { getForms } from "@/entities/form";
import { useGetAllProjectFieldAverages } from "@/entities/score";
import DeadlineCountdownCard from "@/widgets/dashboard/ui/DeadlineCountdownCard";
import NoticeBanner from "@/widgets/dashboard/ui/NoticeBanner";
import ScheduleTimelineCard from "@/widgets/dashboard/ui/ScheduleTimelineCard";
import MyProjectCard from "@/widgets/dashboard/ui/MyProjectCard";
import ProfileSummaryCard from "@/widgets/dashboard/ui/ProfileSummaryCard";
import MyAssignmentNotice from "@/widgets/teacher-assign/ui/MyAssignmentNotice";

const SUBMISSION_OPTIONS = ["전체", "제출", "미제출"] as const;
const SCORE_OPTIONS = ["전체", "채점", "미채점"] as const;
type SubmissionStatus = (typeof SUBMISSION_OPTIONS)[number];
type ScoreStatus = (typeof SCORE_OPTIONS)[number];

export default function ProjectListView() {
  // 마지막으로 선택한 학년을 복원한다 (확정 전엔 null → 초기 학년 깜빡임 방지)
  const { grade, setGrade } = useStoredGrade();
  const { data: myInfo } = useGetMyInfo();
  const [showAll, setShowAll] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("전체");
  const [scoreStatus, setScoreStatus] = useState<ScoreStatus>("전체");

  const {
    data: projects,
    isPending,
    isError,
  } = useGetFilteredProjects(grade ?? GRADES[0], grade !== null);
  const { data: fieldAverages } = useGetAllProjectFieldAverages();
  const scoredProjectIds = new Set(
    fieldAverages
      ?.filter((average) => average.grandTotalAverage > 0)
      .map((average) => average.projectId),
  );

  const formQueries = useQueries({
    queries: (projects ?? []).map((project) => ({
      queryKey: ["form", "list", project.id],
      queryFn: async () => (await getForms(project.id)).data,
    })),
  });
  const submittedProjectIds = new Set(
    (projects ?? [])
      .filter((_, index) => {
        const forms = formQueries[index]?.data;
        return !!forms && forms.length > 0 && forms.every((form) => form.submitted);
      })
      .map((project) => project.id),
  );

  // 서버가 grade로 거르지 않고 전체를 반환하므로 선택 학년으로 한 번 더 거른다
  // 내가 담당하는 팀(adminTeam과 teamName이 일치)을 맨 앞으로 정렬한다
  const visibleProjects = projects
    ?.filter((project) => project.grade === grade)
    .filter((project) => {
      if (submissionStatus === "제출") return submittedProjectIds.has(project.id);
      if (submissionStatus === "미제출") return !submittedProjectIds.has(project.id);
      return true;
    })
    .filter((project) => {
      if (scoreStatus === "채점") return scoredProjectIds.has(project.id);
      if (scoreStatus === "미채점") return !scoredProjectIds.has(project.id);
      return true;
    })
    .slice()
    .sort((a, b) => {
      const aMine = a.teamName === myInfo?.adminTeam ? 0 : 1;
      const bMine = b.teamName === myInfo?.adminTeam ? 0 : 1;
      return aMine - bMine;
    });
  const myProject = visibleProjects?.find(
    (project) => project.teamName === myInfo?.adminTeam,
  );

  const resetFilters = () => {
    setSubmissionStatus("전체");
    setScoreStatus("전체");
  };

  if (grade === null) {
    return (
      <div className="flex min-h-dvh flex-col items-start gap-12 bg-background px-4 py-10">
        <p className="text-gray-600">불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      {/* 모바일: 공지 배너 → 프로젝트 → 자세히 보기 → 제출 마감 → 진행 일정 순으로 세로 배치 */}
      <div className="flex min-h-dvh flex-col gap-8 bg-background px-4 pt-16 pb-6 min-[900px]:hidden">
        <NoticeBanner />
        <MyAssignmentNotice />

        <div className="flex flex-wrap gap-2">
          <GradeFilter value={grade} onChange={setGrade} />
          <StatusFilter
            value={submissionStatus}
            options={SUBMISSION_OPTIONS}
            onChange={setSubmissionStatus}
          />
          <StatusFilter
            value={scoreStatus}
            options={SCORE_OPTIONS}
            onChange={setScoreStatus}
          />
          <button
            type="button"
            onClick={resetFilters}
            className="h-[40px] cursor-pointer rounded-[32px] border border-gray-300 bg-white px-4 text-[14px] font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            초기화
          </button>
        </div>

        {isPending ? (
          <p className="text-gray-600">불러오는 중...</p>
        ) : isError ? (
          <p className="text-gray-600">프로젝트를 불러오지 못했습니다.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">
                  프로젝트
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="cursor-pointer text-[13px] font-medium text-gray-500"
                >
                  {showAll ? "접기" : "전체 보기 ›"}
                </button>
              </div>
              {myProject && <MyProjectCard project={myProject} />}
            </div>

            {showAll &&
              (!visibleProjects || visibleProjects.length === 0 ? (
                <p className="text-gray-600">
                  해당 학년의 프로젝트가 없습니다.
                </p>
              ) : (
                <div className="grid w-full grid-cols-[repeat(auto-fill,224px)] justify-start gap-6">
                  {visibleProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ))}
          </>
        )}

        <ProfileSummaryCard />
        <DeadlineCountdownCard />
        <ScheduleTimelineCard />
      </div>

      {/* 데스크톱: 공지 배너 + 학년 필터 + 전체 그리드 */}
      <div className="hidden min-h-dvh flex-col items-start gap-12 bg-background px-4 py-10 min-[900px]:flex">
        <NoticeBanner />
        <MyAssignmentNotice />

        <div className="flex flex-wrap gap-3">
          <GradeFilter value={grade} onChange={setGrade} />
          <StatusFilter
            value={submissionStatus}
            options={SUBMISSION_OPTIONS}
            onChange={setSubmissionStatus}
          />
          <StatusFilter
            value={scoreStatus}
            options={SCORE_OPTIONS}
            onChange={setScoreStatus}
          />
          <button
            type="button"
            onClick={resetFilters}
            className="h-[40px] cursor-pointer rounded-[32px] border border-gray-300 bg-white px-4 text-[14px] font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            초기화
          </button>
        </div>

        {isPending ? (
          <p className="text-gray-600">불러오는 중...</p>
        ) : isError ? (
          <p className="text-gray-600">프로젝트를 불러오지 못했습니다.</p>
        ) : !visibleProjects || visibleProjects.length === 0 ? (
          <p className="w-full pt-70 text-center text-gray-600">
            해당 학년의 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="grid w-full max-w-[1000px] grid-cols-[repeat(auto-fill,224px)] justify-start gap-6">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
