import React from "react";

export default function DragHandle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="12"
      viewBox="0 0 20 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 3.5H18M2 8.5H18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
