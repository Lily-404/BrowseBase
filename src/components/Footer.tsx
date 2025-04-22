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
    <footer>
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-end gap-6">
        <div className="relative">
          {/* 底部固定矩形，向左上偏移 */}
          <div className="absolute top-[-1px] left-[-1px] w-full h-full bg-[#3A3A3A] rounded" />
          <button 
            onClick={() => handleClick(false)}
            disabled={currentPage <= 1}
            className={`
              relative w-full h-full outline-none
              ${currentPage <= 1 ? 'bg-[#9A9A9A]' : 'bg-[#1A1A1A]'} 
              rounded p-3 flex items-center gap-2 px-8 py-3 min-w-[160px] justify-center
              shadow-[-1px_-1px_2px_rgba(255,255,255,0.15),4px_4px_7px_rgba(0,0,0,0.25),inset_-1px_-1px_2px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.1)]
              transition-transform duration-100 ease-in-out active:scale-[0.98]
              ${currentPage <= 1 ? 'cursor-not-allowed' : ''}
              overflow-hidden border-0 focus:outline-none
            `}
          >
            <ChevronLeft size={18} className={currentPage <= 1 ? 'text-gray-500' : 'text-white'} />
            <span className={`font-bold uppercase text-sm ${currentPage <= 1 ? 'text-gray-500' : 'text-white'} relative z-10`}>
              Previous
            </span>
          </button>
        </div>

        <div className="relative">
          {/* 底部固定矩形，向左上偏移 */}
          <div className="absolute top-[-1px] left-[-1px] w-full h-full bg-[#3A3A3A] rounded" />
          <button 
            onClick={() => handleClick(true)}
            disabled={currentPage >= totalPages}
            className={`
              relative w-full h-full outline-none
              ${currentPage >= totalPages ? 'bg-[#9A9A9A]' : 'bg-[#1A1A1A]'} 
              rounded p-3 flex items-center gap-2 px-8 py-3 min-w-[160px] justify-center
              shadow-[-1px_-1px_2px_rgba(255,255,255,0.15),4px_4px_7px_rgba(0,0,0,0.25),inset_-1px_-1px_2px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.1)]
              transition-transform duration-100 ease-in-out active:scale-[0.98]
              ${currentPage >= totalPages ? 'cursor-not-allowed' : ''}
              overflow-hidden border-0 focus:outline-none
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