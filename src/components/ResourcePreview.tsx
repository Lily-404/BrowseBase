import React from 'react';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../utils/analytics';
import { Resource } from '../types/resourcePreview';
import { audioLoader } from '../utils/audioLoader';

interface ResourcePreviewProps {
  resources: Resource[];
  currentPage: number;
  itemsPerPage: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange?: (page: number) => void;
  onPageSelectorOpenChange?: (isOpen: boolean) => void;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
}

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ 
  resources, 
  currentPage, 
  onNextPage,
  onPrevPage,
  onPageChange,
  onPageSelectorOpenChange,
  totalPages,
  totalCount,
  isLoading = false
}) => {
  const { t } = useTranslation();
  
  const handleResourceClick = (resource: Resource) => {
    audioLoader.playSound('/to.wav');
    trackEvent('Resource', 'To', resource.title);
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };
  
  if (isLoading || !resources.length) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-row justify-between relative items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base uppercase text-[#4D4D4D]">{t('resourcePreview.title')}</h2>
            <span className="text-sm text-[#4D4D4D]/60">
              {t('resourcePreview.totalResources', { count: totalCount })}
            </span>
          </div>
          <div className="flex flex-1 h-[1px] bg-foreground/8" />
        </div>
        <div className="flex flex-1 flex-col rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} 
                className="bg-[#F1F1F1] rounded-lg p-4 animate-pulse
                shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]"
                style={{ 
                  '--animation-delay': `${item * 0.05}s`,
                  animationDelay: 'var(--animation-delay)'
                } as React.CSSProperties}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pb-28">
          <div className="fixed bottom-0 left-0 right-0 bg-[#E7E7E7] py-4 border-t border-[#D1D1D1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto px-4">
              <Footer 
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
                onPageChange={handlePageChange}
                onPageSelectorOpenChange={onPageSelectorOpenChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row justify-between relative gap-2 mb-3">
        <div className="flex items-end">
          <h2 className="text-base font-medium text-[#4D4D4D]">{t('resourcePreview.title')}</h2>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-sm text-[#4D4D4D]/60">
            {t('resourcePreview.totalResources', { count: totalCount })}
          </span>
          <div className="flex flex-1 h-[1px] bg-foreground/8" />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-8">
          {resources.map(resource => (
            <div key={resource.id} 
              className="bg-[#F1F1F1] rounded-lg p-3 sm:p-4
              shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]
              cursor-pointer hover:bg-[#E8E8E8] transition-colors"
              onClick={() => {
                handleResourceClick(resource);
                window.open(resource.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1">{resource.title}</h3>
              </div>

              <div className="text-sm leading-relaxed text-[#1A1A1A]/60 line-clamp-3 text-wrap-pretty">
                {resource.description.split('\n\n')[0]}
              </div>
            </div>
          ))}
        </div>
        <div className="pb-20 sm:pb-28">
          <div className="fixed bottom-0 left-0 right-0 bg-[#E7E7E7] py-3 sm:py-4 border-t border-[#D1D1D1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto px-4">
              <Footer 
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
                onPageChange={handlePageChange}
                onPageSelectorOpenChange={onPageSelectorOpenChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResourcePreview);