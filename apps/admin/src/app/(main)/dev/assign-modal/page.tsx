import { notFound } from "next/navigation";
import AssignModalDevClient from "./AssignModalDevClient";

// 담당 선생님 배정 확인 모달 디자인 확인용 임시 테스트 페이지.
// 실제 배정 API를 호출하지 않고 모달 UI만 확인할 수 있다. 확인 끝나면 삭제해도 된다.
// 프로덕션 빌드에서는 노출되지 않도록 막아둔다.
export default function AssignModalDevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <AssignModalDevClient />;
}
