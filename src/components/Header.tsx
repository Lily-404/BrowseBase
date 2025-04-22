import React from 'react';
import { ArrowRight, X } from 'lucide-react';

const Header: React.FC = () => {
  const handleClick = () => {
    new Audio('/click.mp3').play().catch(() => {});
  };

  return (
    <header>
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-[#1A1A1A]">BrowseBase</h1>
            <p className="text-xs text-[#9A9A9A]">Discover the best of the web.</p>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={handleClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A1A]"
            >
              <span className="font-bold uppercase text-sm">Start Exploring</span>
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={handleClick}
              className="p-1 hover:bg-[#F1F1F1] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;