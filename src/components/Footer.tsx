import React from 'react';
import { Button } from './ui/button';
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
  
  console.log('Footer render:', { currentPage, totalPages }); // 添加调试信息
  
  return (
    <footer className="mt-0">
      <div className="max-w-screen-xl mx-auto px-0 py-4 flex justify-end gap-8">
        <Button
          color={currentPage <= 1 ? "neutral" : "secondary"}
          onClick={onPrevPage}
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
          onClick={onNextPage}
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