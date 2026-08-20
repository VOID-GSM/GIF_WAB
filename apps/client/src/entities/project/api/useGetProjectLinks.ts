"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjectLinks } from "./projectLinkApi";

export function useGetProjectLinks(projectId: number) {
  return useQuery({
    queryKey: ["project", "links", projectId],
    queryFn: () => getProjectLinks(projectId),
    enabled: Number.isFinite(projectId),
  });
}
