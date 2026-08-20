"use client";

import { ProjectLinkChip } from "@repo/ui";

import { useGetProjectLinks } from "@/entities/project";

interface ProjectLinkSectionProps {
  projectId: number;
}

// 링크 — 팀이 등록한 GitHub·배포 주소 등을 열람만 한다 (등록·수정은 client 에서만 가능)
export default function ProjectLinkSection({
  projectId,
}: ProjectLinkSectionProps) {
  const { data: links } = useGetProjectLinks(projectId);

  if (!links?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <ProjectLinkChip key={link.id} title={link.title} url={link.url} />
      ))}
    </div>
  );
}
