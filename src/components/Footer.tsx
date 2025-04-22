import React from 'react';
import { Download, Share2, Play } from 'lucide-react';

const Footer: React.FC = () => {
  const handleClick = () => {
    new Audio('/click.mp3').play().catch(() => {});
  };

  return (
    <footer className="bg-[#E6E6E6] bg-gradient-to-b from-white/20 to-transparent">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        <button 
          onClick={handleClick}
          className="btn-base flex items-center gap-2 bg-[#9A9A9A] text-white px-8 py-3 w-[30%]"
        >
          <Download size={18} />
          <span className="font-bold uppercase text-sm">Download</span>
        </button>
        
        <button 
          onClick={handleClick}
          className="btn-base flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3 w-[25%]"
        >
          <Share2 size={18} />
          <span className="font-bold uppercase text-sm">Share</span>
        </button>
        
        <button 
          onClick={handleClick}
          className="btn-base flex items-center gap-2 bg-[#FB3208] text-white px-8 py-3 w-[35%]"
        >
          <Play size={18} />
          <span className="font-bold uppercase text-sm">View</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;