export interface FormDetailField {
  fieldId: number;
  id?: number; // 일부 API 응답이 fieldId 대신 id를 반환하는 경우 대비
  title: string;
  description: string;
  type: "TEXT" | "FILE" | "DATE" | "CALENDAR";
  orderIndex: number;
  /** 필수 항목 여부 — required 를 내려주지 않는 구버전 양식은 필수로 간주한다 */
  required?: boolean;
  allowedExtensions?: string[]; // FILE 타입에서 client 가 제출 가능한 확장자 + "url"(외부 링크 제출 허용 플래그)
}

export interface GetFormDetailResponse {
  formId: number;
  title: string;
  description: string;
  deadline: string;
  targetGrade: number;
  fields: FormDetailField[];
}

// 백엔드 계약(스웨거 기준):
// - 캘린더/날짜 답변은 모두 dateAnswer 배열(CalendarEventRequest[]) 안의 객체로 표현된다.
//   eventName/startDate/endDate/color 는 평면 필드가 아니라 배열 원소의 속성이다.
// - DATE 타입도 dateAnswer 객체로 표현된다(단일 날짜는 startDate === endDate).
// - 파일은 filePath/fileSize 로 표현되며, PATCH 시 기존 파일을 보존하려면 함께 보내야 한다.

// AnswerRequest.dateAnswer 의 원소
export interface CalendarEventRequest {
  eventName?: string;
  startDate: string;
  endDate: string;
  color?: string;
}

// POST /api/form/submit, PATCH /api/form/submit 의 answer 항목(AnswerRequest)
export interface FormAnswerItem {
  fieldId: number;
  textAnswer?: string;
  dateAnswer?: CalendarEventRequest[];
  filePath?: string;
  fileSize?: number;
  // PATCH 로 기존 파일을 보존할 때 원본 파일명이 사라지지 않도록 함께 전송
  originalFileName?: string;
}

export interface PostFormSubmitRequest {
  formId: number;
  projectId: number;
  answers: FormAnswerItem[];
}

// POST /api/form/upload — 응답은 파일 URL 문자열
export type PostFormUploadResponse = string;

// DELETE /api/form/upload
export interface DeleteFormUploadParams {
  fieldId: number;
  submitId: number;
}

// PATCH /api/form/submit
export type PatchFormSubmitAnswerItem = FormAnswerItem;

export interface PatchFormSubmitRequest {
  submitId: number;
  answers: PatchFormSubmitAnswerItem[];
}

// GET /api/form/my-submit
export interface GetFormMySubmitParams {
  formId: number;
  projectId: number;
}

// AnswerResponse.dateAnswer 의 원소(CalendarEventResponse)
export interface CalendarEventResponse {
  eventName: string | null;
  startDate: string;
  endDate: string;
  color: string | null;
}

// GET /api/form/my-submit, /api/form/admin/submit 의 answer 항목(AnswerResponse).
// 캘린더 이벤트는 dateAnswer 배열로만 내려오며, 평면 필드는 존재하지 않는다.
export interface SubmitAnswerItem {
  fieldId: number;
  fieldTitle: string;
  type: string;
  textAnswer: string | null;
  filePath: string | null;
  fileSize: number | null;
  // 서버에 UUID로 저장된 파일의 사용자 업로드 당시 원본 파일명
  originalFileName: string | null;
  dateAnswer: CalendarEventResponse[] | null;
}

export interface GetFormMySubmitResponse {
  submitId: number;
  projectId: number;
  teamName: string;
  submittedByUserId: number;
  submittedByName: string;
  submittedByStudentNumber: string;
  submittedAt: string;
  deadlineComplied: boolean;
  answers: SubmitAnswerItem[];
}
