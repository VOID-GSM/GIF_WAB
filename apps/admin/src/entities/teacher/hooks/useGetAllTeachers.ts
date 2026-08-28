"use client";

import { useQuery } from "@tanstack/react-query";

import { getAllTeachers } from "../api/teacherApi";

export function useGetAllTeachers(enabled = true, projectId?: number) {
  return useQuery({
    queryKey: ["teachers", projectId ?? "all"],
    queryFn: () => getAllTeachers(projectId),
    enabled,
  });
}
