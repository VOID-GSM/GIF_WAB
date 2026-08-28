import { apiClient, getCookieValue } from "@repo/lib";
import type { UpdateFormRequest, FormByIdResponse } from "../model/type";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchForm = async (path: string): Promise<FormByIdResponse> => {
  const token = getCookieValue("access_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
};

// draft 조회는 공지 전 양식만 열 수 있으므로, 공지된 양식은 단건 조회로 폴백한다.
// 두 응답의 형태(제목·마감일·fields)가 같아 수정 화면에서 그대로 사용할 수 있다.
export const getFormById = async (
  formId: number,
): Promise<FormByIdResponse> => {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

  try {
    return await fetchForm(`/api/form/admin/draft/${formId}`);
  } catch {
    return fetchForm(`/api/form/${formId}`);
  }
};

export const updateForm = async (
  formId: number,
  body: UpdateFormRequest,
): Promise<void> => {
  await apiClient.patch(`/api/form/update`, body, { params: { formId } });
};
