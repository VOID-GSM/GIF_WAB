"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4">
      <span className="text-8xl  leading-none tracking-tight text-[var(--color-yellow-600)] font-righteous mb-4">
        404 ERROR
      </span>
      <p className="text-2xl font-medium text-[var(--color-gray-700)]">
        죄송합니다. 페이지를 찾을 수 없습니다
      </p>
      <div className="flex gap-4">
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
