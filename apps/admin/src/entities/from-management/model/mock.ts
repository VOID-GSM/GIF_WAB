import {
  AdminForm,
  AdminFormDetail,
  AdminSubmitDetail,
  SubmitAnswer,
} from "@/entities/from-management/model/type";

// GET /api/form/{formId} 응답 mock — 제출 상세보기용 양식 단건 조회
export const mockFormDetailMap: Record<number, AdminFormDetail> = {
  1: {
    id: 1,
    title: "아이디어 페스티벌 보고서",
    description: "",
    deadline: "2026-12-21",
    announced: true,
    deadlineComplied: false,
    fields: [
      {
        id: 1,
        title: "팀 관련 사이트 QR코드",
        description: "팀 관련 사이트 QR코드를 첨부해 주세요.",
        type: "FILE",
        orderIndex: 0,
      },
      {
        id: 2,
        title: "프로젝트 이름",
        description: "프로젝트 이름을 입력해 주세요.",
        type: "TEXT",
        orderIndex: 1,
      },
      {
        id: 3,
        title: "프로젝트 추진 일정",
        description: "프로젝트 추진 일정을 입력해 주세요.",
        type: "CALENDAR",
        orderIndex: 2,
      },
    ],
  },
  2: {
    id: 2,
    title: "아이디어 페스티벌 배너",
    description: "",
    deadline: "2026-12-31",
    announced: true,
    deadlineComplied: false,
    fields: [
      {
        id: 1,
        title: "배너 이미지",
        description: "배너 이미지를 첨부해 주세요.",
        type: "FILE",
        orderIndex: 0,
      },
      {
        id: 2,
        title: "배너 설명 문구",
        description: "배너에 들어갈 설명 문구를 입력해 주세요.",
        type: "TEXT",
        orderIndex: 1,
      },
      {
        id: 3,
        title: "제작 일정",
        description: "제작 일정을 입력해 주세요.",
        type: "CALENDAR",
        orderIndex: 2,
      },
    ],
  },
};

// GET /api/form/admin 응답 mock
export const mockAdminForms: AdminForm[] = [
  {
    id: 1,
    title: "아이디어 페스티벌 보고서",
    deadline: "2026-12-21",
    announced: true,
    submitted: true,
    deadlineComplied: false,
    targetGrade: 1,
    teamName: "VOID",
  },
  {
    id: 2,
    title: "아이디어 페스티벌 보고서",
    deadline: "2026-12-21",
    announced: true,
    submitted: false,
    deadlineComplied: false,
    targetGrade: 1,
    teamName: "GIF",
  },
  {
    id: 3,
    title: "아이디어 페스티벌 보고서",
    deadline: "2026-12-21",
    announced: true,
    submitted: true,
    deadlineComplied: false,
    targetGrade: 1,
    teamName: "NOVA",
  },
  {
    id: 4,
    title: "아이디어 페스티벌 보고서",
    deadline: "2026-12-21",
    announced: true,
    submitted: true,
    deadlineComplied: false,
    targetGrade: 1,
    teamName: "PIXEL",
  },
  {
    id: 5,
    title: "아이디어 페스티벌 배너",
    deadline: "2026-12-31",
    announced: true,
    submitted: true,
    deadlineComplied: false,
    targetGrade: 2,
    teamName: "ALPHA",
  },
  {
    id: 6,
    title: "아이디어 페스티벌 배너",
    deadline: "2026-12-31",
    announced: true,
    submitted: false,
    deadlineComplied: false,
    targetGrade: 2,
    teamName: "BETA",
  },
  {
    id: 7,
    title: "아이디어 페스티벌 배너",
    deadline: "2026-12-31",
    announced: true,
    submitted: true,
    deadlineComplied: false,
    targetGrade: 2,
    teamName: "GAMMA",
  },
];

// GET /api/form/admin/submit?formId={formId} 응답 mock
// 답변은 평탄 구조. 캘린더 이벤트는 1개당 answer 1행으로 내려온다.
const emptyAnswerFields = {
  textAnswer: null,
  filePath: null,
  fileSize: null,
  originalFileName: null,
  dateAnswer: null,
};

function fileAnswer(
  fieldId: number,
  fieldTitle: string,
  filePath: string,
  fileSize: number,
  originalFileName: string | null = null,
): SubmitAnswer {
  return {
    ...emptyAnswerFields,
    fieldId,
    fieldTitle,
    type: "FILE",
    filePath,
    fileSize,
    originalFileName,
  };
}

