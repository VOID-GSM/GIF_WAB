"use client";
import { useState } from "react";
import { SubmitAnswer } from "@/entities/from-management/model/type";
import { Close } from "@repo/ui";

type CalendarEvent = {
  title: string;
  startDate: string;
  endDate: string;
  color: string;
};

export const PRESET_COLOR_MAP = {
  red: "var(--color-red)",
  orange: "var(--color-orange)",
  yellow: "var(--color-yellow)",
  green: "var(--color-green)",
  blue: "var(--color-blue)",
  purple: "var(--color-purple)",
  gray: "var(--color-gray)",
} as const;
export function resolveColor(color: string) {
  return PRESET_COLOR_MAP[color as keyof typeof PRESET_COLOR_MAP] ?? color;
}

function getDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMonthDay(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function EventModal({
  event,
  onClose,
}: {
  event: CalendarEvent;
  onClose: () => void;
}) {
  const hex = resolveColor(event.color);
  const isSameDay = event.startDate === event.endDate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-[336px] bg-white rounded-[16px] border-t-5 overflow-hidden shadow-new"
        style={{ borderColor: hex }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-[22px] pt-7 pb-6">
          <Close
            className="absolute top-3 right-3 text-black"
            width={10}
            height={10}
            onClick={onClose}
          />

          <div className="flex items-center gap-5 mb-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: hex }}
            />
            <span className="text-[12px] font-regular text-gray-900">
              {event.title}
            </span>
          </div>

          <div className="text-right text-gray-500 text-[10px] font-regular">
            {isSameDay
              ? `날짜 : ${formatMonthDay(event.startDate)}`
              : `기간 : ${formatMonthDay(event.startDate)}~${formatMonthDay(event.endDate)}`}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayCell({
  day,
  year,
  month,
  events,
  today,
  onEventClick,
}: {
  day: number;
  year: number;
  month: number;
  events: CalendarEvent[];
  today: string;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const dateStr = getDateStr(year, month, day);
  const isToday = dateStr === today;
  const event = events.find(
    (e) => e.startDate <= dateStr && dateStr <= e.endDate,
  );
  const cell =
    "flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 mx-auto";

  if (!event) {
    return (
      <div className={cell}>
        <span
          className={`flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 text-sm sm:text-[20px] text-gray-900
          ${isToday ? "bg-yellow-400 rounded-full" : ""}
        `}
        >
          {day}
        </span>
      </div>
    );
  }

  const hex = resolveColor(event.color);
  const isSingle = event.startDate === event.endDate;
  const isStart = event.startDate === dateStr;
  const isEnd = event.endDate === dateStr;

  if (isSingle) {
    return (
      <div className={cell} onClick={() => onEventClick(event)}>
        <span
          className="flex items-center justify-center w-7 h-7 sm:w-[35px] sm:h-[35px] text-sm sm:text-[20px] rounded-full cursor-pointer text-gray-900"
          style={{ border: `1px solid ${hex}` }}
        >
          {day}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center h-7 sm:h-[35px] w-full text-sm sm:text-[20px] cursor-pointer text-gray-900
        ${isStart ? "rounded-l-full" : ""}
        ${isEnd ? "rounded-r-full" : ""}
      `}
      style={{
        borderTop: `1px solid ${hex}`,
        borderBottom: `1px solid ${hex}`,
        borderLeft: isStart ? `1px solid ${hex}` : "none",
        borderRight: isEnd ? `1px solid ${hex}` : "none",
      }}
      onClick={() => onEventClick(event)}
    >
      {day}
    </div>
  );
}

export default function CalendarAnswer({
  answers,
}: {
  answers: SubmitAnswer[];
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const events: CalendarEvent[] = answers.flatMap((a) =>
    (a.dateAnswer ?? [])
      .filter((ev) => ev.startDate && ev.endDate)
      .map((ev) => ({
        title: ev.eventName ?? "",
        startDate: ev.startDate,
        endDate: ev.endDate,
        color: ev.color ?? "gray",
      })),
  );

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

  return (
    <>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <div className="text-center text-lg sm:text-[20px] mb-4 text-gray-900">
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
              events={events}
              today={todayStr}
              onEventClick={setSelectedEvent}
            />
          ))}
        </div>
      </div>
    </>
  );
}
