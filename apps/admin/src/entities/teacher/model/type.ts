export type AdminRole =
  | "MAJOR_TEACHER"
  | "GENERAL_TEACHER"
  | "MASTER"
  | "VOID";

export type AssignmentStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface AssignmentInfo {
  projectId?: number;
  projectName?: string;
  teamName?: string;
  status: AssignmentStatus;
  rejectReason?: string;
}

export interface UnsubmittedProjectInfo {
  projectId: number;
  projectName: string;
  teamName: string;
}

export interface TeacherListResponse {
  id: number;
  email: string;
  name: string;
  adminRole: AdminRole;
  adminTeam: string;
  isGradeHead: boolean;
  assignmentInfo?: AssignmentInfo;
  isScoreSubmitted: boolean;
  unsubmittedProjects: UnsubmittedProjectInfo[];
}

export interface AssignProjectTeacherRequest {
  projectId: number;
  teacherId: number;
}

export interface RespondAssignmentRequest {
  status: AssignmentStatus;
  rejectReason?: string;
}

// GET /api/teachers/assignments/my — 로그인한 admin 본인에게 온 배정 목록
export interface MyTeacherAssignmentResponse {
  assignmentId: number;
  projectId: number;
  projectName: string;
  teamName: string;
  status: AssignmentStatus;
  rejectReason?: string;
}
