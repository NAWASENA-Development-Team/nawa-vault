import React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" {...props}>
      <defs>
        <filter id="arcane-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g transform="translate(0, 0)">
        {/* Large center diamond — scaled up for more impact */}
        <polygon
          points="60,28 88,60 60,92 32,60"
          fill="#FFFFFF"
          filter="url(#arcane-glow)"
        />

        {/* Medium wing diamonds */}
        <g fill="rgba(255, 255, 255, 0.8)">
          <polygon points="60,4 82,24 60,30 38,24" />
          <polygon points="60,116 82,96 60,90 38,96" />
          <polygon points="4,60 24,38 30,60 24,82" />
          <polygon points="116,60 96,38 90,60 96,82" />
        </g>

        {/* Corner accent diamonds */}
        <g fill="rgba(255, 255, 255, 0.45)">
          <polygon points="23,19 28,24 23,29 18,24" />
          <polygon points="97,19 102,24 97,29 92,24" />
          <polygon points="23,91 28,96 23,101 18,96" />
          <polygon points="97,91 102,96 97,101 92,96" />
        </g>
      </g>
    </svg>
  );
}
