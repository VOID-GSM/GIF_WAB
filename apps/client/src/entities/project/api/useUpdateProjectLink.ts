"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ProjectLinkRequest } from "../model/types";
import { updateProjectLink } from "./projectLinkApi";

interface UpdateProjectLinkVariables extends ProjectLinkRequest {
  linkId: number;
}

export function useUpdateProjectLink(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, ...data }: UpdateProjectLinkVariables) =>
      updateProjectLink(projectId, linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", "links", projectId],
      });
      toast.success("링크가 수정되었습니다.");
    },
    onError: () => {
      toast.error("링크 수정에 실패했습니다.");
    },
  });
}
