"use client";

import { useState } from "react";

import { isValidUrl, normalizeUrl } from "@repo/lib";
import { Close, Plus, ProjectLinkChip } from "@repo/ui";

import {
  useCreateProjectLink,
  useDeleteProjectLink,
  useGetProjectLinks,
  useUpdateProjectLink,
  type ProjectLink,
} from "@/entities/project";

const TITLE_MAX_LENGTH = 30;

interface LinkFormProps {
  initialTitle?: string;
  initialUrl?: string;
  isPending: boolean;
  onSubmit: (title: string, url: string) => void;
  onCancel: () => void;
}

// 링크 추가·수정 공용 입력 폼 — 칩과 같은 높이를 유지하는 한 줄짜리 인라인 폼
function LinkForm({
  initialTitle = "",
  initialUrl = "",
  isPending,
  onSubmit,
  onCancel,
}: LinkFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    if (!title.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!isValidUrl(url)) {
      setError("올바른 주소를 입력해 주세요. (예: github.com/void-gsm)");
      return;
    }

    setError("");
    onSubmit(title.trim(), normalizeUrl(url));
  };

  const inputClassName =
    "rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-black outline-none transition-colors placeholder:text-gray-400 focus:border-yellow-600";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="이름"
          className={`${inputClassName} w-[92px]`}
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="github.com/..."
          className={`${inputClassName} w-[168px]`}
        />
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-full bg-yellow-600 px-3 py-1 text-xs font-semibold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="입력 취소"
          className="cursor-pointer p-1 text-gray-400 transition-colors hover:text-gray-600"
        >
          <Close width={9} height={9} />
        </button>
      </div>

      {error && (
        <span className="text-[11px] font-medium text-orange-900">{error}</span>
      )}
    </form>
  );
}

interface LinkChipProps {
  link: ProjectLink;
  editable: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// 링크 칩 — 평소에는 이름만 보이고, 내 팀일 때 hover 하면 수정·삭제 버튼이 붙는다.
function LinkChip({
  link,
  editable,
  isDeleting,
  onEdit,
  onDelete,
}: LinkChipProps) {
  // 삭제는 되돌릴 수 없으므로 한 번 더 확인받는다.
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1 pl-3 pr-2 text-xs font-medium">
        <span className="text-gray-600">삭제할까요?</span>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
          className="cursor-pointer font-semibold text-orange-900 disabled:opacity-40"
        >
          예
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer font-semibold text-gray-500"
        >
          아니오
        </button>
      </span>
    );
  }

  return (
    <ProjectLinkChip
      title={link.title}
      url={link.url}
      actions={
        editable && (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="cursor-pointer px-1 text-[11px] text-gray-500 transition-colors hover:text-gray-700"
            >
              수정
            </button>
            <button
              type="button"
              aria-label={`${link.title} 링크 삭제`}
              onClick={() => setConfirming(true)}
              className="cursor-pointer px-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Close width={9} height={9} />
            </button>
          </>
        )
      }
    />
  );
}

interface ProjectLinkSectionProps {
  projectId: number;
  // 내 팀 프로젝트일 때만 추가·수정·삭제가 가능하다.
  editable?: boolean;
}

// 링크 — GitHub·배포 주소 등 팀이 자유롭게 등록하는 외부 링크 (작은 칩 목록)
export default function ProjectLinkSection({
  projectId,
  editable = false,
}: ProjectLinkSectionProps) {
  const { data: links, isPending, isError } = useGetProjectLinks(projectId);

  const createLink = useCreateProjectLink(projectId);
  const updateLink = useUpdateProjectLink(projectId);
  const deleteLink = useDeleteProjectLink(projectId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 다른 팀 프로젝트에서 등록된 링크가 없으면 아무것도 노출하지 않는다.
  if (!editable && (isPending || isError || !links?.length)) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links?.map((link) =>
        editingId === link.id ? (
          <LinkForm
            key={link.id}
            initialTitle={link.title}
            initialUrl={link.url}
            isPending={updateLink.isPending}
            onSubmit={(title, url) =>
              updateLink.mutate(
                { linkId: link.id, title, url },
                { onSuccess: () => setEditingId(null) },
              )
            }
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <LinkChip
            key={link.id}
            link={link}
            editable={editable}
            isDeleting={deleteLink.isPending}
            onEdit={() => {
              setIsAdding(false);
              setEditingId(link.id);
            }}
            onDelete={() => deleteLink.mutate(link.id)}
          />
        ),
      )}

      {editable &&
        (isAdding ? (
          <LinkForm
            isPending={createLink.isPending}
            onSubmit={(title, url) =>
              createLink.mutate(
                { title, url },
                { onSuccess: () => setIsAdding(false) },
              )
            }
            onCancel={() => setIsAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setIsAdding(true);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            <Plus width={8} height={8} />
            링크 추가
          </button>
        ))}
    </div>
  );
}
