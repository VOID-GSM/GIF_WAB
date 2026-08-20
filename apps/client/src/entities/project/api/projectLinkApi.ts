import { apiClient } from "@repo/lib";

import type {
  GetProjectLinksResponse,
  ProjectLinkRequest,
} from "../model/types";

export const getProjectLinks = async (
  projectId: number,
): Promise<GetProjectLinksResponse> => {
  const { data } = await apiClient.get<GetProjectLinksResponse>(
    `/api/project/${projectId}/links`,
  );
  return data;
};

// 생성된 링크의 id를 반환한다.
export const createProjectLink = async (
  projectId: number,
  data: ProjectLinkRequest,
): Promise<number> => {
  const { data: linkId } = await apiClient.post<number>(
    `/api/project/${projectId}/links`,
    data,
  );
  return linkId;
};

export const updateProjectLink = async (
  projectId: number,
  linkId: number,
  data: ProjectLinkRequest,
): Promise<void> => {
  await apiClient.patch(`/api/project/${projectId}/links/${linkId}`, data);
};

export const deleteProjectLink = async (
  projectId: number,
  linkId: number,
): Promise<void> => {
  await apiClient.delete(`/api/project/${projectId}/links/${linkId}`);
};
