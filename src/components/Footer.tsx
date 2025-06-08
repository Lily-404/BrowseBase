import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { audioLoader } from '../utils/audioLoader';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange?: (page: number) => void;
}

const Footer: React.FC<FooterProps> = ({ 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage,
  onPageChange 
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(currentPage);
  
  // 预加载音频
  useEffect(() => {
    audioRef.current = new Audio('/click.wav');
    audioRef.current.volume = 0.4;
    audioRef.current.load();
  }, []);

  // 创建音效播放函数
  const playClickSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('音频播放失败:', err));
    }
  }, []);

  // 包装点击事件处理函数
  const handlePrevClick = () => {
    if (currentPage > 1) {
      audioLoader.playSound('/click.wav');
      onPrevPage();
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      audioLoader.playSound('/click.wav');
      onNextPage();
    }
  };

  const handlePageClick = () => {
    audioLoader.playSound('/to.wav');
    setIsPageSelectorOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      audioLoader.playSound('/to.wav');
      setSelectedPage(page);
      onPageChange?.(page);
      setIsPageSelectorOpen(false);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedPage(1);
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue > totalPages) {
        setSelectedPage(totalPages);
      } else if (numValue < 1) {
        setSelectedPage(1);
      } else {
        setSelectedPage(numValue);
      }
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      audioLoader.playSound('/click.wav');
      handlePageChange(selectedPage);
    }
  };
  
  return (
    <footer className="mt-0">
      <div className="max-w-screen-xl mx-auto px-0 py-2 sm:py-4 flex items-center justify-center gap-6">
        <Button
          color={currentPage <= 1 ? "neutral" : "tertiary"}
          onClick={handlePrevClick}
          className={`min-w-[100px] h-12 px-4 justify-center items-center rounded-lg transition-opacity duration-200 ${
            currentPage <= 1 ? 'opacity-50 hover:opacity-70' : ''
          }`}
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium ml-1">{t('navigation.previous')}</span>
        </Button>

        <div className="relative">
          <div 
            onClick={handlePageClick}
            className="text-sm font-medium text-[#4D4D4D] cursor-pointer hover:text-[#666] transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 w-[80px] text-center"
          >
            {currentPage} / {totalPages}
          </div>
          
          {isPageSelectorOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsPageSelectorOpen(false)}
              />
              <div className="fixed sm:absolute sm:bottom-full sm:left-1/2 sm:-translate-x-1/2 sm:mb-3 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 w-48 sm:w-56 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{t('navigation.selectPage')}</div>
                    <div className="text-xs text-gray-400">{t('navigation.totalPages', { count: totalPages })}</div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={selectedPage}
                      onChange={handlePageInputChange}
                      onKeyDown={handlePageInputKeyDown}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-center text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-400">#</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{t('navigation.minPage')}</span>
                    <span>{t('navigation.maxPage', { count: totalPages })}</span>
                  </div>
                  <Button
                    color="primary"
                    onClick={() => handlePageChange(selectedPage)}
                    className="w-full mt-1 h-10 text-sm font-medium"
                  >
                    {t('navigation.goToPage')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <Button
          color={currentPage >= totalPages ? "neutral" : "tertiary"}
          onClick={handleNextClick}
          className={`min-w-[100px] h-12 px-4 justify-center items-center rounded-lg transition-opacity duration-200 ${
            currentPage >= totalPages ? 'opacity-50 hover:opacity-70' : ''
          }`}
        >
          <span className="text-sm font-medium mr-1">{t('navigation.next')}</span>
          <ChevronRight size={20} />
        </Button>
      </div>
    </footer>
  );
};

export default Footer;