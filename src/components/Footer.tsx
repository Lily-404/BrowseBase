import React, { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';
import { audioLoader } from '../utils/audioLoader';
import { memo } from 'react';
import Icon from './ui/Icon';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange?: (page: number) => void;
  onPageSelectorOpenChange?: (isOpen: boolean) => void;
}

const Footer: React.FC<FooterProps> = ({ 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage,
  onPageChange,
  onPageSelectorOpenChange
}) => {
  const { t } = useTranslation();
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number | ''>(currentPage);

  useEffect(() => {
    setSelectedPage(currentPage);
  }, [currentPage]);

  const handlePageClick = useCallback(() => {
    audioLoader.playSound('/to.wav');
    setIsPageSelectorOpen(true);
    onPageSelectorOpenChange?.(true);
  }, [onPageSelectorOpenChange]);

  const handlePageChange = useCallback((page: number | '') => {
    let targetPage = 1;
    if (typeof page === 'number' && !isNaN(page)) {
      if (page < 1) targetPage = 1;
      else if (page > totalPages) targetPage = totalPages;
      else targetPage = page;
    }
    audioLoader.playSound('/to.wav');
    onPageChange?.(targetPage);
    setIsPageSelectorOpen(false);
    onPageSelectorOpenChange?.(false);
  }, [totalPages, onPageChange, onPageSelectorOpenChange]);

  const handlePrevClick = useCallback(() => {
    if (currentPage > 1) {
      audioLoader.playSound('/click.wav');
      onPrevPage();
    }
  }, [currentPage, onPrevPage]);

  const handleNextClick = useCallback(() => {
    if (currentPage < totalPages) {
      audioLoader.playSound('/click.wav');
      onNextPage();
    }
  }, [currentPage, totalPages, onNextPage]);

  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setSelectedPage('');
    } else {
      const value = parseInt(val);
      if (!isNaN(value)) {
        setSelectedPage(value);
      }
    }
  }, []);

  const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageChange(selectedPage);
    }
  }, [selectedPage, handlePageChange]);
  
  return (
    <footer className="mt-0">
      <div className="max-w-screen-xl mx-auto px-0 py-1 sm:py-4 flex items-center justify-center gap-3 sm:gap-12">
        <Button
          color={currentPage <= 1 ? "neutral" : "tertiary"}
          onClick={handlePrevClick}
          className={`min-w-[80px] sm:min-w-[140px] h-10 sm:h-12 px-3 sm:px-6 justify-center items-center rounded-lg transition-all duration-200 ${
            currentPage <= 1 ? 'opacity-50' : 'shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]'
          }`}
        >
          <Icon 
            name="ChevronLeft" 
            size={18} 
            className="sm:w-5 sm:h-5"
            fallback={<span className="text-sm">←</span>}
          />
          <span className="text-sm font-medium ml-0.5 sm:ml-2">{t('navigation.previous')}</span>
        </Button>

        <div className="relative">
          <div 
            onClick={handlePageClick}
            className="text-sm font-medium text-[#4D4D4D] cursor-pointer transition-all duration-200 px-2 py-1.5 rounded-lg w-[64px] sm:w-[100px] text-center shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]"
          >
            {currentPage} / {totalPages}
          </div>
          
          {isPageSelectorOpen && (
            <>
              <div 
                className="fixed inset-0 z-[9999] bg-black/10 backdrop-blur-[2px] pointer-events-auto"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                onClick={() => {
                  setIsPageSelectorOpen(false);
                  onPageSelectorOpenChange?.(false);
                }}
              />
              <div className="fixed sm:absolute top-[40%] sm:top-auto left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 sm:bottom-full sm:mb-4 bg-[#F5F5F5] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)] p-4 sm:p-6 w-[280px] sm:w-72 z-[10000] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm sm:text-base font-medium text-gray-700">{t('navigation.selectPage')}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{t('navigation.totalPages', { count: totalPages })}</div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={selectedPage}
                      onChange={handlePageInputChange}
                      onKeyDown={handlePageInputKeyDown}
                      className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg focus:outline-none text-center text-base sm:text-lg font-medium text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:bg-gray-50 shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]"
                      autoFocus
                      id="page-selector"
                      name="page-selector"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-6 pointer-events-none">
                      <span className="text-gray-400">#</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>{t('navigation.minPage')}</span>
                    <span>{t('navigation.maxPage', { count: totalPages })}</span>
                  </div>
                  <Button
                    color="primary"
                    onClick={() => handlePageChange(selectedPage)}
                    className="w-full mt-1 h-11 sm:h-12 text-sm sm:text-base font-medium transition-opacity shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]"
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
          className={`min-w-[80px] sm:min-w-[140px] h-10 sm:h-12 px-3 sm:px-6 justify-center items-center rounded-lg transition-all duration-200 ${
            currentPage >= totalPages ? 'opacity-50' : 'shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]'
          }`}
        >
          <span className="text-sm font-medium mr-0.5 sm:mr-2">{t('navigation.next')}</span>
          <Icon 
            name="ChevronRight" 
            size={18} 
            className="sm:w-5 sm:h-5"
            fallback={<span className="text-sm">→</span>}
          />
        </Button>
      </div>
    </footer>
  );
};

export default memo(Footer);