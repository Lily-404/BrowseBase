import React, { useEffect, useCallback, memo } from 'react';
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
  
  useEffect(() => {
    // 确保音效文件在组件加载时就开始预加载
    audioLoader.waitForLoad().catch(error => {
      console.warn('Failed to preload audio:', error);
    });
  }, []);

  const handleResourceClick = useCallback(async (resource: Resource) => {
    try {
      // 懒加载音效
      if (!audioLoader.isAudioLoaded('/to.wav')) {
        await audioLoader.waitForLoad();
      }
      await audioLoader.playSound('/to.wav');
      trackEvent('Resource', 'To', resource.title);
    } catch (error) {
      console.warn('Failed to play sound:', error);
      trackEvent('Resource', 'To', resource.title);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  }, [onPageChange]);
  
  const renderResources = useCallback(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-8">
      {resources.map(resource => (
        <div key={resource.id} 
          className="bg-[#F1F1F1] rounded-lg p-3 sm:p-4
          shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]
          cursor-pointer hover:bg-[#E8E8E8] transition-colors duration-300
          flex flex-col group"
          onClick={() => {
            handleResourceClick(resource);
            window.open(resource.url, '_blank', 'noopener,noreferrer');
          }}
        >
          <div className="flex justify-between items-start mb-1.5 sm:mb-2">
            <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-2 group-hover:line-clamp-none transition-all duration-300 ease-in-out">{resource.title}</h3>
          </div>

          <div className="text-sm leading-relaxed text-[#1A1A1A]/60 line-clamp-4 group-hover:line-clamp-none transition-all duration-300 ease-in-out">
            {resource.description.split('\n\n')[0]}
          </div>
        </div>
      ))}
    </div>
  ), [resources, handleResourceClick]);
  
  // 优化骨架屏渲染
  const renderSkeleton = useCallback(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} 
          className="bg-[#F1F1F1] rounded-lg p-3 sm:p-4 animate-pulse
          shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]"
          style={{ 
            '--animation-delay': `${index * 0.05}s`,
            animationDelay: 'var(--animation-delay)'
          } as React.CSSProperties}
        >
          <div className="flex justify-between items-start mb-1.5 sm:mb-2">
            <div className="flex-1">
              <div className="h-5 bg-[#1A1A1A]/10 rounded w-3/4"></div>
              <div className="h-4 bg-[#1A1A1A]/10 rounded w-1/2 mt-2"></div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-3 bg-[#1A1A1A]/10 rounded w-full"></div>
            <div className="h-3 bg-[#1A1A1A]/10 rounded w-5/6"></div>
            <div className="h-3 bg-[#1A1A1A]/10 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </div>
  ), []);
  
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
        <div className="relative">
          {/* 骨架屏 */}
          <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {renderSkeleton()}
          </div>
          
          {/* 实际内容 */}
          <div className={`transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {renderResources()}
          </div>
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

// 使用 memo 优化组件重渲染
export default memo(ResourcePreview);