"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { splitAllowedExtensions, isValidSubmissionUrl } from "@repo/ui";
import {
  CalendarField,
  FileField,
  TextField,
  type CalendarEvent,
  useGetFormMySubmit,
  usePatchFormSubmit,
  usePostFormUpload,
  useGetFormDetail,
  isFieldRequired,
} from "@/entities/form-submissions/index";
import type {
  SubmitAnswerItem,
  FormAnswerItem,
} from "@/entities/form-submissions/model/types";
import { useGetMyInfo } from "@/entities/mypage/index";
import {
  formatDeadlineDate,
  formatDeadlineTime,
  isDeadlinePassed,
} from "@/entities/form";
import { toast } from "sonner";

type Props = { formId: number };

const EMPTY_EVENTS: CalendarEvent[] = [];

function isDateStr(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function toCalendarEvents(
  answers: SubmitAnswerItem[],
  fieldId: number,
): CalendarEvent[] {
  // 백엔드는 DATE·CALENDAR 답변을 모두 dateAnswer 배열로 내려준다.
  return answers
    .filter(
      (a) =>
        a.fieldId === fieldId && (a.type === "DATE" || a.type === "CALENDAR"),
    )
    .flatMap((a) =>
      (a.dateAnswer ?? [])
        .filter((ev) => isDateStr(ev.startDate))
        .map((ev, i) => ({
          id: `${fieldId}-${ev.startDate}-${i}`,
          title: ev.eventName ?? "",
          startDate: ev.startDate,
          endDate: isDateStr(ev.endDate) ? ev.endDate : ev.startDate,
          color: ev.color || "gray",
        })),
    );
}

export default function FormMySubmitView({ formId }: Props) {
  const { data: myInfo } = useGetMyInfo();
  const projectId = myInfo?.projectId;

  const router = useRouter();

  const { data: formDetail, isLoading: detailLoading } =
    useGetFormDetail(formId);
  const { data: mySubmit, isLoading: submitLoading } = useGetFormMySubmit(
    { formId, projectId: projectId ?? 0 },
    { enabled: !!projectId },
  );
  const { mutateAsync: patchSubmit, isPending } = usePatchFormSubmit();
  const { mutateAsync: uploadFile } = usePostFormUpload();

  const [isEditing, setIsEditing] = useState(false);

  // 마감이 지난 제출 건은 열람만 가능 — 수정 불가
  const deadlinePassed = isDeadlinePassed(formDetail?.deadline ?? "");

  // fieldId → SubmitAnswerItem lookup (first occurrence wins)
  const answerMap = useMemo(() => {
    const map: Record<number, SubmitAnswerItem> = {};
    mySubmit?.answers.forEach((a) => {
      if (!(a.fieldId in map)) map[a.fieldId] = a;
    });
    return map;
  }, [mySubmit]);

  // Initial values from server response
  const initialTexts = useMemo(() => {
    const texts: Record<number, string> = {};
    mySubmit?.answers.forEach((a) => {
      if (a.type === "TEXT") texts[a.fieldId] = a.textAnswer ?? "";
    });
    return texts;
  }, [mySubmit]);

  // FILE 항목을 외부 링크로 제출한 경우, 링크는 textAnswer 로 내려온다.
  const initialUrls = useMemo(() => {
    const urls: Record<number, string> = {};
    mySubmit?.answers.forEach((a) => {
      if (a.type === "FILE" && a.textAnswer?.trim()) {
        urls[a.fieldId] = a.textAnswer.trim();
      }
    });
    return urls;
  }, [mySubmit]);

  const initialCalendars = useMemo(() => {
    const calendars: Record<number, CalendarEvent[]> = {};
    const processed = new Set<number>();
    mySubmit?.answers.forEach((a) => {
      if (
        (a.type === "DATE" || a.type === "CALENDAR") &&
        !processed.has(a.fieldId)
      ) {
        calendars[a.fieldId] = toCalendarEvents(mySubmit.answers, a.fieldId);
        processed.add(a.fieldId);
      }
    });
    return calendars;
  }, [mySubmit]);

  // User edits: undefined = unchanged, null = deleted, File = new file
  const [textEdits, setTextEdits] = useState<Record<number, string>>({});
  const [calendarEdits, setCalendarEdits] = useState<
    Record<number, CalendarEvent[]>
  >({});
  const [fileAnswers, setFileAnswers] = useState<Record<number, File | null>>(
    {},
  );
  const [urlEdits, setUrlEdits] = useState<Record<number, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

  const getTextValue = (fieldId: number) =>
    textEdits[fieldId] ?? initialTexts[fieldId] ?? "";
  const getCalendarValue = (fieldId: number) =>
    calendarEdits[fieldId] ?? initialCalendars[fieldId] ?? EMPTY_EVENTS;
  const getUrlValue = (fieldId: number) =>
    urlEdits[fieldId] ?? initialUrls[fieldId] ?? "";

  // admin 이 URL 제출을 허용한 FILE 항목에서만 링크 값을 답변으로 인정한다.
  const getSubmittedUrl = (
    field: { allowedExtensions?: string[] },
    fieldId: number,
  ) => {
    const { allowUrl } = splitAllowedExtensions(field.allowedExtensions);
    return allowUrl ? getUrlValue(fieldId).trim() : "";
  };

  const handleTextChange = (fieldId: number, value: string) => {
    setTextEdits((prev) => ({ ...prev, [fieldId]: value }));
    if (value.trim()) setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleFileChange = (fieldId: number, file: File | null) => {
    setFileAnswers((prev) => ({ ...prev, [fieldId]: file }));
    if (file) setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleUrlChange = (fieldId: number, url: string) => {
    setUrlEdits((prev) => ({ ...prev, [fieldId]: url }));
    if (url.trim()) setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleCalendarChange = (
    fieldId: number,
    updatedEvents: CalendarEvent[],
  ) => {
    setCalendarEdits((prev) => ({ ...prev, [fieldId]: updatedEvents }));
  };

  const handleCancel = () => {
    setTextEdits({});
    setCalendarEdits({});
    setFileAnswers({});
    setUrlEdits({});
    setFieldErrors({});
    setIsEditing(false);
  };

  const handlePatch = async () => {
    if (!mySubmit || !formDetail?.fields) return;

    // Validate — 선택 항목(required=false)은 비워둔 채 저장할 수 있다.
    const errors: Record<number, string> = {};
    formDetail.fields.forEach((field) => {
      const fId = field.fieldId ?? field.id ?? 0;
      const type = field.type?.toUpperCase();
      if (!isFieldRequired(field)) return;
      if (type === "TEXT" && !getTextValue(fId).trim()) {
        errors[fId] = "필수 항목입니다.";
      }
      // DATE·CALENDAR 는 비워두면 dateAnswer 가 빈 배열로 나가 서버에서 필수 항목 오류가 난다.
      if (
        (type === "DATE" || type === "CALENDAR") &&
        getCalendarValue(fId).length === 0
      ) {
        errors[fId] = "필수 항목입니다.";
      }
      if (type === "FILE") {
        const { allowUrl } = splitAllowedExtensions(field.allowedExtensions);
        const url = getSubmittedUrl(field, fId);
        if (url) {
          if (!isValidSubmissionUrl(url)) {
            errors[fId] =
              "http:// 또는 https:// 로 시작하는 링크를 입력해주세요.";
          }
        } else {
          const hasNewFile = fileAnswers[fId] instanceof File;
          const isDeleted = fileAnswers[fId] === null;
          const hasOriginalFile = !!answerMap[fId]?.filePath;
          if (isDeleted || (!hasNewFile && !hasOriginalFile)) {
            errors[fId] = allowUrl
              ? "파일을 첨부하거나 외부 링크를 입력해주세요."
              : "파일을 첨부해주세요.";
          }
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("필수 항목을 모두 작성해주세요.");
      return;
    }

    // Build answers from formDetail.fields
    const answers = (formDetail.fields ?? []).flatMap(
      (field): FormAnswerItem[] => {
        const fId = field.fieldId ?? field.id ?? 0;
        const type = field.type?.toUpperCase();

        if (type === "FILE") {
          // 외부 링크로 제출한 항목은 textAnswer 로 보낸다. PATCH 는 answer 를
          // 통째로 교체하므로 filePath 를 함께 보내지 않으면 기존 파일은 사라진다.
          const url = getSubmittedUrl(field, fId);
          if (url) return [{ fieldId: fId, textAnswer: url, filePath: url }];

          // 새 파일/삭제는 upload·delete 엔드포인트가 처리한다.
          // 그 외(파일을 안 건드린 경우)에는 PATCH 가 answer 를 통째로 교체하면서
          // 기존 파일이 사라지므로, filePath 를 함께 보내 보존한다.
          const hasNewFile = fileAnswers[fId] instanceof File;
          const isDeleted = fileAnswers[fId] === null;
          const existingPath = answerMap[fId]?.filePath;
          if (hasNewFile || isDeleted || !existingPath) return [];
          return [
            {
              fieldId: fId,
              filePath: existingPath,
              fileSize: answerMap[fId]?.fileSize ?? undefined,
              originalFileName: answerMap[fId]?.originalFileName ?? undefined,
            },
          ];
        }

        if (type === "DATE" || type === "CALENDAR") {
          // DATE·CALENDAR 모두 dateAnswer 배열(CalendarEventRequest[])로 전송한다.
          const calEvents = getCalendarValue(fId);
          return [
            {
              fieldId: fId,
              dateAnswer: calEvents.map((e) => ({
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
            textAnswer: getTextValue(fId),
          },
        ];
      },
    );

    try {
      await patchSubmit({ submitId: mySubmit.submitId, answers });
    } catch {
      toast.error("수정에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    // 링크로 제출한 항목은 파일을 골라뒀더라도 업로드하지 않는다.
    const urlSubmittedFieldIds = new Set(
      (formDetail.fields ?? [])
        .map((field) => [field, field.fieldId ?? field.id ?? 0] as const)
        .filter(
          ([field, fId]) =>
            field.type?.toUpperCase() === "FILE" &&
            !!getSubmittedUrl(field, fId),
        )
        .map(([, fId]) => fId),
    );

    const fileEntries = Object.entries(fileAnswers).filter(
      ([fieldIdStr, f]) =>
        f instanceof File && !urlSubmittedFieldIds.has(Number(fieldIdStr)),
    ) as [string, File][];

    if (fileEntries.length > 0) {
      // 업로드 실패를 삼키지 않는다. 하나라도 실패하면 성공으로 처리하지 않고
      // 수정 화면에 머물러 사용자가 다시 시도할 수 있게 한다.
      const results = await Promise.allSettled(
        fileEntries.map(([fieldIdStr, file]) => {
          const fd = new FormData();
          fd.append("file", file);
          return uploadFile({
            formData: fd,
            fieldId: Number(fieldIdStr),
            submitId: mySubmit.submitId,
          });
        }),
      );

      if (results.some((r) => r.status === "rejected")) {
        toast.error(
          "파일 업로드에 실패했습니다. 허용된 파일 형식(최대 10MB)인지 확인한 뒤 다시 시도해주세요.",
        );
        return;
      }
    }

    toast.success("답변이 수정되었습니다.");
    router.push("/form");
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 px-5 bg-background">
      {detailLoading || submitLoading ? (
        <div className="flex w-full justify-center pt-20 text-gray-500 font-medium">
          로딩중...
        </div>
      ) : !mySubmit ? (
        <div className="flex w-full justify-center pt-20 text-gray-500 font-medium">
          제출 정보를 불러올 수 없습니다.
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
                <span>
                  마감 시간: {formatDeadlineTime(formDetail.deadline)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {(formDetail.fields ?? [])
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((field, index) => {
                const fId = field.fieldId ?? field.id ?? index;
                const existingAnswer = answerMap[fId];
                const error = fieldErrors[fId];
                const required = isFieldRequired(field);

                // Compute filePath: hide when deleted or replaced with new file
                const isFileDeleted = fileAnswers[fId] === null;
                const hasNewFile = fileAnswers[fId] instanceof File;
                const serverFilePath =
                  isFileDeleted || hasNewFile
                    ? undefined
                    : existingAnswer?.filePath || undefined;

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
                          value={getTextValue(fId)}
                          readOnly={!isEditing}
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
                          // 수정 진입/취소 시 파일·링크 탭 상태를 초기화한다.
                          key={isEditing ? "editing" : "readonly"}
                          fieldId={fId}
                          file={hasNewFile ? (fileAnswers[fId] as File) : null}
                          filePath={serverFilePath}
                          fileSize={existingAnswer?.fileSize || undefined}
                          originalFileName={
                            existingAnswer?.originalFileName || undefined
                          }
                          submitId={mySubmit.submitId}
                          readOnly={!isEditing}
                          allowedExtensions={field.allowedExtensions}
                          url={getUrlValue(fId)}
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
                        mode={isEditing ? "write" : "view"}
                        editable={isEditing}
                        events={getCalendarValue(fId)}
                        onChange={handleCalendarChange}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          <div className="flex gap-5 pb-20">
            {isEditing ? (
              <>
                <button
                  className="flex w-full items-center justify-center py-3 font-medium border border-yellow-600 bg-white text-gray-900 rounded-[10px] cursor-pointer"
                  onClick={handleCancel}
                >
                  취소
                </button>
                <button
                  className="flex w-full items-center justify-center py-3 font-medium bg-yellow-600 rounded-[10px] cursor-pointer disabled:opacity-50"
                  onClick={handlePatch}
                  disabled={isPending}
                >
                  {isPending ? "저장 중..." : "완료하기"}
                </button>
              </>
            ) : deadlinePassed ? (
              <div className="flex w-full items-center justify-center py-3 font-medium text-gray-500">
                마감된 양식입니다. 열람만 가능합니다.
              </div>
            ) : (
              <button
                className="flex w-full items-center justify-center py-3 font-medium bg-yellow-600 rounded-[10px] cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                수정하기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
