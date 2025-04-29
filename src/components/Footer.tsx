import React, { useCallback } from 'react';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage 
}) => {
  const { t } = useTranslation();
  
  // 创建音效播放函数
  const playClickSound = useCallback(() => {
    const audio = new Audio('/click.wav');  // 确保在 public 目录下有这个音频文件
    audio.volume = 0.4;  // 设置音量为 20%
    audio.play().catch(err => console.log('音频播放失败:', err));
  }, []);

  // 包装点击事件处理函数
  const handlePrevClick = () => {
    if (currentPage > 1) {
      playClickSound();
      onPrevPage();
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      playClickSound();
      onNextPage();
    }
  };
  
  return (
    <footer className="mt-0">
      <div className="max-w-screen-xl mx-auto px-0 py-4 flex justify-end gap-8">
        <Button
          color={currentPage <= 1 ? "neutral" : "tertiary"}
          onClick={handlePrevClick}
          className={`min-w-[160px] justify-center transition-opacity duration-200 ${
            currentPage <= 1 ? 'opacity-50 hover:opacity-70' : ''
          }`}
        >
          <ChevronLeft size={18} />
          <span className="font-bold uppercase text-sm relative z-10">
            {t('navigation.previous')}
          </span>
        </Button>

        <Button
          color={currentPage >= totalPages ? "neutral" : "tertiary"}
          onClick={handleNextClick}
          className={`min-w-[160px] justify-center transition-opacity duration-200 ${
            currentPage >= totalPages ? 'opacity-50 hover:opacity-70' : ''
          }`}
        >
          <span className="font-bold uppercase text-sm relative z-10">
            {t('navigation.next')}
          </span>
          <ChevronRight size={18} />
        </Button>
      </div>
    </footer>
  );
};

export default Footer;