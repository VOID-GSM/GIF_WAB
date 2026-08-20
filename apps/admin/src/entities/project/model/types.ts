import type { Grade } from "@repo/ui";

export { GRADES } from "@repo/ui";
export type { Grade };

export interface FilteredProject {
  id: number;
  name: string;
  teamName: string;
  logo: string;
  grade: Grade;
}

// GET /api/project/filter?grade= — 학년별 프로젝트 목록
export type GetFilteredProjectsResponse = FilteredProject[];

export interface ProjectMember {
  userId: number;
  name: string;
  studentNumber: string;
  role: string;
}

// GET /api/project/{projectId} — 프로젝트 상세
export interface ProjectDetail {
  id: number;
  name: string;
  teamName: string;
  description: string;
  logo: string;
  grade: number;
  members: ProjectMember[];
}

// GET /api/project/{projectId}/summary — AI가 생성한 프로젝트 요약 (응답은 요약 문자열)
export type ProjectSummaryResponse = string;

// GET /api/project/{projectId}/links — 팀이 등록한 GitHub·배포 주소 등 (admin 은 열람만)
export interface ProjectLink {
  id: number;
  title: string;
  url: string;
}

export type GetProjectLinksResponse = ProjectLink[];

// GET /api/project/{projectId}/note — 프로젝트 메모 조회
export interface GetProjectNoteResponse {
  projectId: number;
  content: string;
}

// PUT /api/project/{projectId}/note — 프로젝트 메모 작성/수정
export interface UpdateProjectNoteRequest {
  content: string;
}

// PATCH /api/project/{projectId}/transfer-leader — 팀장 양도(아이디어페스티벌 담당(MASTER) 관리자만 호출)
export interface TransferLeaderRequest {
  newLeaderUserId: number;
}
