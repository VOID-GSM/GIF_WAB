import Link from "next/link";

interface ScoreRow {
  projectId?: number;
  rank: number;
  teamName: string;
  majorAverage?: number;
  reportAverage?: number;
  communityAverage?: number;
  grandTotalAverage?: number;
}

interface Props {
  isLoading: boolean;
  isError: boolean;
  scoreRows: ScoreRow[];
}

function formatInt(value: number | undefined) {
  return String(Math.round(value ?? 0));
}

export default function ScoreCollectionTable({ isLoading, isError, scoreRows }: Props) {
  if (isLoading) {
    return <p className="py-10 text-center text-gray-400">불러오는 중...</p>;
  }

  if (isError) {
    return <p className="py-10 text-center text-red-400">점수를 불러오는 데 실패했습니다.</p>;
  }

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
      {/*
        min-w로 전체 컬럼 폭을 확보한다.
        - 데스크톱(max-w-4xl 컨테이너): 전체 컬럼이 한 화면에 들어온다.
        - 모바일: 폭이 넘쳐 가로 스크롤이 생기고, 좌측 핵심 정보(등수/팀명)가 먼저 보인다.
      */}
      <div className="min-w-[40rem]">
        <div className="flex items-center bg-[var(--color-yellow-50)] border-y border-[var(--color-yellow-600)] dark:bg-[#85782c] dark:border-yellow-500/20 h-9 sticky top-0 z-10">
          {/* 핵심 정보 */}
          <div className="w-16 sm:w-20 md:w-24 shrink-0 px-4 text-xs font-semibold text-[var(--color-gray-700)] dark:text-gray-100">
            등수
          </div>
          <div className="flex-1 min-w-[6rem] px-4 text-xs font-semibold text-[var(--color-gray-700)] dark:text-gray-100">
            팀명
          </div>
          {/* 영역별 평균 */}
          <div className="w-24 shrink-0 px-4 text-xs font-semibold text-[var(--color-gray-700)] dark:text-gray-100">
            전공
          </div>
          <div className="w-24 shrink-0 px-4 text-xs font-semibold text-[var(--color-gray-700)] dark:text-gray-100">
            보고서
          </div>
          <div className="w-24 shrink-0 px-4 text-xs font-semibold text-[var(--color-gray-700)] dark:text-gray-100">
            사회
          </div>
          <div className="w-24 shrink-0 px-4 text-xs font-semibold text-[var(--color-gray-700)] dark:text-gray-100">
            총점수
          </div>
        </div>
        {scoreRows.length === 0 ? (
          <p className="py-10 text-center text-gray-400 text-sm">
            해당 학년에 등록된 팀이 없습니다.
          </p>
        ) : (
          scoreRows.map((row) => (
            <div
              key={row.teamName}
              className="flex items-center h-11 border-t border-gray-100"
            >
              <div className="w-16 sm:w-20 md:w-24 shrink-0 px-4 text-sm text-[var(--color-gray-800)] dark:text-gray-200">
                {row.rank}
              </div>
              <div className="flex-1 min-w-[6rem] truncate px-4 text-sm text-[var(--color-gray-800)] dark:text-gray-200">
                {row.projectId ? (
                  <Link
                    href={`/projects/${row.projectId}`}
                    className="inline-block max-w-full truncate underline-offset-2 transition-colors hover:text-yellow-700 hover:underline"
                  >
                    {row.teamName}
                  </Link>
                ) : (
                  row.teamName
                )}
              </div>
              {/* 영역별 평균 */}
              <div className="w-24 shrink-0 px-4 text-sm text-[var(--color-gray-600)] dark:text-gray-400">
                {formatInt(row.majorAverage)}
              </div>
              <div className="w-24 shrink-0 px-4 text-sm text-[var(--color-gray-600)] dark:text-gray-400">
                {formatInt(row.reportAverage)}
              </div>
              <div className="w-24 shrink-0 px-4 text-sm text-[var(--color-gray-600)] dark:text-gray-400">
                {formatInt(row.communityAverage)}
              </div>
              <div className="w-24 shrink-0 px-4 text-sm text-[var(--color-gray-600)] dark:text-gray-400">
                {formatInt(row.grandTotalAverage)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
