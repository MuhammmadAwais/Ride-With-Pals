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
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Calendar body white background */}
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#FFFFFF" />

      {/* Top Header - Blue */}
      <path
        d="M3 8V6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V8H3Z"
        fill="#4285F4"
      />

      {/* Left Stripe - Blue */}
      <path
        d="M3 8H6.5V16.5H3V8Z"
        fill="#4285F4"
      />

      {/* Right Stripe - Green */}
      <path
        d="M17.5 8H21V16.5H17.5V8Z"
        fill="#34A853"
      />

      {/* Bottom Left - Yellow */}
      <path
        d="M3 16.5H12V21H6C4.34315 21 3 19.6569 3 18V16.5Z"
        fill="#FBBC05"
      />

      {/* Bottom Right - Red */}
      <path
        d="M12 16.5H21V18C21 19.6569 19.6569 21 18 21H12V16.5Z"
        fill="#EA4335"
      />

      {/* Center 31 text in Google Blue */}
      <text
        x="12"
        y="14.2"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
        fontSize="6.8"
        fontWeight="800"
        fill="#1A73E8"
      >
        31
      </text>
    </svg>
  );
};
