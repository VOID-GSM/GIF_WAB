"use client";
import { useEffect, useRef, useState } from "react";
import type { DatePickerProps } from "../model/type";

export default function DatePicker({ value, onChange, displayValue }: DatePickerProps) {
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 바깥 영역 클릭 시 닫기
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
    value
      ? new Date(value)
      : new Date(today.getFullYear(), today.getMonth(), 1),
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
        className="w-full flex items-center justify-between py-3 px-4 border border-gray-200 rounded-[10px] text-[18px] font-medium cursor-pointer outline-none bg-white"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={value ? "text-black" : "text-gray-500"}>
          {(displayValue ?? value) || "날짜를 선택하세요"}
        </span>
      </div>

      {/* 캘린더 */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-10 w-full bg-white border border-gray-200 rounded-[10px] p-4 shadow-new">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-md text-gray-500 text-xl leading-none"
            >
              ‹
            </button>
            <span className="text-[15px] font-medium dark:text-white">
              {year}년 {month + 1}월
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 rounded-md text-gray-500 text-xl leading-none"
            >
              ›
            </button>
          </div>

          {/* 요일 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: "8px",
            }}
          >
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[12px] font-medium text-gray-400 pb-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              rowGap: "4px",
            }}
          >
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
                  className={`text-center text-[13px] py-[7px] rounded-[8px] transition-colors ${
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
