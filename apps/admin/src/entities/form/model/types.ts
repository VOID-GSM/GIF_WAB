// 양식 요약 — 프로젝트별 제출 현황(project-detail)과 양식 관리(form 관리) 공용
export interface FormSummary {
  id: number;
  title: string;
  /** 제출 마감일 (YYYY-MM-DD) */
  deadline: string;
  /** 공지 여부 — true면 client에 노출된다. 공지 후에도 담당(MASTER)은 수정할 수 있다 */
  announced: boolean;
  /** 제출물 존재 여부 */
  submitted: boolean;
  /** 기한 내 제출 여부 (준수/미준수 판정) */
  deadlineComplied: boolean;
  /** 대상 학년 */
  targetGrade: number;
}

// GET /api/form?projectId= — 프로젝트의 양식(제출) 목록
export type GetFormsResponse = FormSummary[];

// GET /api/form/admin — 양식 관리 목록
export type GetFormListResponse = FormSummary[];

// 마감 현황 집계 (전체 / 준수 / 미준수)
export interface DeadlineSummary {
  total: number;
  met: number;
  notMet: number;
}

// 백엔드 enum 확정 시 확장
export type FormFieldType = "TEXT";

export interface UpdateFormField {
  title: string;
  description: string;
  type: FormFieldType;
  orderIndex: number;
}

export interface UpdateFormRequest {
  title: string;
  deadline: string;
  fields: UpdateFormField[];
}
