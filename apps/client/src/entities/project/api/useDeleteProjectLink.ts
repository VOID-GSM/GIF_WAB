"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteProjectLink } from "./projectLinkApi";

export function useDeleteProjectLink(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: number) => deleteProjectLink(projectId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", "links", projectId],
      });
      toast.success("링크가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("링크 삭제에 실패했습니다.");
    },
  });
}
