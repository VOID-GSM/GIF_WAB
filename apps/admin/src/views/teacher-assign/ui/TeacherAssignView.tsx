"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ProjectLogo } from "@repo/ui";

import {
  GRADES,
  useGetFilteredProjects,
  useStoredGrade,
  type FilteredProject,
} from "@/entities/project";
import {
  useAssignTeacher,
  useGetAllTeachers,
  type AssignmentInfo,
  type TeacherListResponse,
} from "@/entities/teacher";
import { useGetMyInfo } from "@/entities/mypage";
import GradeFilter from "@/features/project-filter/ui/GradeFilter";
import AssignConfirmModal from "@/widgets/teacher-assign/ui/AssignConfirmModal";

const ADMIN_ROLE_LABEL: Record<string, string> = {
  GENERAL_TEACHER: "보통 교과",
  MAJOR_TEACHER: "전공 교과",
  MASTER: "아이디어 페스티벌 담당",
  VOID: "미지정",
};

const ASSIGNMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

const ASSIGNMENT_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-800",
  ACCEPTED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function TeacherAssignView() {
  const { data: myInfo, isLoading: isMyInfoLoading } = useGetMyInfo();
  const { grade, setGrade } = useStoredGrade();
  const isMaster = myInfo?.adminRole === "MASTER";

  // myInfo로 MASTER임이 확인되기 전에는 프로젝트/선생님 목록을 미리 요청하지 않는다 —
  // 일반 admin이 이 페이지에 들어와도 어차피 버려질 API 호출을 보내지 않기 위함.
  const {
    data: projects,
    isPending: isProjectsPending,
    isError: isProjectsError,
  } = useGetFilteredProjects(grade ?? GRADES[0], grade !== null && isMaster);

  const [selectedProject, setSelectedProject] =
    useState<FilteredProject | null>(null);

  const {
    data: teachers,
    isLoading: isTeachersLoading,
    isError: isTeachersError,
  } = useGetAllTeachers(isMaster && !!selectedProject, selectedProject?.id);

  const visibleProjects = projects?.filter((p) => p.grade === grade);

  if (isMyInfoLoading || grade === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  if (!isMaster) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <p className="text-gray-500">
          이 페이지는 아이디어 페스티벌 담당(MASTER)만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-start gap-8 bg-background px-10 py-10">
      <div className="flex w-full max-w-[1000px] flex-col gap-2">
        <Link
          href="/teachers"
          className="mb-2 flex w-fit items-center gap-1 text-[14px] font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          ← 선생님 목록으로
        </Link>
        <h1 className="text-[22px] font-semibold tracking-[-0.5px] text-gray-900">
          담당 선생님 배정
        </h1>
        <p className="text-[14px] text-gray-500">
          프로젝트를 선택하면 담당 선생님을 배정할 수 있어요.
        </p>
      </div>

      <div className="flex w-full max-w-[1000px] flex-wrap gap-3">
        <GradeFilter value={grade} onChange={setGrade} />
      </div>

      <div className="w-full max-w-[1000px]">
        {isProjectsPending ? (
          <p className="text-gray-500">불러오는 중...</p>
        ) : isProjectsError ? (
          <p className="text-gray-500">프로젝트를 불러오지 못했습니다.</p>
        ) : !visibleProjects || visibleProjects.length === 0 ? (
          <p className="pt-20 text-center text-gray-500">
            해당 학년의 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,224px)] justify-start gap-6">
            {visibleProjects.map((project) => (
              <ProjectSelectCard
                key={project.id}
                project={project}
                selected={selectedProject?.id === project.id}
                onClick={() =>
                  setSelectedProject((prev) =>
                    prev?.id === project.id ? null : project,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* 배경 딤 처리 — 패널만 밝게 남기고 왼쪽 네비게이션을 포함한 나머지 전체를 어둡게, 바깥 클릭 시 닫힘 */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[110] bg-black/40"
          onClick={() => setSelectedProject(null)}
        />
      )}

      {/* 선생님 배정 패널 (데스크톱) — 사이드바처럼 화면 오른쪽에 꽉 차게 슬라이드 */}
      <aside
        className={`fixed top-0 right-0 z-[120] hidden h-screen w-full max-w-[440px] flex-col border-l border-gray-200 bg-white shadow-new transition-transform duration-300 ease-out lg:flex ${
          selectedProject ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <AssignPanelHeader
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
        <AssignPanelList
          project={selectedProject}
          teacherSource={teachers}
          isLoading={isTeachersLoading}
          isError={isTeachersError}
        />
      </aside>

      {/* 선생님 배정 패널 (모바일) — 아래에서 절반 높이로 올라오고, 끌어올리면 전체화면으로 확장 */}
      <MobileAssignSheet
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      >
        <AssignPanelHeader
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
        <AssignPanelList
          project={selectedProject}
          teacherSource={teachers}
          isLoading={isTeachersLoading}
          isError={isTeachersError}
        />
      </MobileAssignSheet>
    </div>
  );
}

function AssignPanelHeader({
  project,
  onClose,
}: {
  project: FilteredProject | null;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 px-6 py-6">
      {/* 미니 프로젝트 상세 — 로고, 프로젝트명, 팀명 */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[10px] bg-yellow-50">
          <ProjectLogo
            src={project?.logo ?? ""}
            alt={project?.name ?? ""}
            className="h-full w-full object-cover"
            fallbackClassName="h-full w-full bg-white object-contain p-2"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[20px] font-semibold tracking-[-0.5px] text-gray-900">
            {project?.name}
          </p>
          <p className="truncate text-[14px] font-medium text-gray-500">
            {project?.teamName}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}

function AssignPanelList({
  project,
  teacherSource,
  isLoading,
  isError,
}: {
  project: FilteredProject | null;
  teacherSource: TeacherListResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  // 선생님을 바로 배정하지 않고, 먼저 확인 모달을 띄운 뒤 확정할 때 배정 API를 호출한다.
  const [confirmTeacher, setConfirmTeacher] =
    useState<TeacherListResponse | null>(null);
  const { mutate: assign, isPending } = useAssignTeacher();

  const handleConfirm = () => {
    if (!project || !confirmTeacher) return;
    assign(
      { projectId: project.id, teacherId: confirmTeacher.id },
      { onSuccess: () => setConfirmTeacher(null) },
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <p className="text-[13px] font-medium text-gray-500">담당 선생님 배정</p>

      {isLoading ? (
        <p className="py-8 text-center text-[14px] text-gray-500">
          불러오는 중...
        </p>
      ) : isError ? (
        <p className="py-8 text-center text-[14px] text-gray-500">
          선생님 목록을 불러오지 못했습니다.
        </p>
      ) : !teacherSource || teacherSource.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-gray-500">
          등록된 선생님이 없습니다.
        </p>
      ) : (
        project &&
        (() => {
          // 한 팀에는 선생님을 한 명만 배정할 수 있다 — 이미 이 팀 담당인 선생님이 있으면
          // 그 사람 외 나머지는 클릭할 수 없게 막는다.
          const assignedTeacherId = teacherSource.find((t) =>
            (t.adminTeam ?? "")
              .split(",")
              .map((team) => team.trim())
              .includes(project.teamName),
          )?.id;

          return (
            <ul className="flex flex-col gap-2">
              {teacherSource.map((teacher) => {
                const assignmentInfo = getProjectAssignmentInfo(
                  teacher.assignmentInfo,
                  project,
                );

                return (
                  <TeacherOptionRow
                    key={teacher.id}
                    teacher={teacher}
                    assignmentInfo={assignmentInfo}
                    disabled={
                      assignedTeacherId !== undefined &&
                      assignedTeacherId !== teacher.id
                    }
                    onClick={() => setConfirmTeacher(teacher)}
                  />
                );
              })}
            </ul>
          );
        })()
      )}

      {project && confirmTeacher && (
        <AssignConfirmModal
          teacherName={confirmTeacher.name}
          teamName={project.teamName}
          isPending={isPending}
          onConfirm={handleConfirm}
          onClose={() => setConfirmTeacher(null)}
        />
      )}
    </div>
  );
}

function getProjectAssignmentInfo(
  assignmentInfo: AssignmentInfo | undefined,
  project: FilteredProject,
) {
  if (!assignmentInfo) return undefined;

  if (assignmentInfo.projectId !== undefined) {
    return assignmentInfo.projectId === project.id ? assignmentInfo : undefined;
  }

  if (assignmentInfo.teamName !== undefined) {
    return assignmentInfo.teamName === project.teamName
      ? assignmentInfo
      : undefined;
  }

  return undefined;
}

// 모바일 하단 시트 — 열리면 화면 절반 높이로 뜨고, 손잡이를 위로 끌면 전체화면까지 확장된다.
function MobileAssignSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const HALF = 50;
  const FULL = 0;
  const CLOSED = 100;

  const [offset, setOffset] = useState(CLOSED);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(HALF);

  // open이 false→true로 바뀌는 렌더에서 절반 높이로 리셋한다 (이펙트 대신 렌더 중 상태 조정).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setOffset(HALF);
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = offset;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartYRef.current;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const next = Math.min(
      CLOSED,
      Math.max(FULL, dragStartOffsetRef.current + deltaPercent),
    );
    setOffset(next);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    // 가까운 스냅 지점(전체화면 / 절반 / 닫힘)으로 정렬
    if (offset < HALF / 2) {
      setOffset(FULL);
    } else if (offset < (HALF + CLOSED) / 2) {
      setOffset(HALF);
    } else {
      setOffset(CLOSED);
      onClose();
    }
  };

  // translateY 대신 실제 height를 조절한다 — 그래야 절반만 보여도 내부 스크롤 영역의
  // 실제 높이가 화면에 보이는 만큼으로 줄어들어 스크롤이 정상 동작한다.
  const visibleOffset = open ? offset : CLOSED;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[120] flex flex-col overflow-hidden rounded-t-[20px] bg-white shadow-new lg:hidden ${
        isDragging ? "" : "transition-[height] duration-300 ease-out"
      }`}
      style={{ height: `${100 - visibleOffset}dvh` }}
    >
      <div
        className="flex shrink-0 cursor-grab touch-none items-center justify-center py-3 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="h-[4px] w-[40px] rounded-full bg-gray-200" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function ProjectSelectCard({
  project,
  selected,
  onClick,
}: {
  project: FilteredProject;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[176px] w-[224px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[12px] bg-white text-left shadow-new transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg ${
        selected ? "ring-2 ring-yellow-600" : ""
      }`}
    >
      <div className="h-[112px] w-full">
        <ProjectLogo
          src={project.logo}
          alt={project.name}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full bg-white object-contain p-5"
        />
      </div>
      <div
        className={`flex h-[64px] flex-col justify-center pr-[32px] pl-[20px] leading-[1.4] transition-colors ${
          selected ? "bg-yellow-100" : "bg-yellow-50"
        }`}
      >
        <p className="truncate text-[20px] font-semibold tracking-[-0.5px] text-black">
          {project.name}
        </p>
        <p className="truncate text-[16px] font-medium tracking-[-0.4px] text-gray-600">
          {project.teamName}
        </p>
      </div>
    </button>
  );
}

function TeacherOptionRow({
  teacher,
  assignmentInfo,
  disabled,
  onClick,
}: {
  teacher: TeacherListResponse;
  assignmentInfo?: AssignmentInfo;
  disabled: boolean;
  onClick: () => void;
}) {
  const descriptionParts = [
    ADMIN_ROLE_LABEL[teacher.adminRole] ?? teacher.adminRole,
    teacher.isGradeHead ? "학년부장" : null,
    teacher.adminTeam || null,
  ].filter(Boolean);

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-gray-100 px-4 py-3 text-left transition-colors hover:border-yellow-600 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-100 disabled:hover:bg-transparent"
      >
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-gray-900">
            {teacher.name}
          </p>
          <p className="truncate text-[12px] text-gray-500">
            {descriptionParts.join(" · ")}
          </p>
          {assignmentInfo?.status === "REJECTED" &&
            assignmentInfo.rejectReason && (
              <p
                className="mt-0.5 truncate text-[12px] text-red-600"
                title={assignmentInfo.rejectReason}
              >
                거절 사유: {assignmentInfo.rejectReason}
              </p>
            )}
        </div>

        {assignmentInfo && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ${
              ASSIGNMENT_STATUS_STYLE[assignmentInfo.status] ??
              "bg-gray-50 text-gray-600"
            }`}
          >
            {ASSIGNMENT_STATUS_LABEL[assignmentInfo.status] ??
              assignmentInfo.status}
          </span>
        )}
      </button>
    </li>
  );
}
