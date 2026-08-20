import { apiClient } from "@repo/lib";

import type {
  GetFilteredProjectsResponse,
  GetProjectLinksResponse,
  GetProjectNoteResponse,
  Grade,
  ProjectDetail,
  ProjectSummaryResponse,
  TransferLeaderRequest,
  UpdateProjectNoteRequest,
} from "../model/types";

export const getFilteredProjects = (grade: Grade) =>
  apiClient.get<GetFilteredProjectsResponse>("/api/project/filter", {
    params: { grade },
  });

export const getProject = (projectId: number) =>
  apiClient.get<ProjectDetail>(`/api/project/${projectId}`);

export const getProjectSummary = (projectId: number) =>
  apiClient.get<ProjectSummaryResponse>(`/api/project/${projectId}/summary`);

export const getProjectLinks = (projectId: number) =>
  apiClient.get<GetProjectLinksResponse>(`/api/project/${projectId}/links`);

export const getProjectNote = (projectId: number) =>
  apiClient.get<GetProjectNoteResponse>(`/api/project/${projectId}/note`);

export const updateProjectNote = (
  projectId: number,
  body: UpdateProjectNoteRequest,
) => apiClient.put<void>(`/api/project/${projectId}/note`, body);

export const transferLeader = (
  projectId: number,
  newLeaderUserId: number,
) => {
  const body: TransferLeaderRequest = { newLeaderUserId };
  return apiClient.patch<void>(`/api/project/${projectId}/transfer-leader`, body);
};
