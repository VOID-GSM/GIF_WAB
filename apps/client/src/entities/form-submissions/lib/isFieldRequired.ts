import type { FormDetailField } from "../model/types";

// 항목별 필수 여부. required 를 내려주지 않는 구버전 양식은 필수로 간주해
// 기존과 동일하게 동작시킨다.
export const isFieldRequired = (field: Pick<FormDetailField, "required">) =>
  field.required ?? true;
