"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postScorePeriod } from "../api";

// 이미 설정된 기간을 다시 설정하려 할 때 백엔드가 내려주는 상태 코드.
// TODO: 실제 백엔드 응답으로 검증되면 필요 시 조정한다.
const ALREADY_SET_STATUS = 409;

export function isAlreadySetError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === ALREADY_SET_STATUS;
}

export function useSetScorePeriod() {
  return useMutation({
    mutationFn: postScorePeriod,
    onSuccess: () => {
      toast.success("평가 시작일이 설정되었습니다.");
    },
    onError: (error) => {
      if (isAlreadySetError(error)) {
        toast.error("이미 다른 담당자가 평가 시작일을 설정했습니다.");
        return;
      }
      toast.error("평가 시작일 설정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });
}
