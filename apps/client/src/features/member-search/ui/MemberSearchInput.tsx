"use client";

import { useState, useRef, useEffect } from "react";

import { NameBadge, Plus } from "@repo/ui";

import { useSearchUsers, type UserSearchResult } from "@/entities/project";

interface MemberSearchInputProps {
  // 프로젝트 학년 — 같은 학년 학생만 검색·추가 가능
  grade: number;
  owner?: UserSearchResult;
  value: UserSearchResult[];
  onChange: (members: UserSearchResult[]) => void;
}

// 학번 첫 자리가 학년 (예: "1101" → 1학년)
const gradeOf = (studentNumber: string | undefined | null) => {
  if (!studentNumber || studentNumber.length === 0) return 0;
  return Number(studentNumber[0]);
};

export function MemberSearchInput({ grade, owner, value, onChange }: MemberSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data: apiResults = [] } = useSearchUsers(debouncedKeyword);
  const results = apiResults.filter(
    (u) =>
      !value.some((m) => m.userId === u.userId) &&
      u.userId !== owner?.userId &&
      // 이미 다른 팀에 소속된 학생은 검색 결과에서 제외
      !u.hasTeam &&
      // 프로젝트 학년과 다른 학년 학생은 검색 결과에서 제외
      gradeOf(u.studentNumber) === grade,
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setKeyword("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAdd = (user: UserSearchResult) => {
    // 다른 학년 학생은 추가 불가(검색 결과에서도 제외되지만 방어적으로 재확인)
    if (gradeOf(user.studentNumber) !== grade) return;
    if (value.some((m) => m.userId === user.userId)) return;
    onChange([...value, user]);
    setKeyword("");
    setIsOpen(false);
  };

  const handleRemove = (userId: number) => {
    onChange(value.filter((m) => m.userId !== userId));
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-9 shrink-0 items-center">
        <span className="text-2xl font-medium text-gray-700">팀원</span>
      </div>

      <div className="relative flex flex-1 flex-wrap items-center gap-2 min-h-9" ref={containerRef}>
        {owner && (
          <NameBadge
            id={Number(owner.studentNumber)}
            name={owner.name}
            isEditable={false}
          />
        )}
        {value.map((member) => (
          <NameBadge
            key={member.userId}
            id={Number(member.studentNumber)}
            name={member.name}
            isEditable
            onRemove={() => handleRemove(member.userId)}
          />
        ))}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="팀원 추가"
          className="flex size-5 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 cursor-pointer"
        >
          <Plus width={34} height={34} />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-md">
            <div className="px-3.5 py-1">
              <input
                autoFocus
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="팀원을 검색하세요"
                className="w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="mx-3.5 h-px bg-gray-200" />
            <ul className="max-h-40 overflow-y-auto">
              {results.length === 0 ? (
                <li className="px-3.5 py-2 text-xs text-gray-400">
                  {keyword ? "검색 결과가 없습니다" : "이름을 입력하세요"}
                </li>
              ) : (
                results.map((user) => (
                  <li key={user.userId}>
                    <button
                      type="button"
                      onClick={() => handleAdd(user)}
                      className="w-full px-3.5 py-3 text-left text-xs text-gray-900 hover:bg-gray-50"
                    >
                      {user.studentNumber} {user.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}