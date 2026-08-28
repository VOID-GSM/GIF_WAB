"use client";

import { useEffect, useRef, useState } from "react";
import { matchesTeamQuery } from "@/shared/utils";

interface TeamFilterProps {
  teamNames: string[];
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  // 주변 요소와 겹치는 화면에서 검색창 너비만 좁혀야 할 때 오버라이드한다.
  widthClassName?: string;
}

// 팀명을 입력해 실시간으로 목록을 좁히거나, 드롭다운에서 팀을 직접 선택할 수 있는 검색형 필터
export default function TeamFilter({
  teamNames,
  value,
  onChange,
  placeholder = "팀명 검색",
  widthClassName = "w-[140px] sm:w-[200px]",
}: TeamFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isOpen]);

  const suggestions = teamNames.filter((name) => matchesTeamQuery(name, value));

  return (
    <div ref={containerRef} className={`relative ${widthClassName}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-[8px] border border-gray-500 bg-white px-[10px] py-[6.5px] text-[12px] text-gray-500 outline-none transition-colors placeholder:text-gray-500 focus:border-yellow-600 dark:border-gray-600"
      />

      {isOpen && value.trim() !== "" && suggestions.length > 0 && (
        <ul className="absolute top-[calc(100%+6px)] left-0 z-20 max-h-[220px] w-full overflow-y-auto rounded-[8px] border border-gray-100 bg-white shadow-new">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => {
                  onChange(name);
                  setIsOpen(false);
                }}
                className="w-full truncate px-[10px] py-2 text-left text-[12px] text-gray-700 transition-colors hover:bg-yellow-50"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
