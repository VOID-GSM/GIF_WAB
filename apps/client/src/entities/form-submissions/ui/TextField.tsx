import { useRef, useEffect } from "react";

const TEXT_MAX_LENGTH = 10000;

interface TextFieldProps {
  fieldId: number;
  value: string;
  readOnly?: boolean;
  onChange: (fieldId: number, value: string) => void;
}

export default function TextField({
  fieldId,
  value,
  readOnly = false,
  onChange,
}: TextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 한글(IME) 조합 중에는 값을 자르지 않는다 — 조합 도중 강제로 잘라내면
  // composition 세션이 깨져 마지막 글자가 누락되거나 조합이 끊길 수 있다.
  const isComposing = useRef(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // 높이 초기화
    el.style.height = `${el.scrollHeight}px`; // 내용 높이로 조절
  }, [value]);

  if (readOnly) {
    return (
      <div className="min-h-20 w-full break-words border border-gray-80 rounded-[10px] p-[15px] font-medium text-gray-800 whitespace-pre-wrap">
        {value || <span className="text-gray-400">답변 없음</span>}
      </div>
    );
  }

  return (
    <>
      <textarea
        ref={textareaRef}
        className="min-h-20 w-full break-words border border-gray-80 rounded-[10px] p-[15px] font-medium text-gray-800 outline-none resize-none overflow-hidden placeholder:text-gray-500"
        placeholder="답변을 입력하세요"
        value={value}
        maxLength={TEXT_MAX_LENGTH}
        onChange={(e) => {
          const next = e.target.value;
          onChange(
            fieldId,
            isComposing.current ? next : next.slice(0, TEXT_MAX_LENGTH),
          );
        }}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposing.current = false;
          onChange(fieldId, e.currentTarget.value.slice(0, TEXT_MAX_LENGTH));
        }}
      />
      <span className="mt-1 self-end text-xs text-gray-400">
        {value.length}/{TEXT_MAX_LENGTH}
      </span>
    </>
  );
}
