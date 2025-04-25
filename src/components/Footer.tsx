import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Footer: React.FC<FooterProps> = ({ currentPage, totalPages, onNextPage, onPrevPage }) => {
  const { t } = useTranslation();
  
  const handleClick = (isNext: boolean) => {
    new Audio('/pressed.wav').play().catch(() => {});
    if (isNext && currentPage < totalPages) {
      onNextPage();
    } else if (!isNext && currentPage > 1) {
      onPrevPage();
    }
  };

  return (
    <footer className="mt-[-1rem]">
      <div className="max-w-screen-xl mx-auto px-0 py-4 flex justify-end gap-8">
        <Button
          color={currentPage <= 1 ? "neutral" : "secondary"}
          onClick={() => handleClick(false)}
          disabled={currentPage <= 1}
          className="min-w-[160px] justify-center"
        >
          <ChevronLeft size={18} />
          <span className="font-bold uppercase text-sm relative z-10">
            {t('navigation.previous')}
          </span>
        </Button>

        <Button
          color={currentPage >= totalPages ? "neutral" : "secondary"}
          onClick={() => handleClick(true)}
          disabled={currentPage >= totalPages}
          className="min-w-[160px] justify-center"
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