export interface FormByIdField {
  id: number;
  title: string;
  description: string;
  type: "TEXT" | "FILE" | "CALENDAR";
  orderIndex: number;
  /** 필수 항목 여부 — required 를 내려주지 않는 구버전 양식은 필수로 간주한다 */
  required?: boolean;
  allowedExtensions?: string[]; // FILE 타입에서 client 가 제출 가능한 확장자 + "url"(외부 링크 제출 허용 플래그)
}

export interface FormByIdResponse {
  id: number;
  title: string;
  description: string;
  deadline: string;
  announced: boolean;
  deadlineComplied: boolean;
  fields: FormByIdField[];
}

export interface UpdateFormField {
  title: string;
  description: string;
  type: "TEXT" | "FILE" | "CALENDAR";
  orderIndex: number;
  /** 학생이 반드시 답변해야 하는 항목인지 여부 (false면 비워둔 채 제출 가능) */
  required: boolean;
  allowedExtensions?: string[]; // FILE 타입에서 client 가 제출 가능한 확장자 + "url"(외부 링크 제출 허용 플래그)
}

export interface UpdateFormRequest {
  title: string;
  description?: string;
  deadline: string;
  targetGrade?: number;
  fields: UpdateFormField[];
}
