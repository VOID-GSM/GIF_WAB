"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { respondAssignment } from "../api/teacherApi";
import type { RespondAssignmentRequest } from "../model/type";

interface RespondAssignmentVariables {
  assignmentId: number;
  body: RespondAssignmentRequest;
}

export function useRespondAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, body }: RespondAssignmentVariables) =>
      respondAssignment(assignmentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("배정 응답이 처리되었습니다.");
    },
    onError: () => {
      toast.error("배정 응답 처리에 실패했습니다. 다시 시도해주세요.");
    },
  });
}
