import { getLinkHost, getLinkPath } from "@repo/lib";

import Link from "../../svg/Link";

interface SubmittedLinkCardProps {
  url: string;
}

// 링크로 제출한 답변 카드 (client 제출 화면·admin 제출물 확인 공용).
// 파일 카드와 헷갈리지 않도록 파일명 자리에 호스트를 세우고, 경로는 아랫줄로 내린다.
// 어디로 가는 링크인지가 먼저 읽히고, 나머지로 같은 주소인지 확인할 수 있다.
export default function SubmittedLinkCard({ url }: SubmittedLinkCardProps) {
  const host = getLinkHost(url);
  const path = getLinkPath(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="flex w-full items-center gap-3 rounded-[10px] border border-gray-80 px-4 py-[13px] transition-colors hover:border-gray-300"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600"
      >
        <Link />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] font-semibold text-gray-900">
          {host}
        </span>
        {path && (
          <span className="truncate text-[12px] text-gray-400">{path}</span>
        )}
      </span>

      {/* ProjectLinkChip 과 같은 표시 — 새 탭으로 열린다는 뜻 */}
      <span aria-hidden="true" className="flex-shrink-0 text-gray-400">
        ↗
      </span>
    </a>
  );
}
