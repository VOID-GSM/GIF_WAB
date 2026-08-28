"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (time: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// 시/분 드롭다운 로직은 @repo/ui TimePicker와 동일하다.
// 트리거만 이 페이지의 "설정" 버튼과 같은 높이로 새로 만들고,
// 팝오버는 점수 부여 테이블의 sticky 헤더(z-10)에 가리지 않도록 z-index를 높였다.
export default function EvaluationTimePicker({ value, onChange }: Props) {
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

  const [hour = "", minute = ""] = value ? value.split(":") : [];

  const select = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour}:${nextMinute}`);
  };

  const handleHour = (h: string) => select(h, minute || "00");
  const handleMinute = (m: string) => select(hour || "00", m);

  return (
    <div className="relative w-full" ref={rootRef}>
      <div
        className="w-full flex items-center justify-between py-[6.5px] px-[10px] border border-yellow-600 rounded-[8px] text-[12px] text-gray-500 bg-white cursor-pointer outline-none transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="whitespace-nowrap">{value || "시간 선택"}</span>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-30 w-full bg-white border border-gray-200 rounded-[10px] p-[10px] shadow-new">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}
          >
            <div className="max-h-[176px] overflow-y-auto flex flex-col gap-[2px] pr-1">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHour(h)}
                  className={`text-center text-[14px] py-[5px] rounded-[8px] transition-colors ${
                    hour === h
                      ? "bg-yellow-600 text-gray-900 font-medium"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="max-h-[176px] overflow-y-auto flex flex-col gap-[2px] pr-1">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinute(m)}
                  className={`text-center text-[14px] py-[5px] rounded-[8px] transition-colors ${
                    minute === m
                      ? "bg-yellow-600 text-gray-900 font-medium"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
