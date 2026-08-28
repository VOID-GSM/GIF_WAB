"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Markdown, Textarea } from "@repo/ui";

import { usePostNotice } from "@/entities/notice";
import { GRADES, useGetFilteredProjects } from "@/entities/project";
import type { Grade } from "@/entities/project";

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 2000;

// 공지 대상은 전체·학년·팀 중 하나만 고른다. 학년과 팀을 함께 지정하면
// "1학년 전체 + 특정 팀"처럼 범위가 겹치는 공지가 만들어지기 때문이다.
type TargetMode = "ALL" | "GRADE" | "TEAM";

const TARGET_MODES: { mode: TargetMode; label: string }[] = [
  { mode: "ALL", label: "전체" },
  { mode: "GRADE", label: "학년" },
  { mode: "TEAM", label: "팀" },
];

export default function NoticeCreateView() {
  const router = useRouter();
  const { mutate, isPending } = usePostNotice();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const [targetMode, setTargetMode] = useState<TargetMode>("ALL");
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [activeGrade, setActiveGrade] = useState<Grade>(GRADES[0]);

  // 팀 선택 목록은 팀 지정 모드일 때만 불러온다.
  const { data: projects, isPending: isProjectsPending } =
    useGetFilteredProjects(activeGrade, targetMode === "TEAM");

  const toggleGrade = (grade: number) =>
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );

  const toggleProject = (projectId: number) =>
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );

  // 모드를 바꾸면 이전 모드에서 고른 대상은 전송되지 않으므로 함께 비운다.
  const handleTargetModeChange = (mode: TargetMode) => {
    setTargetMode(mode);
    setSelectedGrades([]);
    setSelectedProjectIds([]);
  };

  const handleSubmit = () => {
    if (isPending) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    if (targetMode === "GRADE" && selectedGrades.length === 0) {
      toast.error("공지를 받을 학년을 선택해주세요.");
      return;
    }

    if (targetMode === "TEAM" && selectedProjectIds.length === 0) {
      toast.error("공지를 받을 팀을 선택해주세요.");
      return;
    }

    mutate(
      {
        title: trimmedTitle,
        content: trimmedContent,
        targetGrades: targetMode === "GRADE" ? selectedGrades : [],
        targetProjectIds: targetMode === "TEAM" ? selectedProjectIds : [],
      },
      {
        onSuccess: (noticeId) => router.push(`/notice/${noticeId}`),
      },
    );
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[600px]">
        {/* 헤더 */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-[19px] font-semibold tracking-[-0.3px] text-gray-900">
            공지 작성
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
            전체 또는 특정 학년·팀을 지정해 공지를 등록할 수 있습니다.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {/* 제목 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-gray-700">
                제목
              </label>
              <span
                className={`text-[11px] font-medium ${
                  title.length >= MAX_TITLE_LENGTH
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <Input
              title="공지 제목을 입력하세요"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
              }
              maxLength={MAX_TITLE_LENGTH}
              textClassName="text-[13px] text-gray-700"
            />
          </div>

          {/* 내용 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    !isPreview
                      ? "bg-yellow-600 text-gray-900"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  작성
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    isPreview
                      ? "bg-yellow-600 text-gray-900"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  미리보기
                </button>
              </div>
              <span
                className={`text-[11px] font-medium ${
                  content.length >= MAX_CONTENT_LENGTH
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            {isPreview ? (
              <div className="h-[200px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white px-[16px] py-[13px]">
                {content.trim() ? (
                  <Markdown content={content} />
                ) : (
                  <p className="text-[13px] text-gray-400">
                    미리볼 내용이 없습니다.
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                title="공지 내용을 입력해주세요 (마크다운 문법 지원)"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))
                }
                rows={8}
                maxLength={MAX_CONTENT_LENGTH}
                textClassName="text-[13px] leading-relaxed text-gray-700"
                className="h-[200px]"
              />
            )}
          </div>

          {/* 공지 대상 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">
              공지 대상
            </label>
            <div className="flex items-center gap-1.5">
              {TARGET_MODES.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={targetMode === mode}
                  onClick={() => handleTargetModeChange(mode)}
                  className={`h-9 flex-1 cursor-pointer rounded-[10px] border text-[13px] font-medium transition-colors ${
                    targetMode === mode
                      ? "border-yellow-600 bg-yellow-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-gray-400">
              {targetMode === "ALL"
                ? "모든 학년의 모든 팀에게 전달됩니다."
                : targetMode === "GRADE"
                  ? "선택한 학년의 모든 팀에게 전달됩니다."
                  : "선택한 팀에게만 전달됩니다."}
            </p>
          </div>

          {/* 학년 지정 */}
          {targetMode === "GRADE" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                학년 선택
              </label>
              <div className="flex items-center gap-1.5">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    aria-pressed={selectedGrades.includes(grade)}
                    onClick={() => toggleGrade(grade)}
                    className={`h-9 cursor-pointer rounded-[10px] border px-4 text-[13px] font-medium transition-colors ${
                      selectedGrades.includes(grade)
                        ? "border-yellow-600 bg-yellow-50 text-gray-900"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {grade}학년
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 팀 지정 */}
          {targetMode === "TEAM" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-gray-700">
                  팀 선택
                </label>
                <span className="text-[11px] font-medium text-gray-400">
                  {selectedProjectIds.length}개 선택됨
                </span>
              </div>

              {/* 학년별 팀 목록 전환 */}
              <div className="flex items-center gap-1">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setActiveGrade(grade)}
                    className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      activeGrade === grade
                        ? "bg-yellow-600 text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {grade}학년
                  </button>
                ))}
              </div>

              <div className="max-h-[220px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white p-1.5">
                {isProjectsPending ? (
                  <p className="py-8 text-center text-[13px] font-medium text-gray-400">
                    불러오는 중
                  </p>
                ) : !projects || projects.length === 0 ? (
                  <p className="py-8 text-center text-[13px] font-medium text-gray-400">
                    {activeGrade}학년 팀이 없습니다.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {projects.map((project) => {
                      const isSelected = selectedProjectIds.includes(
                        project.id,
                      );
                      return (
                        <li key={project.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleProject(project.id)}
                            className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-left transition-colors ${
                              isSelected ? "bg-yellow-50" : "hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-[13px] font-medium text-gray-800">
                                {project.teamName}
                              </span>
                              <span className="truncate text-[11px] text-gray-400">
                                {project.name}
                              </span>
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                isSelected
                                  ? "border-yellow-600 text-yellow-700"
                                  : "border-gray-200 text-gray-400"
                              }`}
                            >
                              {isSelected ? "선택됨" : "선택"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/notice")}
            className="h-10 cursor-pointer rounded-[10px] px-4 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="h-10 cursor-pointer rounded-[10px] bg-yellow-600 px-5 text-[13px] font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:active:scale-100"
          >
            {isPending ? "등록 중..." : "공지 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
