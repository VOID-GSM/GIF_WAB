"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { splitAllowedExtensions, isValidSubmissionUrl } from "@repo/ui";
import {
  CalendarField,
  FileField,
  TextField,
  isFieldRequired,
  type CalendarEvent,
} from "@/entities/form-submissions/index";
import { usePostFormSubmit } from "@/entities/form-submissions/hooks/usePostFormSubmit";
import { usePostFormUpload } from "@/entities/form-submissions/hooks/usePostFormUpload";
import { useGetFormDetail } from "@/entities/form-submissions/hooks/useGetFormDetail";
import type { FormAnswerItem } from "@/entities/form-submissions/model/types";
import { useGetMyInfo } from "@/entities/mypage/index";
import {
  FORM_QUERY_KEY,
  formatDeadlineDate,
  formatDeadlineTime,
} from "@/entities/form";
import { toast } from "sonner";

type Props = { formId: number };

export default function FormSubmitView({ formId }: Props) {
  const { data: myInfo, isLoading: myInfoLoading } = useGetMyInfo();
  const projectId = myInfo?.projectId;

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: formDetail, isLoading: detailLoading } =
    useGetFormDetail(formId);
  const { mutateAsync: submitForm, isPending } = usePostFormSubmit();
  const { mutateAsync: uploadFile } = usePostFormUpload();

  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [fileAnswers, setFileAnswers] = useState<Record<number, File | null>>(
    {},
  );
  // FILE 항목에 파일 대신 제출한 외부 링크 — 값이 있으면 파일보다 우선한다.
  const [urlAnswers, setUrlAnswers] = useState<Record<number, string>>({});
  const [calendarAnswers, setCalendarAnswers] = useState<
    Record<number, CalendarEvent[]>
  >({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

  const handleTextChange = (fieldId: number, value: string) => {
    setTextAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (value.trim()) setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleFileChange = (fieldId: number, file: File | null) => {
    setFileAnswers((prev) => ({ ...prev, [fieldId]: file }));
    if (file) setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleUrlChange = (fieldId: number, url: string) => {
    setUrlAnswers((prev) => ({ ...prev, [fieldId]: url }));
    if (url.trim()) setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleCalendarChange = (fieldId: number, events: CalendarEvent[]) =>
    setCalendarAnswers((prev) => ({ ...prev, [fieldId]: events }));

  // 링크로 제출한 FILE 항목 — 파일 업로드 대신 textAnswer 로 전송한다.
  const getSubmittedUrl = (
    field: { allowedExtensions?: string[] },
    fieldId: number,
  ) => {
    const { allowUrl } = splitAllowedExtensions(field.allowedExtensions);
    return allowUrl ? (urlAnswers[fieldId] ?? "").trim() : "";
  };

  const handleSubmit = async () => {
    if (!formDetail?.fields || !projectId) return;

    // 선택 항목(required=false)은 비워둔 채 제출할 수 있다.
    const errors: Record<number, string> = {};
    formDetail.fields.forEach((field) => {
      const fId = field.fieldId ?? field.id ?? 0;
      if (!isFieldRequired(field)) return;
      if (field.type === "TEXT" && !textAnswers[fId]?.trim()) {
        errors[fId] = "필수 항목입니다.";
      }
      // DATE·CALENDAR 는 비워두면 dateAnswer 가 빈 배열로 나가 서버에서 필수 항목 오류가 난다.
      if (
        (field.type === "DATE" || field.type === "CALENDAR") &&
        (calendarAnswers[fId] ?? []).length === 0
      ) {
        errors[fId] = "필수 항목입니다.";
      }
      if (field.type === "FILE") {
        const { allowUrl } = splitAllowedExtensions(field.allowedExtensions);
        const url = getSubmittedUrl(field, fId);
        if (url) {
          if (!isValidSubmissionUrl(url)) {
            errors[fId] =
              "http:// 또는 https:// 로 시작하는 링크를 입력해주세요.";
          }
        } else if (!fileAnswers[fId]) {
          errors[fId] = allowUrl
            ? "파일을 첨부하거나 외부 링크를 입력해주세요."
            : "파일을 첨부해주세요.";
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("필수 항목을 모두 작성해주세요.");
      return;
    }

    const answers: FormAnswerItem[] = formDetail.fields.flatMap(
      (field): FormAnswerItem[] => {
        const fId = field.fieldId ?? field.id ?? 0;
        if (field.type === "FILE") {
          // 파일은 upload 엔드포인트가, 외부 링크는 textAnswer 가 담당한다.
          const url = getSubmittedUrl(field, fId);
          return url ? [{ fieldId: fId, textAnswer: url }] : [];
        }

        if (field.type === "DATE" || field.type === "CALENDAR") {
          const events = calendarAnswers[fId] ?? [];
          // DATE·CALENDAR 모두 dateAnswer 배열(CalendarEventRequest[])로 전송한다.
          return [
            {
              fieldId: fId,
              dateAnswer: events.map((e) => ({
                eventName: e.title,
                startDate: e.startDate,
                endDate: e.endDate,
                color: e.color,
              })),
            },
          ];
        }

        return [
          {
            fieldId: fId,
            textAnswer: textAnswers[fId] ?? "",
          },
        ];
      },
    );

    try {
      const submitId = await submitForm({ formId, projectId, answers });

      // 링크로 제출한 항목은 파일을 골라뒀더라도 업로드하지 않는다.
      const urlSubmittedFieldIds = new Set(
        formDetail.fields
          .map((field) => [field, field.fieldId ?? field.id ?? 0] as const)
          .filter(
            ([field, fId]) =>
              field.type === "FILE" && !!getSubmittedUrl(field, fId),
          )
          .map(([, fId]) => fId),
      );

      const fileEntries = Object.entries(fileAnswers).filter(
        ([fieldIdStr, file]) =>
          file instanceof File && !urlSubmittedFieldIds.has(Number(fieldIdStr)),
      ) as [string, File][];

      if (fileEntries.length > 0) {
        try {
          await Promise.all(
            fileEntries.map(([fieldIdStr, file]) => {
              const fd = new FormData();
              fd.append("file", file);
              return uploadFile({
                formData: fd,
                fieldId: Number(fieldIdStr),
                submitId,
              });
            }),
          );
        } catch {
          toast.error(
            "파일 업로드에 실패했습니다. 수정 페이지에서 파일을 다시 업로드해주세요.",
          );
          router.push(`/form/${formId}/edit`);
          return;
        }
      }

      await queryClient.invalidateQueries({ queryKey: FORM_QUERY_KEY });
      toast.success("답변이 제출되었습니다.");
      router.push("/form");
    } catch {
      toast.error("제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 px-5 bg-background">
      <div className="mx-auto w-full max-w-[560px]">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 w-fit mb-4 text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
        >
          ← 뒤로
        </button>
      </div>

      {myInfoLoading || detailLoading ? (
        <div className="flex w-full justify-center pt-20 text-gray-500 font-medium">
          로딩중...
        </div>
      ) : !projectId ? (
        <div className="flex w-full justify-center pt-20 text-gray-500 font-medium">
          프로젝트 정보를 불러올 수 없습니다.
        </div>
      ) : !formDetail ? (
        <div className="flex w-full justify-center pt-20 text-gray-500 font-medium">
          양식 정보를 불러올 수 없습니다.
        </div>
      ) : (
        <div className="mx-auto flex flex-col w-full max-w-[560px] gap-4">
          <div className="flex flex-col gap-2">
            <span className="flex justify-center text-[24px] font-semibold text-gray-900">
              {formDetail.title}
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-medium text-gray-900">
              <span>마감 날짜: {formatDeadlineDate(formDetail.deadline)}</span>
              {formatDeadlineTime(formDetail.deadline) && (
                <span>마감 시간: {formatDeadlineTime(formDetail.deadline)}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {(formDetail.fields ?? [])
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((field, index) => {
                const fId = field.fieldId ?? field.id ?? index;
                const error = fieldErrors[fId];
                const required = isFieldRequired(field);
                return (
                  <div
                    key={fId}
                    className="flex flex-col py-6 px-6 sm:py-8 sm:px-12 border-t-5 border-yellow-600 bg-white rounded-[10px] shadow-new"
                  >
                    <span className="text-[20px] font-semibold pb-2 text-gray-900">
                      {field.title}
                      {required ? (
                        <span className="ml-1 text-red-500">*</span>
                      ) : (
                        <span className="ml-2 text-[14px] font-medium text-gray-400">
                          (선택)
                        </span>
                      )}
                    </span>
                    {field.description && (
                      <span className="font-medium text-gray-500 pb-4 whitespace-pre-wrap">
                        {field.description}
                      </span>
                    )}

                    {field.type === "TEXT" && (
                      <>
                        <TextField
                          fieldId={fId}
                          value={textAnswers[fId] ?? ""}
                          onChange={handleTextChange}
                        />
                        {error && (
                          <span className="mt-1 text-[12px] text-red-500">
                            {error}
                          </span>
                        )}
                      </>
                    )}
                    {field.type === "FILE" && (
                      <>
                        <FileField
                          fieldId={fId}
                          file={
                            fileAnswers[fId] instanceof File
                              ? (fileAnswers[fId] as File)
                              : null
                          }
                          allowedExtensions={field.allowedExtensions}
                          url={urlAnswers[fId] ?? ""}
                          onChange={handleFileChange}
                          onUrlChange={handleUrlChange}
                        />
                        {error && (
                          <span className="mt-1 text-[12px] text-red-500">
                            {error}
                          </span>
                        )}
                      </>
                    )}
                    {(field.type === "DATE" || field.type === "CALENDAR") && (
                      <CalendarField
                        fieldId={fId}
                        mode="write"
                        editable={true}
                        events={calendarAnswers[fId] ?? []}
                        onChange={handleCalendarChange}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          <div className="pb-20">
            <button
              className="flex w-full items-center justify-center py-3 font-medium bg-yellow-600 rounded-[10px] cursor-pointer disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "제출 중..." : "제출하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
