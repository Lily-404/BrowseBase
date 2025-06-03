import React from 'react';

interface ThemeToggleProps {
  isRetroTheme: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isRetroTheme, onToggle, className = '' }) => {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 ${isRetroTheme ? 'bg-[#2c2c2c] border-2 border-[#2c2c2c]' : 'bg-gray-800 rounded-lg'} text-white hover:opacity-90 transition-all ${isRetroTheme ? 'font-mono' : ''} ${className}`}
    >
      {isRetroTheme ? '现代模式' : '复古模式'}
    </button>
  );
}; 