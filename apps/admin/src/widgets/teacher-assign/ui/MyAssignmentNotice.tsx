"use client";

import { useState } from "react";

import {
  useGetMyAssignments,
  useRespondAssignment,
  type MyTeacherAssignmentResponse,
} from "@/entities/teacher";
import RejectAssignmentModal from "./RejectAssignmentModal";

// 로그인한 admin 본인에게 대기중인 배정 건이 있으면 팀별로 카드를 띄워 수락/거절할 수 있게 한다.
export default function MyAssignmentNotice() {
  const { data } = useGetMyAssignments();
  const pendingAssignments = data?.filter((a) => a.status === "PENDING");

  if (!pendingAssignments || pendingAssignments.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      {pendingAssignments.map((assignment) => (
        <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
      ))}
    </div>
  );
}

function AssignmentCard({
  assignment,
}: {
  assignment: MyTeacherAssignmentResponse;
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { mutate: respond, isPending } = useRespondAssignment();

  const handleAccept = () => {
    respond({
      assignmentId: assignment.assignmentId,
      body: { status: "ACCEPTED" },
    });
  };

  const handleReject = (rejectReason: string) => {
    respond(
      {
        assignmentId: assignment.assignmentId,
        body: { status: "REJECTED", rejectReason: rejectReason || undefined },
      },
      { onSuccess: () => setShowRejectModal(false) },
    );
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-[16px] border-2 border-yellow-600 bg-yellow-100 px-5 py-4 shadow-new sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-600 text-[18px]">
          🔔
          <span className="absolute right-0 top-0 h-2.5 w-2.5 animate-ping rounded-full bg-orange-600" />
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-orange-600" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-yellow-700">
            담당 팀 배정 요청
          </p>
          <p className="text-[16px] font-bold text-gray-900">
            {assignment.teamName} 팀 담당으로 배정되었어요
          </p>
        </div>
      </div>

      {/* 좁은 화면(모바일)에서는 텍스트 아래 줄 오른쪽에, 넓은 화면에서는 같은 줄 오른쪽에 붙는다 */}
      <div className="flex shrink-0 justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          className="cursor-pointer rounded-[10px] bg-gray-100 px-4 py-2 text-[14px] font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
        >
          거절
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={isPending}
          className="cursor-pointer rounded-[10px] bg-yellow-600 px-4 py-2 text-[14px] font-bold text-gray-900 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          수락
        </button>
      </div>

      {showRejectModal && (
        <RejectAssignmentModal
          teamName={assignment.teamName}
          isPending={isPending}
          onConfirm={handleReject}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}
