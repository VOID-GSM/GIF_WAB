"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (date: string) => void;
}

// 캘린더 드롭다운 로직은 @repo/ui DatePicker와 동일하다.
// 트리거만 이 페이지의 "설정" 버튼과 같은 높이로 새로 만들고,
// 팝오버는 점수 부여 테이블의 sticky 헤더(z-10)에 가리지 않도록 z-index를 높였다.
export default function EvaluationDatePicker({ value, onChange }: Props) {
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const [current, setCurrent] = useState(
    value ? new Date(value) : new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const handleSelect = (day: number) => {
    const selected = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(selected);
    setIsOpen(false);
  };

  const changeMonth = (dir: number) => {
    setCurrent(new Date(year, month + dir, 1));
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === year && m - 1 === month && d === day;
  };

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="relative w-full" ref={rootRef}>
      <div
        className="w-full flex items-center justify-between py-[6.5px] px-[10px] border border-yellow-600 rounded-[8px] text-[12px] text-gray-500 bg-white cursor-pointer outline-none transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{value || "날짜를 선택하세요"}</span>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-30 w-full bg-white border border-gray-200 rounded-[10px] p-2 shadow-new">
          <div className="flex items-center justify-between mb-1.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-0.5 rounded-md text-gray-500 text-sm leading-none"
            >
              ‹
            </button>
            <span className="text-[11px] font-medium dark:text-white">
              {year}년 {month + 1}월
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-0.5 rounded-md text-gray-500 text-sm leading-none"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[2px] mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[9px] font-medium text-gray-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-[2px]">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: lastDate }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`aspect-square flex items-center justify-center text-[10px] rounded-[4px] transition-colors ${
                    isSelected(day)
                      ? "bg-yellow-600 text-gray-900 font-medium"
                      : isToday(day)
                        ? "border border-yellow-600 text-yellow-700"
                        : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
