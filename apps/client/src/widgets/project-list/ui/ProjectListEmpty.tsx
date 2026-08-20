"use client";

import type { ClientRole } from "@/entities/signup";

interface ProjectListEmptyProps {
  role: ClientRole;
  onCreateProject?: () => void;
}

export default function ProjectListEmpty({
  role,
  onCreateProject,
}: ProjectListEmptyProps) {
  if (role === "LEADER") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <p className="text-gray-500">아직 생성한 프로젝트가 없습니다.</p>
        <button
          type="button"
          onClick={onCreateProject}
          className="flex items-center rounded-4xl bg-yellow-600 px-8 py-[10px] text-[16px] font-semibold cursor-pointer"
        >
          프로젝트 생성하기
        </button>
      </div>
    );
  }

  return (
    <p className="py-20 text-center text-gray-500">
      아직 참여한 프로젝트가 없습니다. <br /> 팀장이 프로젝트를 생성하면
      자동으로 참여됩니다.
    </p>
  );
}
