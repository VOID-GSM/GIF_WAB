"use client";
import { useState } from "react";
import { EventViewModal, EventFormModal } from "@repo/ui";

export type CalendarEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
};

export type CalendarMode = "write" | "view";

export const PRESET_COLOR_MAP = {
  red: "var(--color-red)",
  orange: "var(--color-orange)",
  yellow: "var(--color-yellow)",
  green: "var(--color-green)",
  blue: "var(--color-blue)",
  purple: "var(--color-purple)",
  gray: "var(--color-gray)",
} as const;

export type PresetColorKey = keyof typeof PRESET_COLOR_MAP;

export function resolveColor(color: string): string {
  return PRESET_COLOR_MAP[color as PresetColorKey] ?? color;
}

function getDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function DayCell({
  day,
  year,
  month,
  events,
  today,
  selectStart,
  selectEnd,
  mode,
  onDayClick,
  onEventClick,
}: {
  day: number;
  year: number;
  month: number;
  events: CalendarEvent[];
  today: string;
  selectStart: string | null;
  selectEnd: string | null;
  mode: CalendarMode;
  onDayClick: (dateStr: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const dateStr = getDateStr(year, month, day);
  const isToday = dateStr === today;
  const event = events.find(
    (e) => e.startDate <= dateStr && dateStr <= e.endDate,
  );

  const inSelectRange =
    mode === "write" &&
    selectStart &&
    selectEnd &&
    selectStart <= dateStr &&
    dateStr <= selectEnd;
  const isSelectStart = mode === "write" && selectStart === dateStr;
  const isSelectEnd = mode === "write" && selectEnd === dateStr;

  const cell =
    "flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 mx-auto";

  if (event) {
    const colorVar = resolveColor(event.color);
    const isSingle = event.startDate === event.endDate;
    const isStart = event.startDate === dateStr;
    const isEnd = event.endDate === dateStr;

    if (isSingle) {
      return (
        <div className={cell} onClick={() => onEventClick(event)}>
          <span
            className="flex items-center justify-center w-7 h-7 text-sm sm:w-[35px] sm:h-[35px] sm:text-[20px] rounded-full cursor-pointer text-gray-900"
            style={{ border: `2px solid ${colorVar}` }}
          >
            {day}
          </span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-center h-7 w-full text-sm sm:h-[35px] sm:text-[20px] cursor-pointer text-gray-900
          ${isStart ? "rounded-l-full" : ""}
          ${isEnd ? "rounded-r-full" : ""}
        `}
        style={{
          borderTop: `2px solid ${colorVar}`,
          borderBottom: `2px solid ${colorVar}`,
          borderLeft: isStart ? `2px solid ${colorVar}` : "none",
          borderRight: isEnd ? `2px solid ${colorVar}` : "none",
        }}
        onClick={() => onEventClick(event)}
      >
        {day}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center h-7 w-full text-sm sm:h-[35px] sm:text-[20px]
        ${mode === "write" ? "cursor-pointer" : ""}
        ${inSelectRange && !isSelectStart && !isSelectEnd ? "bg-gray-100" : ""}
        ${isSelectStart && !isSelectEnd ? "rounded-l-full bg-gray-100" : ""}
        ${isSelectEnd && !isSelectStart ? "rounded-r-full bg-gray-100" : ""}
        ${isSelectStart && isSelectEnd ? "rounded-full bg-gray-100" : ""}
      `}
      onClick={() => mode === "write" && onDayClick(dateStr)}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 text-sm sm:w-9 sm:h-9 sm:text-[20px] text-gray-900
          ${isToday && !inSelectRange ? "bg-yellow-400 rounded-full" : ""}
        `}
      >
        {day}
      </span>
    </div>
  );
}

export default function CalendarField({
  fieldId,
  mode = "write",
  editable = false,
  events: initialEvents = [],
  onChange,
}: {
  fieldId: number;
  mode?: CalendarMode;
  editable?: boolean;
  events?: CalendarEvent[];
  onChange?: (fieldId: number, events: CalendarEvent[]) => void;
}) {
  const todayDate = new Date();
  const todayStr = getDateStr(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
  );

  const [currentMonth, setCurrentMonth] = useState(
    new Date(todayDate.getFullYear(), todayDate.getMonth()),
  );
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectEnd, setSelectEnd] = useState<string | null>(null);
  const [viewTarget, setViewTarget] = useState<CalendarEvent | null>(null);
  const [formTarget, setFormTarget] = useState<{
    start: string;
    end: string;
    event?: CalendarEvent;
    isEditing: boolean;
  } | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(year, month + (i - 3));
    return {
      label: `${d.getMonth() + 1}월`,
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  const handleDayClick = (dateStr: string) => {
    if (!selectStart || (selectStart && selectEnd)) {
      setSelectStart(dateStr);
      setSelectEnd(null);
    } else {
      const start = selectStart <= dateStr ? selectStart : dateStr;
      const end = selectStart <= dateStr ? dateStr : selectStart;
      setSelectStart(start);
      setSelectEnd(end);
      setFormTarget({ start, end, isEditing: false });
    }
  };

  const handleEditRequest = () => {
    if (!viewTarget) return;
    setFormTarget({
      start: viewTarget.startDate,
      end: viewTarget.endDate,
      event: viewTarget,
      isEditing: true,
    });
    setViewTarget(null);
  };

  const handleDeleteRequest = () => {
    if (!viewTarget) return;
    const updated = initialEvents.filter((e) => e.id !== viewTarget.id);
    onChange?.(fieldId, updated);
    setViewTarget(null);
  };

  const handleFormSubmit = (title: string, color: string) => {
    if (!formTarget) return;
    const targetEvent = formTarget.event;
    const updated = targetEvent
      ? initialEvents.map((e) =>
          e.id === targetEvent.id ? { ...e, title, color } : e,
        )
      : [
          ...initialEvents,
          {
            id: generateId(),
            title,
            startDate: formTarget.start,
            endDate: formTarget.end,
            color,
          },
        ];

    onChange?.(fieldId, updated);
    setFormTarget(null);
    setSelectStart(null);
    setSelectEnd(null);
  };

  const handleFormCancel = () => {
    setFormTarget(null);
  };

  const handleFormClose = () => {
    setFormTarget(null);
    setSelectStart(null);
    setSelectEnd(null);
  };

  return (
    <>
      {viewTarget && (
        <EventViewModal
          event={viewTarget}
          editable={editable}
          onClose={() => setViewTarget(null)}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
        />
      )}

      {formTarget && (
        <EventFormModal
          startDate={formTarget.start}
          endDate={formTarget.end}
          initialTitle={formTarget.event?.title}
          initialColor={formTarget.event?.color}
          submitLabel={formTarget.isEditing ? "수정하기" : "추가하기"}
          showCancel={formTarget.isEditing}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onClose={handleFormClose}
        />
      )}

      <div className="text-center text-lg mb-4 sm:text-[20px] text-gray-900">
        {year}
      </div>

      <div className="flex items-center justify-between mb-[10px]">
        <button
          className="px-1 text-gray-500 sm:px-2 sm:pl-6"
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
        >
          {"<"}
        </button>
        <div className="flex gap-2 items-center text-sm sm:gap-[27px] sm:text-base">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              onClick={() => setCurrentMonth(new Date(m.year, m.month))}
              className={`cursor-pointer transition-all ${i === 3 ? "text-black" : "text-gray-500"}`}
            >
              {m.label}
            </span>
          ))}
        </div>
        <button
          className="px-1 text-gray-500 sm:px-2 sm:pr-6"
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
        >
          {">"}
        </button>
      </div>

      <div className="shadow-[0_0_6px_0_#E2E2E2] rounded-[10px] px-3 py-4 sm:px-22 sm:py-5">
        <div className="grid grid-cols-7 text-center mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 mx-auto text-sm sm:text-[20px] font-semibold text-gray-900"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 sm:gap-y-[18px]">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <DayCell
              key={day}
              day={day}
              year={year}
              month={month}
              events={initialEvents}
              today={todayStr}
              selectStart={selectStart}
              selectEnd={selectEnd}
              mode={mode}
              onDayClick={handleDayClick}
              onEventClick={setViewTarget}
            />
          ))}
        </div>
      </div>
    </>
  );
}
