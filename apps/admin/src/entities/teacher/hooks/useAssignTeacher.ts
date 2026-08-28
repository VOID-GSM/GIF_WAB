"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { assignTeacher } from "../api/teacherApi";

export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("담당 선생님이 배정되었습니다.");
    },
    onError: () => {
      toast.error("담당 선생님 배정에 실패했습니다.");
    },
  });
}
