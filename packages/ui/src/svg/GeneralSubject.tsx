import React from "react";

// 보통 교과
export default function GeneralSubject(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 19V4C5 3.73478 5.10536 3.48043 5.29289 3.29289C5.48043 3.10536 5.73478 3 6 3H18C18.2652 3 18.5196 3.10536 18.7071 3.29289C18.8946 3.48043 19 3.73478 19 4V17H7C6.46957 17 5.96086 17.2107 5.58579 17.5858C5.21071 17.9609 5 18.4696 5 19ZM5 19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H19M9 3V17M16 17V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
