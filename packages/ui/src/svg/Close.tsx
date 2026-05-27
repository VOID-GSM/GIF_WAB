import React from "react";

export default function Close(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.696289 0.5L10.5002 10.5"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M10.304 0.5L0.500033 10.5"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}
