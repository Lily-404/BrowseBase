import React, { useEffect, useCallback, memo, useMemo, useState, useRef } from 'react';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tilt, setTilt] = useState<{[id: string]: {x: number, y: number}}>({});
  const cardRefs = useRef<{[id: string]: HTMLDivElement | null}>({});
  const defaultHeights = useRef<{[id: string]: number}>({});
  const [hoverTranslateY, setHoverTranslateY] = useState(0);

  // Footer高度自适应
  const getFooterHeight = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) { // sm: 640px
      return 112; // h-28
    }
    return 56; // h-14
  };
  const [footerHeight, setFooterHeight] = useState(getFooterHeight());
  useEffect(() => {
    const handleResize = () => setFooterHeight(getFooterHeight());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 记录每个卡片的默认高度
  useEffect(() => {
    resources.forEach(resource => {
      const card = cardRefs.current[resource.id];
      if (card && !defaultHeights.current[resource.id]) {
        defaultHeights.current[resource.id] = card.getBoundingClientRect().height;
      }
    });
  }, [resources]);

  // 计算所有卡片的最大默认高度
  const maxDefaultHeight = useMemo(() => {
    const heights = Object.values(defaultHeights.current);
    return heights.length > 0 ? Math.max(...heights) : undefined;
  }, [resources, defaultHeights.current]);

  useEffect(() => {
    if (hoveredId && cardRefs.current[hoveredId]) {
      const card = cardRefs.current[hoveredId];
      if (!card) return;
      setTimeout(() => {
        const rect = card.getBoundingClientRect();
        const overBottom = rect.bottom - (window.innerHeight - footerHeight);
        if (overBottom > 0) {
          setHoverTranslateY(-overBottom - 16);
        } else {
          setHoverTranslateY(0);
        }
      }, 0);
    } else {
      setHoverTranslateY(0);
    }
  }, [hoveredId, footerHeight]);

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
  
  // 判断是否为移动端（动态监听）
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  });
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderResources = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-8 relative">
      {resources.map(resource => {
        if (isMobile) {
          // 移动端：无hover/3D/放大，内容全展开
          return (
            <div key={resource.id} className="relative w-full h-full">
              <div
                className="relative z-0 h-full bg-[#F1F1F1] rounded-lg p-3 sm:p-4 shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)] cursor-pointer flex flex-col group transition-all duration-300"
                onClick={() => {
                  handleResourceClick(resource);
                  window.open(resource.url, '_blank', 'noopener,noreferrer');
                }}
              >
                <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                  <h3 className="text-base font-bold text-[#1A1A1A] transition-all duration-300 ease-in-out line-clamp-none">{resource.title}</h3>
                </div>
                <div className="text-sm leading-relaxed text-[#1A1A1A]/60 transition-all duration-300 ease-in-out line-clamp-none">
                  {resource.description.split('\n\n')[0]}
                </div>
              </div>
            </div>
          );
        }
        // ...PC端原有交互...
        const isHovered = hoveredId === resource.id;
        const rotateX = isHovered && tilt[resource.id] ? tilt[resource.id].x : 0;
        const rotateY = isHovered && tilt[resource.id] ? tilt[resource.id].y : 0;
        // 动态高光和阴影方向
        let dynamicBoxShadow = undefined;
        if (isHovered) {
          const highlightX = -rotateY * 2;
          const highlightY = -rotateX * 2;
          const shadowX = rotateY * 2;
          const shadowY = rotateX * 2;
          dynamicBoxShadow = `
            ${shadowX}px ${shadowY}px 40px 0 rgba(0,0,0,0.28),
            inset ${highlightX}px ${highlightY}px 28px rgba(255,255,255,0.95)
          `;
        }
        let transformOrigin = 'center center';
        if (isHovered && cardRefs.current[resource.id]) {
          const card = cardRefs.current[resource.id];
          if (card) {
            const rect = card.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 40) {
              transformOrigin = 'center bottom';
            }
          }
        }
        return (
          <div key={resource.id} className="relative w-full h-full">
            <div
              ref={el => { cardRefs.current[resource.id] = el; }}
              className={`
                ${isHovered
                  ? 'absolute z-20 border-2 border-[#F9FAFB] scale-110 -translate-y-1'
                  : 'relative z-0 h-full border border-[#E5E7EB] shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]'}
                top-0 left-0 w-full
                rounded-lg p-3 sm:p-4
                
                bg-[#F1F1F1]
                cursor-pointer flex flex-col group transition-all duration-300
                duration-1000
              `}
              style={{
                transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 1s cubic-bezier(.22,1,.36,1)',
                height: isHovered ? 'auto' : undefined,
                minHeight: maxDefaultHeight ? `${maxDefaultHeight}px` : undefined,
                maxHeight: isHovered ? '80vh' : undefined,
                overflowY: isHovered ? 'auto' : undefined,
                transform: isHovered
                  ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.10) translateY(${hoverTranslateY}px)`
                  : undefined,
                boxShadow: isHovered
                  ? dynamicBoxShadow
                  : `inset -1px -1px 2px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(0,0,0,0.1)`,
                transformOrigin,
              }}
              onMouseEnter={() => setHoveredId(resource.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                setTilt(prev => ({ ...prev, [resource.id]: { x: 0, y: 0 } }));
              }}
              onMouseMove={e => {
                const card = cardRefs.current[resource.id];
                if (!card) return;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const px = x / rect.width;
                const py = y / rect.height;
                const maxTilt = 6;
                const rotateY = (px - 0.5) * 2 * maxTilt;
                const rotateX = -(py - 0.5) * 2 * maxTilt;
                setTilt(prev => ({ ...prev, [resource.id]: { x: rotateX, y: rotateY } }));
              }}
              onClick={() => {
                handleResourceClick(resource);
                window.open(resource.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                <h3 className={`text-base font-bold text-[#1A1A1A] transition-all duration-300 ease-in-out ${isHovered ? 'line-clamp-none' : 'line-clamp-2'}`}>{resource.title}</h3>
              </div>
              <div
                className={`
                  text-sm leading-relaxed text-[#1A1A1A]/60
                  transition-[max-height] duration-700 ease-[cubic-bezier(.22,1,.36,1)]
                  overflow-hidden
                  ${isHovered ? 'line-clamp-none' : 'line-clamp-4'}
                `}
                style={{
                  maxHeight: isHovered ? '600px' : '96px',
                }}
              >
                {resource.description.split('\n\n')[0]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ), [resources, handleResourceClick, hoveredId, tilt, hoverTranslateY, defaultHeights, isMobile, maxDefaultHeight]);
  
  // 优化骨架屏渲染
  const renderSkeleton = useMemo(() => (
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
    <div className="flex flex-col min-h-0">
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
      <div className="flex flex-col flex-1 min-h-0">
        <div className="relative flex-1">
          {isLoading ? (
            <div className="transition-opacity duration-300 ease-in-out">
              {renderSkeleton}
            </div>
          ) : (
            <div className="transition-opacity duration-300 ease-in-out">
              {renderResources}
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="fixed bottom-0 left-0 right-0 bg-[#E7E7E7] py-2 sm:py-4 border-t border-[#D1D1D1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.1)]">
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
          <div className="h-14 sm:h-28" />
        </div>
      </div>
    </div>
  );
};

// 使用 memo 优化组件重渲染
export default memo(ResourcePreview);