import React, { useEffect, useCallback, memo, useMemo, useState, useRef } from 'react';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../utils/analytics';
import { Resource } from '../types/resourcePreview';
import { audioLoader } from '../utils/audioLoader';
import ResourceCard from './ResourceCard';

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
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tilt, setTilt] = useState<Record<string, { x: number; y: number }>>({});
  const [hoverTranslateY, setHoverTranslateY] = useState(0);

  const defaultHeights = useRef<Record<string, number>>({});
  const [maxDefaultHeight, setMaxDefaultHeight] = useState<number | undefined>(undefined);

  // Footer高度自适应
  const getFooterHeight = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      return 112; // h-28
    }
    return 56; // h-14
  }, []);

  const [footerHeight, setFooterHeight] = useState(getFooterHeight());
  useEffect(() => {
    const handleResize = () => setFooterHeight(getFooterHeight());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getFooterHeight]);

  // 判断是否为移动端（动态监听）
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasTouch = navigator.maxTouchPoints > 0;
    return window.innerWidth < 768 || hasTouch;
  });
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = navigator.maxTouchPoints > 0;
      setIsMobile(window.innerWidth < 768 || hasTouch);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 资源列表变更时，重置高度/hover 状态
  useEffect(() => {
    defaultHeights.current = {};
    setMaxDefaultHeight(undefined);
    setTilt({});
    setHoveredId(null);
    setHoverTranslateY(0);
  }, [resources]);

  const handleDefaultHeightMeasured = useCallback((id: string, height: number) => {
    // 只记录第一次测到的高度
    if (defaultHeights.current[id] !== undefined) return;
    defaultHeights.current[id] = height;
    const heights = Object.values(defaultHeights.current);
    if (heights.length > 0) setMaxDefaultHeight(Math.max(...heights));
  }, []);

  const handleResourceClick = useCallback((resource: Resource) => {
    // 不阻塞点击，直接尝试播放（内部会按需懒加载，并做超时保护）
    void audioLoader.playSound('/to.wav');
    trackEvent('Resource', 'To', resource.title);
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (onPageChange) onPageChange(page);
    },
    [onPageChange],
  );

  const handleHover = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleLeave = useCallback((id: string) => {
    setHoveredId((prev) => (prev === id ? null : prev));
    setTilt((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));
    setHoverTranslateY(0);
  }, []);

  const handleTiltChange = useCallback((id: string, rotateX: number, rotateY: number) => {
    setTilt((prev) => ({ ...prev, [id]: { x: rotateX, y: rotateY } }));
  }, []);

  const setHoverTranslateYValue = useCallback((value: number) => setHoverTranslateY(value), []);

  const renderResources = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-8 relative">
        {resources.map((resource) => {
          const isHovered = hoveredId === resource.id;
          const rotateX = isHovered && tilt[resource.id] ? tilt[resource.id].x : 0;
          const rotateY = isHovered && tilt[resource.id] ? tilt[resource.id].y : 0;
          // 关键：非 hovered 卡片不接收 hoverTranslateY 新值，避免整行重渲染
          const translateY = isHovered ? hoverTranslateY : 0;

          return (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isMobile={isMobile}
              isHovered={isHovered}
              rotateX={rotateX}
              rotateY={rotateY}
              hoverTranslateY={translateY}
              footerHeight={footerHeight}
              maxDefaultHeight={maxDefaultHeight}
              onHover={handleHover}
              onLeave={handleLeave}
              onTiltChange={handleTiltChange}
              onClick={handleResourceClick}
              onDefaultHeightMeasured={handleDefaultHeightMeasured}
              setHoverTranslateY={setHoverTranslateYValue}
            />
          );
        })}
      </div>
    ),
    [
      resources,
      isMobile,
      hoveredId,
      tilt,
      hoverTranslateY,
      footerHeight,
      maxDefaultHeight,
      handleHover,
      handleLeave,
      handleTiltChange,
      handleResourceClick,
      handleDefaultHeightMeasured,
      setHoverTranslateYValue,
    ],
  );

  // 优化骨架屏渲染
  const renderSkeleton = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#F1F1F1] rounded-lg p-3 sm:p-4 animate-pulse shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]"
            style={{
              '--animation-delay': `${index * 0.05}s`,
              animationDelay: 'var(--animation-delay)',
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
    ),
    [],
  );

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex flex-row justify-between relative gap-2 mb-3">
        <div className="flex items-end">
          <h2 className="text-base font-medium text-[#4D4D4D]">{t('resourcePreview.title')}</h2>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-sm text-[#4D4D4D]/60">{t('resourcePreview.totalResources', { count: totalCount })}</span>
          <div className="flex flex-1 h-[1px] bg-foreground/8" />
        </div>
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="relative flex-1">
          {isLoading ? (
            <div className="transition-opacity duration-300 ease-in-out">{renderSkeleton}</div>
          ) : (
            <div className="transition-opacity duration-300 ease-in-out">{renderResources}</div>
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

export default memo(ResourcePreview);

