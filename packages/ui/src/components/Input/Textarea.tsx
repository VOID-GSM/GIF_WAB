import { stripInvisibleChars } from "../../lib/sanitizeText";

interface TextareaProps {
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCompositionStart?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
  /** 기본 클래스에 추가로 덧붙일 클래스 (예: 에러 시 border-red-500) */
  className?: string;
  /** 입력 글자의 크기·색상·굵기를 덮어쓴다. 미지정 시 기본값(font-medium text-black) */
  textClassName?: string;
}

export default function Textarea({
  title = "내용을 입력하세요",
  value,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  rows,
  maxLength,
  className = "",
  textClassName,
}: TextareaProps) {
  // 붙여넣기 등으로 들어온 보이지 않는 제어 문자를 부모에게 전달하기 전에 제거한다.
  // 한글(IME) 조합 중에는 값을 건드리지 않는다 — 조합 세션이 깨질 수 있다.
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!(e.nativeEvent as InputEvent).isComposing) {
      e.target.value = stripInvisibleChars(e.target.value);
    }
    onChange?.(e);
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLTextAreaElement>,
  ) => {
    e.currentTarget.value = stripInvisibleChars(e.currentTarget.value);
    onCompositionEnd?.(e);
  };

  return (
    <textarea
      className={`w-full py-[13px] px-[16px] border border-gray-200 rounded-[10px] placeholder:text-gray-500 outline-none resize-none
      transition-colors bg-white focus:border-yellow-600 [&:not(:placeholder-shown)]:border-yellow-600
      dark:focus:border-yellow-500 dark:[&:not(:placeholder-shown)]:border-yellow-500 ${textClassName || "font-medium text-black"} ${className}`}
      placeholder={title}
      value={value}
      onChange={handleChange}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      rows={rows}
      maxLength={maxLength}
    />
  );
}
