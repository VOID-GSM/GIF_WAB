import { apiClient } from "@repo/lib";
import type {
  DetailScoreResponse,
  CreateMajorScoreRequest,
  CreateReportScoreRequest,
  CreateSocialScoreRequest,
  PatchMajorScoreRequest,
  PatchReportScoreRequest,
  PatchSocialScoreRequest,
  GetScoreNoticeResponse,
  GetProjectFieldAverageResponse,
  PostScorePeriodRequest,
} from "../model/types";

export const getMajorScore = (projectId: number) =>
  apiClient.get<DetailScoreResponse>("/api/score/major", { params: { projectId } });

export const postMajorScore = (body: CreateMajorScoreRequest) =>
  apiClient.post<void>("/api/score/major", body);

export const patchMajorScore = (projectId: number, body: PatchMajorScoreRequest) =>
  apiClient.patch<void>(`/api/score/major/${projectId}`, body);

export const getReportScore = (projectId: number) =>
  apiClient.get<DetailScoreResponse>("/api/score/report", { params: { projectId } });

export const postReportScore = (body: CreateReportScoreRequest) =>
  apiClient.post<void>("/api/score/report", body);

export const patchReportScore = (projectId: number, body: PatchReportScoreRequest) =>
  apiClient.patch<void>(`/api/score/report/${projectId}`, body);

export const getSocialScore = (projectId: number) =>
  apiClient.get<DetailScoreResponse>("/api/score/social", { params: { projectId } });

export const postSocialScore = (body: CreateSocialScoreRequest) =>
  apiClient.post<void>("/api/score/social", body);

export const patchSocialScore = (projectId: number, body: PatchSocialScoreRequest) =>
  apiClient.patch<void>(`/api/score/social/${projectId}`, body);

export const postScoreNotice = () =>
  apiClient.post<void>("/api/score/notice");

export const getScoreNotice = () =>
  apiClient.get<GetScoreNoticeResponse>("/api/score/notice");

export const getAllProjectFieldAverages = () =>
  apiClient.get<GetProjectFieldAverageResponse[]>("/api/score/projects/averages");

export const postScorePeriod = (body: PostScorePeriodRequest) =>
  apiClient.post<void>("/api/score/period", body);
