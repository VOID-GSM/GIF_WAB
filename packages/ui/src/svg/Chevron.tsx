import React from "react";

type ChevronDirection = "up" | "down" | "left" | "right";

const rotateMap: Record<ChevronDirection, string> = {
  down:  "rotate(0deg)",
  up:    "rotate(180deg)",
  right: "rotate(-90deg)",
  left:  "rotate(90deg)",
};

interface ChevronProps extends React.SVGProps<SVGSVGElement> {
  direction?: ChevronDirection;
}

export default function Chevron({ direction = "down", style, ...props }: ChevronProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: rotateMap[direction], ...style }}
      {...props}
    >
      <path
        d="M18 6L10 14L2 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
