import { apiClient } from "@repo/lib";

import type {
  AssignProjectTeacherRequest,
  MyTeacherAssignmentResponse,
  RespondAssignmentRequest,
  TeacherListResponse,
} from "@/entities/teacher/model/type";

export const getAllTeachers = async (
  projectId?: number,
): Promise<TeacherListResponse[]> => {
  const { data } = await apiClient.get<TeacherListResponse[]>(
    "/api/admin/teachers",
    projectId ? { params: { projectId } } : undefined,
  );
  return data;
};

export const assignTeacher = async (
  body: AssignProjectTeacherRequest,
): Promise<void> => {
  await apiClient.post<void>("/api/admin/teachers/assign", body);
};

export const getMyAssignments = async (): Promise<
  MyTeacherAssignmentResponse[]
> => {
  const { data } = await apiClient.get<MyTeacherAssignmentResponse[]>(
    "/api/teachers/assignments/my",
  );
  return data;
};

export const respondAssignment = async (
  assignmentId: number,
  body: RespondAssignmentRequest,
): Promise<void> => {
  await apiClient.patch<void>(
    `/api/teachers/assignments/${assignmentId}`,
    body,
  );
};
