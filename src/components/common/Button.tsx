
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none";
  
  const variantClasses = {
    primary: 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 focus:ring-yellow-400 gold-glow hover:scale-105',
    secondary: 'bg-gray-700 text-yellow-300 border border-yellow-600/50 hover:bg-gray-600 focus:ring-yellow-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};