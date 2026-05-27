import React from "react";

export default function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 8H16" stroke="currentColor" />
      <path d="M8 0V16" stroke="currentColor" />
    </svg>
  );
}
