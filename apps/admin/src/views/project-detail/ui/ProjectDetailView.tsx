"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DeadlineStatusSection, FormListSection, ProjectInfo } from "@repo/ui";

import { getDeadlineSummary, useGetForms } from "@/entities/form";
import { getAdminSubmitDetail } from "@/entities/from-management/api/api";
import { formKeys } from "@/entities/from-management/api/query";
import { useGetMyInfo } from "@/entities/mypage";
import {
  useGetProject,
  useTransferLeader,
  type ProjectMember,
} from "@/entities/project";
import AiSummarySection from "@/widgets/project-detail/ui/AiSummarySection";
import LeaderTransferModal from "@/widgets/project-detail/ui/LeaderTransferModal";
import ProjectLinkSection from "@/widgets/project-detail/ui/ProjectLinkSection";
import MemoSection from "@/widgets/project-detail/ui/MemoSection";
import ScoreAssignSection from "@/widgets/project-detail/ui/ScoreAssignSection";

interface ProjectDetailViewProps {
  projectId: number;
}

// 관리자 프로젝트 상세 — 모든 팀의 마감현황·양식 목록 열람, 일정 대신 메모
export default function ProjectDetailView({
  projectId,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: project, isPending: isProjectPending, isError } =
    useGetProject(projectId);
  const { data: forms, isPending: isFormsPending } = useGetForms(projectId);
  const { data: myInfo } = useGetMyInfo();
  const isPending = isProjectPending || isFormsPending;

  // 팀장 양도는 아이디어페스티벌 담당(MASTER) 관리자만 가능하다.
  const canTransferLeader = myInfo?.adminRole === "MASTER";
  const { mutate: transferLeader, isPending: isTransferring } =
    useTransferLeader(projectId);
  const [transferTarget, setTransferTarget] = useState<ProjectMember | null>(
    null,
  );

  // 팀원 클릭 시 양도 확인 모달 — 이미 팀장인 멤버는 제외
  const handleMemberClick = (member: ProjectMember) => {
    if (member.role === "LEADER") return;
    setTransferTarget(member);
  };

  const handleConfirmTransfer = () => {
    if (!transferTarget) return;
    transferLeader(transferTarget.userId, {
      onSuccess: () => setTransferTarget(null),
    });
  };

  // 양식 클릭 → 이 팀이 제출한 양식 상세로 이동.
  // forms 목록에는 submitId가 없어, 양식별 제출 내역을 조회해 이 프로젝트의 제출을 찾는다.
  const isNavigatingRef = useRef(false);
  const handleFormClick = async (formId: number) => {
    // 빠른 연속 클릭으로 중복 요청·이동이 발생하지 않도록 진행 중에는 무시한다.
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    try {
      const submissions = await queryClient.fetchQuery({
        queryKey: formKeys.adminSubmitDetail(formId),
        queryFn: () => getAdminSubmitDetail(formId),
      });
      const submission = submissions.find((s) => s.projectId === projectId);
      if (!submission) {
        toast.error("이 팀이 제출한 양식이 없습니다.");
        return;
      }
      router.push(`/form/submissions/${formId}/${submission.submitId}`);
    } catch {
      toast.error("양식을 불러오지 못했습니다.");
    } finally {
      isNavigatingRef.current = false;
    }
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

        {/* 정보 영역 — 클라이언트 상세와 동일한 레이아웃 */}
        {/* AI 요약은 로고 영역과 설명 사이에 노출 */}
        <ProjectInfo
          project={project}
          summary={<AiSummarySection projectId={projectId} />}
          onMemberClick={canTransferLeader ? handleMemberClick : undefined}
        />

        {/* 링크 — 팀이 등록한 GitHub·배포 주소. 등록된 링크가 없으면 노출하지 않는다 */}
        <div className="mt-4 empty:mt-0">
          <ProjectLinkSection projectId={projectId} />
        </div>

        {/* 마감현황 · 양식 목록 (좌) / 메모 (우) */}
        <div className="mt-14 flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12">
          {/* 좌측: 메모(우측) 높이에 맞춰 늘어나고, 양식 목록이 남는 공간을 채우며 스크롤 */}
          <div className="flex flex-1 flex-col gap-8 lg:min-h-0">
            <DeadlineStatusSection summary={getDeadlineSummary(forms ?? [])} />
            <FormListSection forms={forms ?? []} onFormClick={handleFormClick} />
          </div>
          <MemoSection key={projectId} projectId={projectId} />
        </div>

        {/* 하단 — 역할별 점수 부여 버튼 */}
        <ScoreAssignSection projectId={projectId} />
      </div>

      {transferTarget && (
        <LeaderTransferModal
          memberName={transferTarget.name}
          isPending={isTransferring}
          onConfirm={handleConfirmTransfer}
          onClose={() => setTransferTarget(null)}
        />
      )}
    </div>
  );
}
