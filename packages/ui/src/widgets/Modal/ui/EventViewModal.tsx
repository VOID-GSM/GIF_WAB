import { Close } from "@repo/ui";
import { resolveColor, type CalendarEvent } from "../model/type";

function formatMonthDay(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${Number(month)}/${Number(day)}`;
}

interface EventViewModalProps {
  event: CalendarEvent;
  editable?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export default function EventViewModal({
  event,
  editable = false,
  onClose,
  onEdit,
  onDelete,
}: EventViewModalProps) {
  const colorVar = resolveColor(event.color);
  const isSameDay = event.startDate === event.endDate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-[336px] bg-white rounded-[10px] border-t-5 overflow-hidden shadow-new"
        style={{ borderColor: colorVar }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-[22px] pt-7 pb-6">
          <Close
            className="absolute top-3 right-3 text-black cursor-pointer"
            width={10}
            height={10}
            onClick={onClose}
          />

          <div className="flex items-center gap-5 mb-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: colorVar }}
            />
            <span className="text-[12px] text-gray-900">{event.title}</span>
          </div>

          <div className="text-right text-gray-500 text-[10px]">
            {isSameDay
              ? `날짜: ${formatMonthDay(event.startDate)}`
              : `기간: ${formatMonthDay(event.startDate)} ~ ${formatMonthDay(event.endDate)}`}
          </div>

          {editable && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onDelete}
                className="flex-1 py-[7px] rounded-[4px] text-[12px] font-semibold text-red-500 border border-red-500 cursor-pointer"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 py-[7px] rounded-[4px] text-[12px] font-semibold text-black border border-yellow-600 cursor-pointer"
              >
                수정
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
