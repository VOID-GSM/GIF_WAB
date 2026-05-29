"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-righteous mb-4 text-6xl leading-none tracking-tight text-[var(--color-yellow-600)] sm:text-8xl">
        404 ERROR
      </span>
      <p className="text-lg font-medium text-[var(--color-gray-700)] sm:text-2xl">
        죄송합니다. 페이지를 찾을 수 없습니다
      </p>
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="cursor-pointer border-none bg-transparent text-[var(--color-orange-600)] underline"
          type="button"
        >
          이전 페이지로 이동하기
        </button>
      </div>
    </div>
  );
}
