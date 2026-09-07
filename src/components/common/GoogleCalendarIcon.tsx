import React from "react";

interface GoogleCalendarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const GoogleCalendarIcon: React.FC<GoogleCalendarIconProps> = ({
  size = 18,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Background container / border */}
      <rect width="48" height="48" rx="10" fill="#FFFFFF" />
      
      {/* Top Blue Bar */}
      <path
        d="M38 14H10C7.79086 14 6 15.7909 6 18V20H42V18C42 15.7909 40.2091 14 38 14Z"
        fill="#4285F4"
      />
      
      {/* Red accent on bottom-right corner */}
      <path
        d="M34 42H38C40.2091 42 42 40.2091 42 38V28H34V42Z"
        fill="#EA4335"
      />
      
      {/* Yellow accent on bottom-left corner */}
      <path
        d="M10 42H14V28H6V38C6 40.2091 7.79086 42 10 42Z"
        fill="#FBBC05"
      />
      
      {/* Green accent on right edge */}
      <path
        d="M42 20H34V28H42V20Z"
        fill="#34A853"
      />
      
      {/* Blue accent on left edge */}
      <path
        d="M6 20H14V28H6V20Z"
        fill="#4285F4"
      />

      {/* Center 31 / Event date symbol */}
      <path
        d="M18.5 25.5C18.5 24.1 19.6 23 21 23H27C28.4 23 29.5 24.1 29.5 25.5V33.5C29.5 34.9 28.4 36 27 36H21C19.6 36 18.5 34.9 18.5 33.5V25.5Z"
        fill="#4285F4"
        opacity="0.12"
      />
      <text
        x="24"
        y="33"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="#1A73E8"
      >
        31
      </text>

      {/* Clean outer rounded border */}
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="9.25"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
    </svg>
  );
};
