"use client";

import { useEffect, useState } from "react";

import { getCookieValue, resolveApiFileUrl } from "@repo/lib";

export type FileObjectUrlStatus = "idle" | "loading" | "ready" | "error";

// 제출 파일은 인증이 걸린 경로로 내려오기 때문에 <img src> 로 바로 못 건다.
// 토큰을 실어 blob 으로 받은 뒤 object URL 로 바꿔 그린다.
// 로컬에서 방금 고른 File 은 네트워크 없이 그대로 object URL 을 만든다.
export function useFileObjectUrl(
  source: File | string | undefined,
  enabled: boolean,
) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<FileObjectUrlStatus>("idle");

  useEffect(() => {
    if (!enabled || !source) {
      setObjectUrl(null);
      setMimeType(undefined);
      setStatus("idle");
      return;
    }

    if (typeof source !== "string") {
      setObjectUrl(URL.createObjectURL(source));
      setMimeType(source.type);
      setStatus("ready");
      return;
    }

    let isActive = true;
    setStatus("loading");

    (async () => {
      try {
        const token = getCookieValue("access_token");
        const res = await fetch(resolveApiFileUrl(source), {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`preview failed: ${res.status}`);

        const blob = await res.blob();
        if (!isActive) return;

        setObjectUrl(URL.createObjectURL(blob));
        setMimeType(blob.type);
        setStatus("ready");
      } catch {
        if (isActive) setStatus("error");
      }
    })();

    return () => {
      isActive = false;
    };
  }, [source, enabled]);

  // object URL 은 만든 값이 교체·해제될 때 반드시 되돌려줘야 메모리가 새지 않는다.
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return { objectUrl, mimeType, status };
}
