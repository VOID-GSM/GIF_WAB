"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";

interface ReorderableField {
  id: string;
  orderIndex: number;
}

// 양식 항목 카드를 드래그해 순서를 바꾼다.
// dragEnter 시점에 바로 자리를 바꿔(live reorder) 끌고 가는 대로 위치가 따라오게 하고,
// orderIndex 는 배열 순서에 맞춰 다시 매겨 저장 시 그대로 전송되도록 한다.
export function useFieldReorder<T extends ReorderableField>(
  setFields: Dispatch<SetStateAction<T[]>>,
) {
  // 드래그 중 최신 값을 이벤트 핸들러에서 바로 읽어야 해 ref 로도 함께 들고 있는다.
  const draggingIdRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    draggingIdRef.current = id;
    setDraggingId(id);
  };

  const handleDragEnter = (overId: string) => {
    const dragId = draggingIdRef.current;
    if (!dragId || dragId === overId) return;

    setFields((prev) => {
      const from = prev.findIndex((f) => f.id === dragId);
      const to = prev.findIndex((f) => f.id === overId);
      if (from === -1 || to === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);

      return next.map((f, i) => ({ ...f, orderIndex: i }));
    });
  };

  const handleDragEnd = () => {
    draggingIdRef.current = null;
    setDraggingId(null);
  };

  return { draggingId, handleDragStart, handleDragEnter, handleDragEnd };
}
