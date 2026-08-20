"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ProjectLinkRequest } from "../model/types";
import { createProjectLink } from "./projectLinkApi";

export function useCreateProjectLink(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectLinkRequest) =>
      createProjectLink(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", "links", projectId],
      });
      toast.success("링크가 추가되었습니다.");
    },
    onError: () => {
      toast.error("링크 추가에 실패했습니다.");
    },
  });
}
