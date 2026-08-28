"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Chevron,
  Crown,
  Festival,
  GeneralSubject,
  MajorSubject,
  Person,
} from "@repo/ui";

import {
  GRADES,
  useGetFilteredProjects,
  type Grade,
} from "@/entities/project";
import { useGetAllTeachers, type TeacherListResponse } from "@/entities/teacher";
import { useGetMyInfo } from "@/entities/mypage";

const ADMIN_ROLE_LABEL: Record<string, string> = {
  GENERAL_TEACHER: "보통 교과",
  MAJOR_TEACHER: "전공 교과",
  MASTER: "아이디어 페스티벌 담당",
  VOID: "미지정",
};

// 역할별로 아바타 색과 아이콘을 다르게 줘서 한눈에 구분되게 한다.
const ADMIN_ROLE_AVATAR_STYLE: Record<string, string> = {
  MASTER: "bg-orange-100 text-orange-700",
  MAJOR_TEACHER: "bg-blue-100 text-blue-700",
  GENERAL_TEACHER: "bg-green-100 text-green-700",
  VOID: "bg-gray-100 text-gray-500",
};

const ADMIN_ROLE_ICON: Record<string, typeof Festival> = {
  MASTER: Festival,
  MAJOR_TEACHER: MajorSubject,
  GENERAL_TEACHER: GeneralSubject,
  VOID: Person,
};

// 학년별로 담당 팀 pill 색을 다르게 준다.
const GRADE_TEAM_PILL_STYLE: Record<Grade, string> = {
  1: "border-orange-500 bg-orange-50 text-orange-700",
  2: "border-yellow-600 bg-yellow-50 text-yellow-700",
};

// 위 pill 색과 동일한 톤으로 범례에 쓰는 점 색상
const GRADE_LEGEND_DOT_STYLE: Record<Grade, string> = {
  1: "bg-orange-500",
  2: "bg-yellow-600",
};

