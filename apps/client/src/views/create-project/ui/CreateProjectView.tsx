"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";

import { FileUpload, SubmitButton, Textarea } from "@repo/ui";

import { useGetMe } from "@/entities/auth";
import {
  useCreateProject,
  type Grade,
  type UserSearchResult,
} from "@/entities/project";
import { MemberSearchInput } from "@/features/member-search/ui/MemberSearchInput";

const MAX_NAME_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 500;

export function CreateProjectView() {
  const router = useRouter();
  const { mutate, isPending } = useCreateProject();
  const { data: me } = useGetMe();

  // studentNumber가 없는 계정(null)일 수 있어 앞자리(학년) 접근 전에 방어한다.
  const grade = (me?.studentNumber ? Number(me.studentNumber[0]) : 1) as Grade;

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<UserSearchResult[]>([]);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({
    projectName: false,
    teamName: false,
    members: false,
    description: false,
  });

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH));
    if (e.target.value.trim())
      setErrors((prev) => ({ ...prev, description: false }));
  };

  const handleSubmit = () => {
    const newErrors = {
      projectName: !projectName.trim(),
      teamName: !teamName.trim(),
      members: members.length === 0,
      description: !description.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    mutate(
      {
        name: projectName,
        teamName,
        description,
        grade,
        memberIds: [
          ...(me ? [me.userId] : []),
          ...members.map((m) => m.userId),
        ],
        logo: thumbnail ?? undefined,
      },
      {
        onSuccess: () => {
          router.push("/");
        },
      },
    );
  };

  const underlineInput = (hasError: boolean) =>
    `w-full border-b bg-transparent pb-1 text-2xl text-gray-900 outline-none transition-colors duration-200 ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-gray-900"
    }`;

  return (
    <div className="flex min-h-dvh items-start justify-center px-4 py-8 sm:items-center bg-background">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex w-full max-w-[830px] flex-col gap-14"
      >
        <section className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="mx-auto flex w-[240px] shrink-0 flex-col gap-1.5">
            <FileUpload onChange={setThumbnail} className="h-[160px] w-[240px]" />
            <span className="text-center text-xs text-gray-400">
              프로젝트 목록에 224 x 112px(2:1 비율)로 표시돼요. 비율이 다르면 잘릴 수 있어요.
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-4">
                <span className="shrink-0 text-2xl font-medium text-gray-700">
                  프로젝트명
                </span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, MAX_NAME_LENGTH);
                    setProjectName(val);
                    if (val)
                      setErrors((prev) => ({ ...prev, projectName: false }));
                  }}
                  className={underlineInput(errors.projectName)}
                />
              </label>
              <div className="flex items-center justify-between">
                {errors.projectName ? (
                  <span className="text-xs text-red-500">
                    프로젝트명을 입력해주세요
                  </span>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs font-medium ${projectName.length >= MAX_NAME_LENGTH ? "text-red-500" : "text-gray-400"}`}
                >
                  {projectName.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-4">
                <span className="shrink-0 text-2xl font-medium text-gray-700">
                  팀명
                </span>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, MAX_NAME_LENGTH);
                    setTeamName(val);
                    if (val)
                      setErrors((prev) => ({ ...prev, teamName: false }));
                  }}
                  className={underlineInput(errors.teamName)}
                />
              </label>
              <div className="flex items-center justify-between">
                {errors.teamName ? (
                  <span className="text-xs text-red-500">
                    팀명을 입력해주세요
                  </span>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs font-medium ${teamName.length >= MAX_NAME_LENGTH ? "text-red-500" : "text-gray-400"}`}
                >
                  {teamName.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <MemberSearchInput
                grade={grade}
                owner={
                  me
                    ? {
                        userId: me.userId,
                        name: me.name,
                        studentNumber: me.studentNumber,
                        hasTeam: true,
                      }
                    : undefined
                }
                value={members}
                onChange={(v) => {
                  setMembers(v);
                  if (v.length > 0)
                    setErrors((prev) => ({ ...prev, members: false }));
                }}
              />
              {errors.members && (
                <span className="text-right text-xs text-red-500">
                  팀원을 한 명 이상 추가해주세요
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <span className="text-2xl font-medium text-gray-700">
            프로젝트 설명
          </span>
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            rows={8}
            maxLength={MAX_DESCRIPTION_LENGTH}
            title="500자 이내로 작성해주세요"
            className={errors.description ? "border-red-500" : ""}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <span className="text-xs text-red-500">
                프로젝트 설명을 입력해주세요
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-700 font-medium">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </section>

        <div className="flex justify-center">
          <SubmitButton disabled={isPending || !me}>완료하기</SubmitButton>
        </div>
      </form>
    </div>
  );
}
