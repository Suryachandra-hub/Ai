import React from 'react';

interface LogoProps {
  className?: string;
  // Allows changing the text color for different backgrounds
  textColorClass?: string;
}

/**
 * A scalable SVG component for the AiRus logo.
 * The geometric shape is rendered with a gold gradient,
 * and the text color can be customized for theme adaptability.
 */
export const Logo: React.FC<LogoProps> = ({ className = 'h-10', textColorClass = 'text-gray-900' }) => {
  return (
    <svg
      viewBox="0 0 200 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AiRus Logo"
    >
      <defs>
        <linearGradient id="logo-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FBBF24' }} />
          <stop offset="100%" style={{ stopColor: '#FDE047' }} />
        </linearGradient>
      </defs>
      
      {/* The 3D geometric shape */}
      <path d="M53 13 L44 22 L26 22 L35 13 Z" fill="#FBBF24" />
      <path d="M44 22 L53 31 L35 31 L26 22 Z" fill="url(#logo-gold-gradient)" />
      <path d="M26 22 L17 31 L35 31 Z" fill="#F59E0B" />

      {/* The text "AiRus" */}
      <text
        x="60"
        y="41"
        fontFamily="'Montserrat', sans-serif"
        fontSize="34"
        fontWeight="800"
        className={`fill-current ${textColorClass}`}
      >
        AiRus
      </text>
    </svg>
  );
};