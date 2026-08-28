export interface DetailScoreResponse {
  id: number;
  evaluatorId: string;
  technicalCompleteness: number;
  socialValueMajor: number;
  aiUtilizationMajor: number;
  presentationMajor: number;
  reportWriting: number;
  reportContent: number;
  aiUsagePlan: number;
  creativity: number;
  userExperience: number;
  socialValueCommunity: number;
  aiUtilizationCommunity: number;
  presentationCommunity: number;
  subTotalScore: number;
  rank: number;
}

export interface CreateMajorScoreRequest {
  projectId: number;
  technicalCompleteness: number;
  socialValueMajor: number;
  aiUtilityMajorScore: number;
  presentationMajor: number;
}

export interface CreateReportScoreRequest {
  projectId: number;
  reportWriting: number;
  reportContent: number;
  aiUsagePlan: number;
  creativity: number;
}

export interface CreateSocialScoreRequest {
  projectId: number;
  userExperience: number;
  socialValueCommunity: number;
  aiUtilizationCommunity: number;
  presentationCommunity: number;
}

export type PatchMajorScoreRequest = Omit<CreateMajorScoreRequest, "projectId">;

export type PatchReportScoreRequest = Omit<CreateReportScoreRequest, "projectId">;

export type PatchSocialScoreRequest = Omit<CreateSocialScoreRequest, "projectId">;

export interface GetScoreSummaryResponse {
  projectId: number;
  teamName: string;
  averageScore: number;
  scoreCount: number;
}

export interface GetScoreNoticeResponse {
  isPublished: boolean;
  publishedAt: string;
  scores: GetScoreSummaryResponse[];
}

export interface GetProjectFieldAverageResponse {
  projectId: number;
  majorAverage: number;
  reportAverage: number;
  communityAverage: number;
  grandTotalAverage: number;
}

export type ScorePeriodCategory = "MAJOR" | "REPORT" | "SOCIAL";

export interface PostScorePeriodRequest {
  category: ScorePeriodCategory;
  startDate: string; // ISO 8601
}