function textAnswer(
  fieldId: number,
  fieldTitle: string,
  textAnswer: string,
): SubmitAnswer {
  return { ...emptyAnswerFields, fieldId, fieldTitle, type: "TEXT", textAnswer };
}

function calendarAnswer(
  fieldId: number,
  fieldTitle: string,
  event: { eventName: string; startDate: string; endDate: string; color: string },
): SubmitAnswer {
  return {
    ...emptyAnswerFields,
    fieldId,
    fieldTitle,
    type: "CALENDAR",
    dateAnswer: [event],
  };
}

export const mockSubmitDetailMap: Record<number, AdminSubmitDetail[]> = {
  1: [
    {
      submitId: 1,
      projectId: 1,
      teamName: "VOID",
      submittedByUserId: 101,
      submittedAt: "2026-06-10T09:00:00.000Z",
      deadlineComplied: true,
      answers: [
        fileAnswer(
          1,
          "팀 관련 사이트 QR코드",
          "/mock/void_report.pdf",
          2048000,
          "VOID_보고서.pdf",
        ),
        textAnswer(2, "프로젝트 이름", "저희 프로젝트 이름은 VOID 입니다"),
        calendarAnswer(3, "프로젝트 추진 일정", {
          eventName: "기획",
          startDate: "2026-01-05",
          endDate: "2026-01-07",
          color: "yellow",
        }),
        calendarAnswer(3, "프로젝트 추진 일정", {
          eventName: "개발",
          startDate: "2026-01-12",
          endDate: "2026-01-23",
          color: "green",
        }),
        calendarAnswer(3, "프로젝트 추진 일정", {
          eventName: "마무리",
          startDate: "2026-02-01",
          endDate: "2026-02-01",
          color: "red",
        }),
      ],
    },
    {
      submitId: 3,
      projectId: 3,
      teamName: "NOVA",
      submittedByUserId: 103,
      submittedAt: "2026-06-11T10:30:00.000Z",
      deadlineComplied: true,
      answers: [
        fileAnswer(1, "팀 관련 사이트 QR코드", "/mock/nova_report.pdf", 1536000),
        textAnswer(2, "프로젝트 이름", "NOVA는 별자리를 활용한 앱 서비스입니다."),
      ],
    },
    {
      submitId: 4,
      projectId: 4,
      teamName: "PIXEL",
      submittedByUserId: 104,
      submittedAt: "2026-06-12T08:00:00.000Z",
      deadlineComplied: true,
      answers: [
        fileAnswer(1, "팀 관련 사이트 QR코드", "/mock/pixel_qr.pdf", 512000),
        textAnswer(2, "프로젝트 이름", "PIXEL - 픽셀아트 공유 플랫폼"),
        calendarAnswer(3, "프로젝트 추진 일정", {
          eventName: "UI 설계",
          startDate: "2026-06-08",
          endDate: "2026-06-09",
          color: "yellow",
        }),
        calendarAnswer(3, "프로젝트 추진 일정", {
          eventName: "개발",
          startDate: "2026-06-15",
          endDate: "2026-06-25",
          color: "green",
        }),
      ],
    },
  ],

  2: [
    {
      submitId: 5,
      projectId: 5,
      teamName: "ALPHA",
      submittedByUserId: 105,
      submittedAt: "2026-06-13T14:00:00.000Z",
      deadlineComplied: true,
      answers: [
        fileAnswer(1, "배너 이미지", "/mock/alpha_banner.png", 3145728),
        textAnswer(2, "배너 설명 문구", "미래를 여는 아이디어, ALPHA와 함께"),
      ],
    },
    {
      submitId: 7,
      projectId: 7,
      teamName: "GAMMA",
      submittedByUserId: 107,
      submittedAt: "2026-06-14T11:00:00.000Z",
      deadlineComplied: true,
      answers: [
        fileAnswer(1, "배너 이미지", "/mock/gamma_banner.pdf", 4194304),
        textAnswer(
          2,
          "배너 설명 문구",
          "팀의 개성을 담은 배너로 관람객의 시선을 사로잡고자 했습니다.",
        ),
        calendarAnswer(3, "제작 일정", {
          eventName: "시안 제작",
          startDate: "2026-06-10",
          endDate: "2026-06-12",
          color: "yellow",
        }),
        calendarAnswer(3, "제작 일정", {
          eventName: "수정",
          startDate: "2026-06-20",
          endDate: "2026-06-22",
          color: "red",
        }),
        calendarAnswer(3, "제작 일정", {
          eventName: "최종 완성",
          startDate: "2026-06-28",
          endDate: "2026-06-28",
          color: "green",
        }),
      ],
    },
  ],
};
