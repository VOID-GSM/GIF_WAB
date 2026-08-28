import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminFormDetail,
  getAdminForms,
  getAdminSubmitDetail,
  getSubmitSummary,
  patchDeadlineCompliance,
} from "@/entities/from-management/api/api";

export const formKeys = {
  adminForms: (grade?: number) => ["forms", "admin", grade] as const,
  adminFormDetail: (formId: number) =>
    ["forms", "admin", "detail", formId] as const,
  adminSubmitDetail: (formId: number) =>
    ["forms", "admin", "submit", formId] as const,
  adminSubmitSummary: (submitId: number) =>
    ["forms", "admin", "summary", submitId] as const,
};

export const useAdminForms = (grade?: number) =>
  useQuery({
    queryKey: formKeys.adminForms(grade),
    queryFn: () => getAdminForms(grade),
  });

export const useAdminFormDetail = (formId: number) =>
  useQuery({
    queryKey: formKeys.adminFormDetail(formId),
    queryFn: () => getAdminFormDetail(formId),
    enabled: !!formId,
  });

export const useAdminSubmitDetail = (formId: number) =>
  useQuery({
    queryKey: formKeys.adminSubmitDetail(formId),
    queryFn: () => getAdminSubmitDetail(formId),
    enabled: !!formId,
  });

// 마감 준수 여부 변경 — 제출 상세와 양식 목록(마감 현황 집계)을 함께 갱신한다.
export const useUpdateDeadlineCompliance = (formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submitId,
      deadlineComplied,
    }: {
      submitId: number;
      deadlineComplied: boolean;
    }) => patchDeadlineCompliance(submitId, deadlineComplied),
    onSuccess: (_, { deadlineComplied }) => {
      queryClient.invalidateQueries({
        queryKey: formKeys.adminSubmitDetail(formId),
      });
      queryClient.invalidateQueries({ queryKey: ["forms", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["form", "list"] });
      toast.success(
        `마감 ${deadlineComplied ? "준수" : "미준수"}로 변경했습니다.`,
      );
    },
    onError: () => toast.error("마감 준수 여부 변경에 실패했습니다."),
  });
};

// AI 요약 — 생성 비용이 크므로 캐시를 유지하고(staleTime: Infinity) 자동 재시도는 끈다.
export const useAdminSubmitSummary = (
  submitId: number,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: formKeys.adminSubmitSummary(submitId),
    queryFn: () => getSubmitSummary(submitId),
    enabled: !!submitId && (options?.enabled ?? true),
    staleTime: Infinity,
    retry: false,
  });
