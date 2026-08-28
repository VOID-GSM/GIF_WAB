export {
  getAllTeachers,
  assignTeacher,
  getMyAssignments,
  respondAssignment,
} from "./api/teacherApi";

export { useGetAllTeachers } from "./hooks/useGetAllTeachers";
export { useAssignTeacher } from "./hooks/useAssignTeacher";
export { useGetMyAssignments } from "./hooks/useGetMyAssignments";
export { useRespondAssignment } from "./hooks/useRespondAssignment";

export type {
  AdminRole,
  AssignmentStatus,
  AssignmentInfo,
  UnsubmittedProjectInfo,
  TeacherListResponse,
  AssignProjectTeacherRequest,
  RespondAssignmentRequest,
  MyTeacherAssignmentResponse,
} from "./model/type";