export default function TeacherListView() {
  const { data: myInfo, isLoading: isMyInfoLoading } = useGetMyInfo();
  const isMaster = myInfo?.adminRole === "MASTER";

  // myInfo로 MASTER임이 확인되기 전에는 선생님/프로젝트 목록을 미리 요청하지 않는다 —
  // 일반 admin이 이 페이지에 들어와도 어차피 버려질 API 호출을 보내지 않기 위함.
  const {
    data: teachers,
    isLoading: isTeachersLoading,
    isError,
  } = useGetAllTeachers(isMaster);

  // 담당 팀 pill을 학년별로 다르게 칠하기 위해 학년별 프로젝트 목록에서 팀명→학년 맵을 만든다.
  const { data: grade1Projects } = useGetFilteredProjects(GRADES[0], isMaster);
  const { data: grade2Projects } = useGetFilteredProjects(GRADES[1], isMaster);
  const teamGradeMap = new Map<string, Grade>(
    [...(grade1Projects ?? []), ...(grade2Projects ?? [])].map((project) => [
      project.teamName,
      project.grade,
    ]),
  );

  const isLoading = isMyInfoLoading || isTeachersLoading;
  const teacherSource = teachers;

  if (isMyInfoLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-[13px] font-medium text-gray-400">불러오는 중</p>
      </div>
    );
  }

  if (!isMaster) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <p className="text-[13px] font-medium text-gray-400">
          이 페이지는 아이디어 페스티벌 담당(MASTER)만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full justify-center bg-background">
      <div className="flex h-full w-full max-w-[600px] flex-col px-4 py-8">
        {/* 헤더 + 배정 이동 버튼 — 공지·문의 목록과 동일하게 한 줄에 배치, 스크롤 영역 밖에 고정 */}
        <div className="flex shrink-0 items-end justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-[19px] font-semibold tracking-[-0.3px] text-gray-900">
              선생님 관리
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
              전체 선생님 정보를 확인하고 담당 팀을 배정할 수 있습니다.
              {teacherSource && ` (전체 ${teacherSource.length}명)`}
            </p>
          </div>
          <Link
            href="/teachers/assign"
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] bg-yellow-600 px-3.5 text-[13px] font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-[0.98]"
          >
            담당 팀 배정
            <Chevron direction="right" className="h-3 w-3" />
          </Link>
        </div>

        {/* 담당 팀 pill 색 범례 */}
        <div className="mt-4 flex shrink-0 items-center gap-3 text-[12px] text-gray-500">
          {GRADES.map((grade) => (
            <span key={grade} className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${GRADE_LEGEND_DOT_STYLE[grade]}`}
              />
              {grade}학년
            </span>
          ))}
        </div>

        {/* 목록 — 이 영역만 스크롤된다. 스크롤바 색도 라이트/다크 배경에 맞춰 준다 */}
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--color-gray-300)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[scrollbar-color:var(--color-gray-600)_transparent] dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          {isLoading ? (
            <p className="py-16 text-center text-[13px] font-medium text-gray-400">
              불러오는 중
            </p>
          ) : isError ? (
            <p className="py-16 text-center text-[13px] font-medium text-red-500">
              선생님 목록을 불러오지 못했습니다.
            </p>
          ) : !teacherSource || teacherSource.length === 0 ? (
            <p className="py-16 text-center text-[13px] font-medium text-gray-400">
              등록된 선생님이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5 pb-4">
              {teacherSource.map((teacher) => (
                <TeacherRow
                  key={teacher.id}
                  teacher={teacher}
                  teamGradeMap={teamGradeMap}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherRow({
  teacher,
  teamGradeMap,
}: {
  teacher: TeacherListResponse;
  teamGradeMap: Map<string, Grade>;
}) {
  const RoleIcon =
    ADMIN_ROLE_ICON[teacher.adminRole] ?? ADMIN_ROLE_ICON.VOID;
  const isVoid = teacher.adminRole === "VOID";

  return (
    <li className="flex w-full items-center gap-3 rounded-[12px] border border-gray-200 bg-white px-4 py-3.5 transition-colors hover:border-yellow-600 hover:bg-yellow-50">
      {/* 역할 아바타 — VOID는 전용 이미지, 그 외엔 아이콘으로 역할을 구분하고, 학년부장은 우측 하단에 왕관 배지가 붙는다 */}
      <div className="relative shrink-0">
        {isVoid ? (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <Image
              src="/void-avatar.png"
              alt="미지정"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              ADMIN_ROLE_AVATAR_STYLE[teacher.adminRole] ??
              ADMIN_ROLE_AVATAR_STYLE.VOID
            }`}
          >
            <RoleIcon className="h-5 w-5" />
          </div>
        )}
        {teacher.isGradeHead && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-600 text-black shadow-sm"
            title="학년부장"
          >
            <Crown className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[14px] font-medium text-gray-800">
            {teacher.name}
          </span>
          {!isVoid && (
            <span className="text-[12px] text-gray-400">
              {ADMIN_ROLE_LABEL[teacher.adminRole] ?? teacher.adminRole}
              {teacher.isGradeHead ? " · 학년부장" : ""}
            </span>
          )}
        </div>
        <span className="truncate text-[12px] text-gray-400">
          {teacher.email}
        </span>
      </div>

      {!isVoid && (
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {teacher.adminTeam ? (
            // adminTeam은 콤마로 여러 팀이 함께 내려올 수 있다 (예: "보이드, 노바"), 학년별로 pill 색이 다르다
            teacher.adminTeam
              .split(",")
              .map((team) => team.trim())
              .filter(Boolean)
              .map((team) => (
                <span
                  key={team}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    teamGradeMap.has(team)
                      ? GRADE_TEAM_PILL_STYLE[teamGradeMap.get(team)!]
                      : "border-yellow-600 bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {team}
                </span>
              ))
          ) : (
            <span className="rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
              미배정
            </span>
          )}
        </div>
      )}
    </li>
  );
}
