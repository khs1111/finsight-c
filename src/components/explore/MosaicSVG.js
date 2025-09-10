//핵심 포인트 모자이크 svg
import React from "react";

export default function MosaicSVG() {
  return (
    <svg
      style={{
        maxWidth: "412px",
        width: "100%",
        height: "auto",
        display: "block",
        margin: "0 auto",
      }}
      viewBox="0 0 404 238"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_549_4914)">
        <rect x="12" y="12" width="380" height="214" rx="12" fill="#FFE478" />
      </g>
      <defs>
        <filter
          id="filter0_f_549_4914"
          x="0"
          y="0"
          width="404"
          height="238"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="6"
            result="effect1_foregroundBlur_549_4914"
          />
        </filter>
      </defs>
    </svg>
  );
}
