import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Footer: React.FC<FooterProps> = ({ currentPage, totalPages, onNextPage, onPrevPage }) => {
  const handleClick = (isNext: boolean) => {
    new Audio('/click.wav').play().catch(() => {});
    if (isNext && currentPage < totalPages) {
      onNextPage();
    } else if (!isNext && currentPage > 1) {
      onPrevPage();
    }
  };

  return (
    <footer className="mt-[-1rem]">  {/* 添加负的上边距 */}
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-end gap-6">
        <div className="relative">
          {/* 底部阴影效果，增强立体感 */}
          <div className={`absolute top-[1px] left-[1px] w-full h-full rounded opacity-80 blur-[1px] ${currentPage <= 1 ? 'bg-[#CDCDCD]' : 'bg-[#4A4A4A]'}`} />
          <div className={`absolute top-[-1px] left-[-1px] w-full h-full rounded ${currentPage <= 1 ? 'bg-[#CDCDCD]' : 'bg-[#4A4A4A]'}`} />
          <button 
            onClick={() => handleClick(false)}
            disabled={currentPage <= 1}
            className={`
              relative w-full h-full outline-none
              ${currentPage <= 1 
                ? 'bg-gradient-to-br from-[#ADADAD] to-[#9A9A9A]' 
                : 'bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]'} 
              rounded p-3 flex items-center gap-2 px-8 py-3 min-w-[160px] justify-center
              ${currentPage <= 1 
                ? 'shadow-[-1px_-1px_2px_rgba(255,255,255,0.1),4px_4px_7px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(0,0,0,0.1),inset_1px_1px_2px_rgba(255,255,255,0.2)]' 
                : 'shadow-[-1px_-1px_2px_rgba(255,255,255,0.15),4px_4px_7px_rgba(0,0,0,0.35),inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]'}
              transition-all duration-100 ease-in-out 
              ${currentPage <= 1 
                ? '' 
                : 'active:scale-[0.98] active:shadow-[-1px_-1px_1px_rgba(255,255,255,0.1),2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_1px_rgba(0,0,0,0.3),inset_1px_1px_1px_rgba(255,255,255,0.05)]'}
              ${currentPage <= 1 
                ? 'cursor-not-allowed opacity-80' 
                : 'hover:shadow-[-1px_-1px_3px_rgba(255,255,255,0.2),5px_5px_8px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.15)]'}
              overflow-hidden border-0 focus:outline-none
              ${currentPage <= 1 ? '' : 'before:content-[\'\'] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.15)] before:to-transparent'}
              ${currentPage <= 1 ? '' : 'after:content-[\'\'] after:absolute after:top-[1px] after:left-0 after:w-[1px] after:h-full after:bg-gradient-to-b after:from-[rgba(255,255,255,0.15)] after:to-transparent'}
            `}
          >
            <ChevronLeft size={18} className={currentPage <= 1 ? 'text-gray-500' : 'text-white'} />
            <span className={`font-bold uppercase text-sm ${currentPage <= 1 ? 'text-gray-500' : 'text-white'} relative z-10`}>
              Previous
            </span>
          </button>
        </div>

        <div className="relative">
          {/* 底部阴影效果，增强立体感 */}
          <div className={`absolute top-[1px] left-[1px] w-full h-full rounded opacity-80 blur-[1px] ${currentPage >= totalPages ? 'bg-[#CDCDCD]' : 'bg-[#4A4A4A]'}`} />
          <div className={`absolute top-[-1px] left-[-1px] w-full h-full rounded ${currentPage >= totalPages ? 'bg-[#CDCDCD]' : 'bg-[#4A4A4A]'}`} />
          <button 
            onClick={() => handleClick(true)}
            disabled={currentPage >= totalPages}
            className={`
              relative w-full h-full outline-none
              ${currentPage >= totalPages 
                ? 'bg-gradient-to-br from-[#ADADAD] to-[#9A9A9A]' 
                : 'bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]'} 
              rounded p-3 flex items-center gap-2 px-8 py-3 min-w-[160px] justify-center
              ${currentPage >= totalPages 
                ? 'shadow-[-1px_-1px_2px_rgba(255,255,255,0.1),4px_4px_7px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(0,0,0,0.1),inset_1px_1px_2px_rgba(255,255,255,0.2)]' 
                : 'shadow-[-1px_-1px_2px_rgba(255,255,255,0.15),4px_4px_7px_rgba(0,0,0,0.35),inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]'}
              transition-all duration-100 ease-in-out 
              ${currentPage >= totalPages 
                ? '' 
                : 'active:scale-[0.98] active:shadow-[-1px_-1px_1px_rgba(255,255,255,0.1),2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_1px_rgba(0,0,0,0.3),inset_1px_1px_1px_rgba(255,255,255,0.05)]'}
              ${currentPage >= totalPages 
                ? 'cursor-not-allowed opacity-80' 
                : 'hover:shadow-[-1px_-1px_3px_rgba(255,255,255,0.2),5px_5px_8px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.15)]'}
              overflow-hidden border-0 focus:outline-none
              ${currentPage >= totalPages ? '' : 'before:content-[\'\'] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.15)] before:to-transparent'}
              ${currentPage >= totalPages ? '' : 'after:content-[\'\'] after:absolute after:top-[1px] after:left-0 after:w-[1px] after:h-full after:bg-gradient-to-b after:from-[rgba(255,255,255,0.15)] after:to-transparent'}
            `}
          >
            <span className={`font-bold uppercase text-sm ${currentPage >= totalPages ? 'text-gray-500' : 'text-white'} relative z-10`}>
              Next
            </span>
            <ChevronRight size={18} className={currentPage >= totalPages ? 'text-gray-500' : 'text-white'} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;