import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = '加载中...' }) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center bg-gray-50/50 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-gray-700">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingState; 