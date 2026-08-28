"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormCard, Plus, DatePicker, TimePicker } from "@repo/ui";
import { toast } from "sonner";

import { usePostForm, useAnnounceForm } from "@/entities/form-create";
import type { PostFormRequestField } from "@/entities/form-create";
import { useUpdateForm } from "@/entities/form-edit";
import type { UpdateFormField } from "@/entities/form-edit";
import { useGetMyInfo } from "@/entities/mypage";
import { useFieldReorder } from "@/features/form-field-reorder";

const FORM_TITLE_MAX_LENGTH = 50;

type FieldType = "TEXT" | "FILE" | "CALENDAR" | "";

type FieldWithId = {
  id: string;
  title: string;
  description: string;
  type: FieldType;
  orderIndex: number;
  required: boolean;
  allowedExtensions: string[];
};

// 새 항목은 기본적으로 필수 — admin 이 토글로 선택 항목으로 바꿀 수 있다.
const DEFAULT_REQUIRED = true;

export default function FormCreateView() {
  const router = useRouter();
  const { mutate: createForm, isPending: isSaving } = usePostForm();
  const { mutate: announce, isPending: isAnnouncing } = useAnnounceForm();
  const { mutate: updateForm, isPending: isUpdating } = useUpdateForm();

  // 양식 생성은 아이디어페스티벌 담당(MASTER)만 가능 — 그 외 역할·에러는 목록으로 돌려보낸다.
  const { data: myInfo, isLoading: isMyInfoLoading, isError } = useGetMyInfo();
  const canCreate = !isError && myInfo?.adminRole === "MASTER";

  useEffect(() => {
    // 로딩이 끝났는데(정보 도착 또는 에러) 권한이 없으면 목록으로 보낸다.
    if (!isMyInfoLoading && (myInfo || isError) && !canCreate) {
      toast.error("양식 생성 권한이 없습니다.");
      router.replace("/form");
    }
  }, [isMyInfoLoading, myInfo, isError, canCreate, router]);

  const [formTitle, setFormTitle] = useState("");
  // 한글(IME) 조합 중에는 값을 자르지 않는다 — 조합 도중 강제로 잘라내면
  // composition 세션이 깨져 마지막 글자가 누락되거나 조합이 끊길 수 있다.
  const isTitleComposing = useRef(false);
  const [deadline, setDeadline] = useState("");
  // 마감 시각 (HH:mm) — 날짜처럼 사용자가 직접 선택한다.
  const [deadlineTime, setDeadlineTime] = useState("");
  const [savedFormId, setSavedFormId] = useState<number | null>(null);

  // 날짜(YYYY-MM-DD) + 시각(HH:mm) → 백엔드 LocalDateTime 형식 "YYYY-MM-DDTHH:mm:ss"
  const buildDeadline = () =>
    deadline && deadlineTime ? `${deadline}T${deadlineTime}:00` : "";

  // 내부 id 를 제거하고, 허용 확장자는 FILE 타입에서만 전송한다.
  const buildRequestFields = (): PostFormRequestField[] =>
    fields.map((f) => ({
      title: f.title,
      description: f.description,
      type: f.type,
      orderIndex: f.orderIndex,
      required: f.required,
      ...(f.type === "FILE" ? { allowedExtensions: f.allowedExtensions } : {}),
    }));

  // 이미 저장된 초안(savedFormId)을 공지 직전에 최신 상태로 갱신할 때 사용.
  // hasEmptyValue() 검증을 통과한 뒤에만 호출되므로 type이 ""인 필드는 없다.
  const buildUpdateFields = (): UpdateFormField[] =>
    fields.map((f) => ({
      title: f.title,
      description: f.description,
      type: f.type as UpdateFormField["type"],
      orderIndex: f.orderIndex,
      required: f.required,
      ...(f.type === "FILE" ? { allowedExtensions: f.allowedExtensions } : {}),
    }));

  const [fields, setFields] = useState<FieldWithId[]>([
    {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      type: "TEXT",
      orderIndex: 0,
      required: DEFAULT_REQUIRED,
      allowedExtensions: [],
    },
  ]);

  const { draggingId, handleDragStart, handleDragEnter, handleDragEnd } =
    useFieldReorder(setFields);

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        type: "",
        orderIndex: prev.length,
        required: DEFAULT_REQUIRED,
        allowedExtensions: [],
      },
    ]);
  };

  const handleDeleteField = (id: string) => {
    if (fields.length === 1) return;
    setFields((prev) =>
      prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, orderIndex: i })),
    );
  };

  const handleChange = (id: string, updated: Partial<PostFormRequestField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updated } : f)),
    );
  };

  const hasEmptyValue = () => {
    const isEmpty = (value: string) => value.trim() === "";

    return (
      isEmpty(formTitle) ||
      isEmpty(deadline) ||
      isEmpty(deadlineTime) ||
      fields.some(
        (f) => isEmpty(f.title) || isEmpty(f.description) || f.type === "",
      )
    );
  };

  const handleSave = () => {
    if (hasEmptyValue()) {
      toast.error("입력하지 않은 값이 있어 저장할 수 없습니다.");
      return;
    }

    // 이미 저장된 초안이 있으면 새로 만들지 않고 같은 양식을 갱신한다.
    // (매번 새로 생성하면 저장할 때마다 중복 양식이 쌓이고, 이전에 저장한
    // 초안을 다시 열어봐도 이후 수정 내용이 반영되지 않는다.)
    if (savedFormId) {
      updateForm(
        {
          formId: savedFormId,
          body: {
            title: formTitle,
            deadline: buildDeadline(),
            fields: buildUpdateFields(),
          },
        },
        {
          onSuccess: () => toast.success("양식이 저장되었습니다."),
          onError: () => toast.error("양식 저장에 실패했습니다."),
        },
      );
      return;
    }

    createForm(
      {
        title: formTitle,
        deadline: buildDeadline(),
        fields: buildRequestFields(),
      },
      {
        onSuccess: (res) => {
          setSavedFormId(res.data);
          toast.success("양식이 저장되었습니다.");
        },
        onError: () => toast.error("양식 저장에 실패했습니다."),
      },
    );
  };

  const handleAnnounce = () => {
    if (hasEmptyValue()) {
      toast.error("입력하지 않은 값이 있어 공지할 수 없습니다.");
      return;
    }

    const doAnnounce = (formId: number) => {
      announce({ formId }, { onSuccess: () => router.push("/form") });
    };

    if (savedFormId) {
      // 저장 이후 수정한 내용(필수 여부 등)이 공지 시 함께 반영되도록
      // 공지 전에 현재 상태로 먼저 갱신한다.
      updateForm(
        {
          formId: savedFormId,
          body: {
            title: formTitle,
            deadline: buildDeadline(),
            fields: buildUpdateFields(),
          },
        },
        {
          onSuccess: () => doAnnounce(savedFormId),
          onError: () => toast.error("양식 저장에 실패했습니다."),
        },
      );
    } else {
      createForm(
        {
          title: formTitle,
          deadline: buildDeadline(),
          fields: buildRequestFields(),
        },
        {
          onSuccess: (res) => {
            setSavedFormId(res.data);
            doAnnounce(res.data);
          },
          onError: () => toast.error("양식 저장에 실패했습니다."),
        },
      );
    }
  };

  // 권한 확인 중에는 로딩만, 에러·무권한이면 안내 후 리다이렉트 대기 (무한 로딩 방지)
  if (isMyInfoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5 text-gray-500 font-medium">
        불러오는 중...
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5 text-gray-500 font-medium">
        {isError
          ? "정보를 불러오지 못했습니다."
          : "양식 생성 권한이 없습니다."}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background px-5">
      <span className="pt-20 pb-8 font-semibold text-[24px] text-gray-900">
        양식 생성하기
      </span>
      <div className="w-full max-w-[560px] flex flex-col pb-6 gap-4">
        <div className="flex flex-col text-[14px] font-medium text-gray-600 gap-1">
          제목 입력하기
          <input
            className="w-full py-3 px-4 border border-gray-200 rounded-[10px] text-[18px] font-medium placeholder:text-gray-500 text-black outline-none bg-white"
            placeholder="제목을 입력하세요"
            value={formTitle}
            maxLength={FORM_TITLE_MAX_LENGTH}
            onChange={(e) => {
              const value = e.target.value;
              setFormTitle(
                isTitleComposing.current
                  ? value
                  : value.slice(0, FORM_TITLE_MAX_LENGTH),
              );
            }}
            onCompositionStart={() => {
              isTitleComposing.current = true;
            }}
            onCompositionEnd={(e) => {
              isTitleComposing.current = false;
              setFormTitle(
                e.currentTarget.value.slice(0, FORM_TITLE_MAX_LENGTH),
              );
            }}
          />
          <span className="self-end text-xs text-gray-400">
            {formTitle.length}/{FORM_TITLE_MAX_LENGTH}
          </span>
        </div>
        <div className="flex flex-col text-[14px] font-medium text-gray-600 gap-1">
          마감일 선택하기
          <div className="flex gap-3">
            <div className="flex-1">
              <DatePicker value={deadline} onChange={setDeadline} />
            </div>
            <div className="w-[140px]">
              <TimePicker value={deadlineTime} onChange={setDeadlineTime} />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[560px] flex flex-col gap-5">
        {fields.map((field) => (
          <FormCard
            key={field.id}
            field={field}
            onChange={handleChange}
            onDelete={handleDeleteField}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            isDragging={draggingId === field.id}
          />
        ))}

        <button
          className="w-full flex items-center justify-center py-3 gap-4 bg-white rounded-[10px] shadow-new font-medium cursor-pointer dark:text-gray-300"
          onClick={handleAddField}
        >
          <Plus width={15} height={15} />
          추가하기
        </button>

        <div className="w-full flex flex-col sm:flex-row gap-5 pb-20">
          <button
            className="flex w-full items-center justify-center py-3 font-medium border border-yellow-700 bg-white rounded-[10px] cursor-pointer disabled:opacity-50 dark:border-yellow-500 dark:text-gray-300"
            onClick={handleSave}
            disabled={isSaving || isUpdating}
          >
            저장하기
          </button>
          <button
            className="flex w-full items-center justify-center py-3 font-medium bg-yellow-600 rounded-[10px] cursor-pointer disabled:opacity-50"
            onClick={handleAnnounce}
            disabled={isAnnouncing || isSaving || isUpdating}
          >
            공지하기
          </button>
        </div>
      </div>
    </div>
  );
}
