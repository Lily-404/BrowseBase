import React from 'react';
import { Download, Share2, Play } from 'lucide-react';

const Footer: React.FC = () => {
  const handleClick = () => {
    new Audio('/click.mp3').play().catch(() => {});
  };

  return (
    <footer className="flex justify-between items-center mt-8 py-5">
      <button 
        onClick={handleClick}
        className="btn-base flex items-center gap-2 bg-[#9A9A9A] text-white px-6 py-3 hover:bg-opacity-90"
      >
        <Download size={18} />
        <span className="font-bold uppercase text-sm">Download</span>
      </button>
      
      <button 
        onClick={handleClick}
        className="btn-base flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 hover:bg-opacity-90"
      >
        <Share2 size={18} />
        <span className="font-bold uppercase text-sm">Share</span>
      </button>
      
      <button 
        onClick={handleClick}
        className="btn-base flex items-center gap-2 bg-[#FB3208] text-white px-6 py-3 hover:bg-opacity-90"
      >
        <Play size={18} />
        <span className="font-bold uppercase text-sm">View</span>
      </button>
    </footer>
  );
};

export default Footer;