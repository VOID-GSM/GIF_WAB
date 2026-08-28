"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyAssignments } from "../api/teacherApi";

export function useGetMyAssignments() {
  return useQuery({
    queryKey: ["teachers", "assignments", "my"],
    queryFn: getMyAssignments,
  });
}
