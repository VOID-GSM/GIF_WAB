"use client";

import { useRouter } from "next/navigation";

import { DeadlineStatusSection, FormListSection, ProjectInfo } from "@repo/ui";

import { getDeadlineSummary, useGetForms } from "@/entities/form";
import { useGetMyProject, useGetProject } from "@/entities/project";

import AiSummarySection from "@/widgets/project-detail/ui/AiSummarySection";
import ProjectLinkSection from "@/widgets/project-detail/ui/ProjectLinkSection";
import ScheduleSection from "@/widgets/project-detail/ui/ScheduleSection";

interface ProjectDetailViewProps {
  projectId: number;
}

export default function ProjectDetailView({
  projectId,
}: ProjectDetailViewProps) {
  const router = useRouter();

  const { data: project, isPending, isError } = useGetProject(projectId);
  const { data: myProjects } = useGetMyProject();
  const { data: forms } = useGetForms(projectId);

  // 내 팀 여부 — 내 프로젝트 목록에 현재 상세 id가 포함되는지로 판단
  const isMine = myProjects?.some((p) => p.id === projectId) ?? false;

  const goToEdit = () => router.push(`/projects/${projectId}/edit`);

  // 양식 클릭 — 제출했으면 수정/상세, 아니면 제출 페이지로 이동
  const goToForm = (formId: number) => {
    const form = forms?.find((f) => f.id === formId);
    router.push(`/form/${formId}/${form?.submitted ? "edit" : "submit"}`);
  };

  if (isPending || isError || !project) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <p className="text-[14px] text-gray-600">
          {isError ? "프로젝트를 불러오지 못했습니다." : "불러오는 중..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh justify-center bg-background px-4 pb-8 pt-[67px]">
      <div className="flex w-full min-w-0 max-w-[830px] flex-col">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-lg font-semibold text-gray-700 transition-colors hover:text-gray-900"
        >
          ← 뒤로
        </button>

        {/* 정보 영역 — 생성 페이지와 동일한 레이아웃 (로고 · 팀 정보 · 설명) */}
        {/* AI 요약(다른 팀 프로젝트일 때만)은 로고 영역과 설명 사이에 노출 */}
        <ProjectInfo
          project={project}
          summary={
            !isMine ? <AiSummarySection projectId={projectId} /> : undefined
          }
        />

        {/* 링크 — 설명 바로 아래에 작은 칩으로. 다른 팀은 등록된 링크가 있을 때만 노출 */}
        <div className="mt-4 empty:mt-0">
          <ProjectLinkSection projectId={projectId} editable={isMine} />
        </div>

        {/* 마감현황 · 양식 목록 (좌) / 일정 캘린더 (우) — 내 팀일 때만 */}
        {/* 프로젝트 설명 ↔ 마감현황 간격 56px */}
        {isMine && (
          <div className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-12">
            {/* 좌측: 일정(우측) 높이에 맞춰 늘어나고, 양식 목록이 남는 공간을 채우며 스크롤 */}
            <div className="flex flex-1 flex-col gap-8 sm:min-h-0">
              <DeadlineStatusSection
                summary={getDeadlineSummary(forms ?? [])}
              />
              <FormListSection
                forms={forms ?? []}
                onFormClick={goToForm}
              />
            </div>
            <ScheduleSection projectId={projectId} forms={forms ?? []} />
          </div>
        )}

        {/* 수정하기 — 하단 중앙. 일정 ↔ 수정하기 간격 60px */}
        {isMine && (
          <div className="mt-[60px] flex justify-center">
            <button
              type="button"
              onClick={goToEdit}
              className="rounded-full bg-yellow-600 px-10 py-2.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
            >
              수정하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
