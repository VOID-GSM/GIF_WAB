"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjectLinks } from "../api";

export function useGetProjectLinks(projectId: number) {
  return useQuery({
    queryKey: ["project", "links", projectId],
    queryFn: async () => (await getProjectLinks(projectId)).data,
    enabled: Number.isFinite(projectId),
  });
}
