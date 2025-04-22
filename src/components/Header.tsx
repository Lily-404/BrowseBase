import React from 'react';
import { ArrowRight, X } from 'lucide-react';

const Header: React.FC = () => {
  const handleClick = () => {
    new Audio('/click.mp3').play().catch(() => {});
    const button = document.querySelector('.shake-button');
    button?.classList.remove('shake');
    void button?.offsetWidth; // 触发重排，重置动画
    button?.classList.add('shake');
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
            <a 
              href="https://www.jimmy-blog.top/" 
              onClick={handleClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A1A]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-bold uppercase text-sm">Blog</span>
              <ArrowRight size={16} />
            </a>
            <a 
              href="https://github.com/Lily-404/BrowseBase" 
              onClick={handleClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A1A]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-bold uppercase text-sm">Open Source</span>
              <ArrowRight size={16} />
            </a>
            <button 
              onClick={handleClick}
              className="p-1 hover:bg-[#F1F1F1] rounded-full transition-colors shake-button"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        .shake {
          animation: shake 0.2s ease-in-out 3;
        }
      `}</style>
    </header>
  );
};

export default Header;