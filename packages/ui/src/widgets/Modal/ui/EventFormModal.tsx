"use client";
import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Close, Color } from "@repo/ui";
import {
  PRESET_COLOR_MAP,
  resolveColor,
  type PresetColorKey,
} from "../model/type";

function formatMonthDay(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// PRESET_COLOR_MAP 키 배열 — 색상 선택 UI에 사용
const PRESET_COLOR_KEYS = Object.keys(PRESET_COLOR_MAP) as PresetColorKey[];

interface EventFormModalProps {
  startDate: string;
  endDate: string;
  initialTitle?: string;
  initialColor?: string;
  submitLabel: string;
  showCancel?: boolean;
  onSubmit: (title: string, color: string) => void;
  onCancel?: () => void;
  onClose: () => void;
}

export default function EventFormModal({
  startDate,
  endDate,
  initialTitle,
  initialColor,
  showCancel = false,
  onSubmit,
  onCancel,
  onClose,
}: EventFormModalProps) {
  const [title, setTitle] = useState(initialTitle ?? "");
  // 새 일정 추가 시에는 아무 색상도 선택되지 않은 상태로 시작한다.
  const [color, setColor] = useState<string>(initialColor ?? "");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const isSameDay = startDate === endDate;

  // 색상 미선택("")이 아니면서 프리셋에도 없으면 컬러 팔레트로 고른 커스텀 색상
  const isCustomColor =
    color !== "" && !PRESET_COLOR_KEYS.includes(color as PresetColorKey);

  // 컬러 팔레트 바깥을 클릭하면 팔레트를 닫는다
  useEffect(() => {
    if (!paletteOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paletteOpen]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-[336px] bg-white rounded-[10px] shadow-new"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-[38px] pb-6 flex flex-col gap-4">
          <Close
            className="absolute top-3 right-3 text-black cursor-pointer"
            width={10}
            height={10}
            onClick={onClose}
          />

          <div>
            {/* 색상 선택 — PRESET_COLOR_MAP 키 기반 */}
            <div className="flex justify-between flex-wrap items-center h-[30px] mb-2">
              {PRESET_COLOR_KEYS.map((key) => {
                const isSelected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setColor(key);
                      setPaletteOpen(false);
                    }}
                    className="w-6 h-6 rounded-full transition flex-shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: resolveColor(key),
                      outline: isSelected
                        ? "2px solid var(--color-gray-500)"
                        : "2px solid transparent",
                      outlineOffset: isSelected ? "3px" : "0px",
                    }}
                  />
                );
              })}

              {/* 컬러 팔레트 — 클릭 시 react-colorful 피커로 직접 색상 선택 */}
              <div ref={paletteRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPaletteOpen((prev) => !prev)}
                  className="w-6 h-6 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: isCustomColor ? color : undefined,
                    outline: isCustomColor
                      ? "2px solid var(--color-gray-500)"
                      : "2px solid transparent",
                    outlineOffset: isCustomColor ? "3px" : "0px",
                  }}
                >
                  {!isCustomColor && <Color className="w-6 h-6" />}
                </button>

                {paletteOpen && (
                  <div className="absolute right-0 top-9 z-20 rounded-[10px] bg-white p-2 shadow-new">
                    <HexColorPicker
                      color={isCustomColor ? color : "#FFD43B"}
                      onChange={setColor}
                    />
                  </div>
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="일정을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-500 rounded-[4px] px-3 py-2 mb-1 text-[12px] font-regular text-black outline-none placeholder:text-gray-500"
            />

            <div className="text-[10px] text-gray-500 font-regular text-right">
              {isSameDay
                ? `날짜: ${formatMonthDay(startDate)}`
                : `기간: ${formatMonthDay(startDate)} ~ ${formatMonthDay(endDate)}`}
            </div>
          </div>

          <div className="flex gap-2">
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 items-center py-[7px] rounded-[4px] text-[12px] font-semibold border border-yellow-600 text-black cursor-pointer"
              >
                취소
              </button>
            )}
            <button
              type="button"
              disabled={!title.trim() || !color}
              onClick={() =>
                title.trim() && color && onSubmit(title.trim(), color)
              }
              className="flex-1 items-center py-[7px] rounded-[4px] text-[12px] bg-yellow-600 font-semibold text-black cursor-pointer transition-opacity disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
