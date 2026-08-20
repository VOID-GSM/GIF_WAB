import type { ReactNode } from "react";

import { getLinkHost } from "@repo/lib";

interface ProjectLinkChipProps {
  title: string;
  url: string;
  // 내 팀 상세처럼 편집이 가능할 때 hover 시 칩 안에 나타나는 버튼 슬롯 (admin 은 미사용)
  actions?: ReactNode;
}

// 프로젝트 링크 칩 — 이름만 작게 노출하고 클릭 시 새 탭으로 연다 (admin·client 공용)
export default function ProjectLinkChip({
  title,
  url,
  actions,
}: ProjectLinkChipProps) {
  return (
    <span className="group inline-flex max-w-full items-center rounded-full border border-gray-200 bg-white py-1 pl-3 pr-3 text-xs font-medium transition-colors hover:border-gray-300">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={getLinkHost(url)}
        className="flex min-w-0 items-center gap-1 text-gray-700 transition-colors hover:text-gray-900"
      >
        <span className="truncate">{title}</span>
        <span className="shrink-0 text-gray-400">↗</span>
      </a>

      {/* 편집 버튼은 평소 숨겨두고 hover 시에만 펼쳐 칩 크기를 작게 유지한다. */}
      {actions && (
        <span className="ml-0 flex w-0 items-center overflow-hidden opacity-0 transition-all group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
          {actions}
        </span>
      )}
    </span>
  );
}
