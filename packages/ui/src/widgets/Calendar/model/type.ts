export interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  /** 트리거에 value 대신 보여줄 문자열 (내부 캘린더 계산은 계속 value를 기준으로 한다) */
  displayValue?: string;
}

export interface TimePickerProps {
  /** "HH:mm" */
  value: string;
  onChange: (time: string) => void;
}
