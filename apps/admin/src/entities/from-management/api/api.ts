import { apiClient, getCookieValue } from "@repo/lib";
import {
  AdminForm,
  AdminFormDetail,
  AdminSubmitDetail,
} from "@/entities/from-management/model/type";
import {
  mockAdminForms,
  mockFormDetailMap,
  mockSubmitDetailMap,
} from "@/entities/from-management/model/mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchWithAuth<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const token = getCookieValue("access_token");
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// 학년별 양식 목록
export const getAdminForms = async (grade?: number): Promise<AdminForm[]> => {
  if (USE_MOCK) {
    return grade
      ? mockAdminForms.filter((f) => f.targetGrade === grade)
      : mockAdminForms;
  }
  const query = grade ? `?grade=${grade}` : "";
  return fetchWithAuth<AdminForm[]>(`/api/form/admin${query}`);
};

// 양식 단건 조회 (제출 상세보기용 — announced 양식도 조회 가능)
export const getAdminFormDetail = async (
  formId: number,
): Promise<AdminFormDetail> => {
  if (USE_MOCK) {
    const detail = mockFormDetailMap[formId];
    if (!detail) throw new Error(`Mock form ${formId} not found`);
    return detail;
  }
  return fetchWithAuth<AdminFormDetail>(`/api/form/${formId}`);
};

// 제출물의 마감 준수 여부 변경 (아이디어페스티벌 담당·VOID 계정 전용)
// 준수 → 미준수, 미준수 → 준수 양방향으로 바꿀 수 있다.
export const patchDeadlineCompliance = async (
  submitId: number,
  deadlineComplied: boolean,
): Promise<void> => {
  await apiClient.patch(
    `/api/form/admin/submit/${submitId}/deadline-compliance`,
    { deadlineComplied },
  );
};

// 양식별 전체 제출 답변 (formId = 템플릿 ID)
export const getAdminSubmitDetail = async (
  formId: number,
): Promise<AdminSubmitDetail[]> => {
  if (USE_MOCK) return mockSubmitDetailMap[formId] ?? [];
  return fetchWithAuth<AdminSubmitDetail[]>(
    `/api/form/admin/submit?formId=${formId}`,
  );
};

// 제출 답변 AI 요약 (submitId = 개별 제출 ID, 응답은 요약 텍스트 문자열)
// 서버가 평문(text/plain) 또는 JSON 문자열 양쪽으로 응답할 수 있어,
// fetchWithAuth(항상 res.json())를 쓰지 않고 직접 text로 받아 안전하게 파싱한다.
export const getSubmitSummary = async (submitId: number): Promise<string> => {
  if (USE_MOCK) {
    return "제출된 답변을 바탕으로 생성한 AI 요약입니다. (목업 데이터)";
  }
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const token = getCookieValue("access_token");
  const res = await fetch(`${BASE_URL}/api/form/submit/${submitId}/summary`, {
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? parsed : text;
  } catch {
    return text;
  }
};
