
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isGlowing?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, isGlowing = false }) => {
  const baseClasses = "bg-gray-800/60 backdrop-blur-md border border-yellow-500/20 rounded-xl shadow-2xl transition-all duration-300";
  const glowClass = isGlowing ? "gold-glow-hard" : "";

  return (
    <div className={`${baseClasses} ${glowClass} ${className}`}>
      {children}
    </div>
  );
};
