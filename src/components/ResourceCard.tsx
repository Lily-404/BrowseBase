import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Resource } from '../types/resourcePreview';

export interface ResourceCardProps {
  resource: Resource;
  isMobile: boolean;
  isHovered: boolean;
  rotateX: number;
  rotateY: number;
  hoverTranslateY: number;
  footerHeight: number;
  maxDefaultHeight?: number;
  layoutMode: 'grid' | 'list' | 'single';
  onHover: (id: string) => void;
  onLeave: (id: string) => void;
  onTiltChange: (id: string, rotateX: number, rotateY: number) => void;
  onClick: (resource: Resource) => void;
  onDefaultHeightMeasured: (id: string, height: number) => void;
  setHoverTranslateY: (value: number) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isMobile,
  isHovered,
  rotateX,
  rotateY,
  hoverTranslateY,
  footerHeight,
  maxDefaultHeight,
  layoutMode,
  onHover,
  onLeave,
  onTiltChange,
  onClick,
  onDefaultHeightMeasured,
  setHoverTranslateY,
}) => {
  const isSingle = layoutMode === 'single';
  // single 模式保持可变高度；grid/list 需要固定占位，避免同一行不同内容导致高度不一致
  // 移动端仍保持自适应高度，避免在父容器未定高度时出现拉伸/截断
  const isVariableHeight = isMobile ? true : isSingle;
  const isGrid = layoutMode === 'grid';
  // grid 模式下：悬浮展开用 absolute 悬浮，避免撑大整行从而影响同一行其它卡片的高度
  const shouldOverlayCard = isGrid && isHovered;
  // 非移动端且存在统一占位高度时，按该行像素高度固定默认态，并在 hover 态保留最小高度避免回缩
  const fixedRowHeight = !isVariableHeight && maxDefaultHeight ? maxDefaultHeight : undefined;
  const shouldKeepRowMinHeight = Boolean(fixedRowHeight);
  // 默认态保持视觉等高；hover 态改为仅保留最小高度，允许内容继续向上展开
  const shouldFillDefaultHeight = shouldKeepRowMinHeight && !isHovered;

  const hitAreaRef = useRef<HTMLDivElement | null>(null);
  const visualCardRef = useRef<HTMLDivElement | null>(null);
  const [transformOrigin, setTransformOrigin] = useState<'center center' | 'center bottom'>('center center');

  // 命中区域高度用于占位，避免 hover 时整行布局抖动
  useEffect(() => {
    const el = hitAreaRef.current;
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    onDefaultHeightMeasured(resource.id, height);
    // 只在 resource.id 变化时测一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.id]);

  // 仅当 hover 的卡片，才计算：为了不遮挡底部翻页条，需要整体上移多少
  useEffect(() => {
    if (!isHovered) {
      setTransformOrigin('center center');
      return;
    }

    const visualEl = visualCardRef.current;
    if (!visualEl) return;

    const rect = visualEl.getBoundingClientRect();
    const overBottom = rect.bottom - (window.innerHeight - footerHeight);
    if (overBottom > 0) {
      setHoverTranslateY(-overBottom - 16);
    } else {
      setHoverTranslateY(0);
    }

    if (rect.bottom > window.innerHeight - 40) {
      setTransformOrigin('center bottom');
    } else {
      setTransformOrigin('center center');
    }
  }, [isHovered, footerHeight, resource.id, setHoverTranslateY]);

  const descriptionTop = useMemo(() => resource.description.split('\n\n')[0], [resource.description]);
  const shouldExpandContent = layoutMode === 'grid' && isHovered;
  const titleCollapsedClamp = isSingle ? 'line-clamp-1' : 'line-clamp-2';
  const descCollapsedClamp = isSingle ? 'line-clamp-3' : 'line-clamp-4';

  const dynamicBoxShadow = useMemo(() => {
    if (!isHovered) return undefined;
    const highlightX = -rotateY * 2;
    const highlightY = -rotateX * 2;
    const shadowX = rotateY * 2;
    const shadowY = rotateX * 2;
    return `
      ${shadowX}px ${shadowY}px 40px 0 rgba(0,0,0,0.28),
      inset ${highlightX}px ${highlightY}px 28px rgba(255,255,255,0.95)
    `;
  }, [isHovered, rotateX, rotateY]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const visualEl = visualCardRef.current;
      const hitEl = hitAreaRef.current;
      const rectTarget = visualEl ?? hitEl;
      if (!rectTarget) return;

      const rect = rectTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;
      const maxTilt = 6;
      const nextRotateY = (px - 0.5) * 2 * maxTilt;
      const nextRotateX = -(py - 0.5) * 2 * maxTilt;
      onTiltChange(resource.id, nextRotateX, nextRotateY);
    },
    [onTiltChange, resource.id],
  );

  if (isMobile) {
    return (
      <div key={resource.id} className={`relative w-full ${isVariableHeight ? 'h-auto self-start' : 'h-full'}`}>
        <div
          ref={hitAreaRef}
          className={`relative z-0 ${isVariableHeight ? 'h-auto self-start' : 'h-full'} bg-[#F1F1F1] rounded-lg ${isSingle ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)] cursor-pointer flex flex-col group transition-all duration-300`}
          onClick={() => onClick(resource)}
        >
          <div className="flex justify-between items-start mb-1.5 sm:mb-2">
            <h3 className="text-base font-bold text-[#1A1A1A] transition-all duration-300 ease-in-out line-clamp-none">
              {resource.title}
            </h3>
          </div>
          <div className="text-sm leading-relaxed text-[#1A1A1A]/60 transition-all duration-300 ease-in-out line-clamp-none">
            {descriptionTop}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${isVariableHeight ? 'h-auto self-start' : 'self-start'}`}>
      {/* 命中区域：不做 transform，避免卡片收回时“接住”鼠标导致抖动 */}
      <div
        ref={hitAreaRef}
        className={`relative w-full ${isVariableHeight ? 'h-auto self-start' : 'self-start'}`}
        onMouseEnter={() => onHover(resource.id)}
        onMouseLeave={() => {
          onLeave(resource.id);
        }}
        onMouseMove={handleMouseMove}
        onClick={() => onClick(resource)}
        style={
          fixedRowHeight
            ? {
                height: `${fixedRowHeight}px`,
                minHeight: `${fixedRowHeight}px`,
              }
            : undefined
        }
      >
        <div
          ref={visualCardRef}
          className={`
            relative z-0 ${isHovered ? 'z-20' : ''} w-full h-auto
          rounded-lg ${isSingle ? 'p-2 sm:p-3' : 'p-3 sm:p-4'}
            bg-[#F1F1F1]
            cursor-pointer flex flex-col group transition-all duration-300
            border
            ${isHovered ? 'border-[#F9FAFB]' : 'border-[#E5E7EB] shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]'}
          `}
          style={{
            transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 1s cubic-bezier(.22,1,.36,1)',
            minHeight: shouldKeepRowMinHeight ? `${fixedRowHeight}px` : undefined,
            height: shouldFillDefaultHeight ? `${fixedRowHeight}px` : undefined,
            overflow: 'visible',
            position: shouldOverlayCard ? 'absolute' : undefined,
            top: shouldOverlayCard ? 0 : undefined,
            left: shouldOverlayCard ? 0 : undefined,
            right: shouldOverlayCard ? 0 : undefined,
            transform: isHovered
              ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.10) translateY(${hoverTranslateY}px)`
              : undefined,
            boxShadow: isHovered
              ? dynamicBoxShadow
              : `inset -1px -1px 2px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(0,0,0,0.1)`,
            transformOrigin,
          }}
        >
          <div className="flex justify-between items-start mb-1.5 sm:mb-2">
            <h3
              className={`text-base font-bold text-[#1A1A1A] transition-all duration-300 ease-in-out ${
                shouldExpandContent ? 'line-clamp-none overflow-visible' : `${titleCollapsedClamp} overflow-hidden`
              }`}
            >
              {resource.title}
            </h3>
          </div>

          <div
            className={`text-sm leading-relaxed text-[#1A1A1A]/60 transition-all duration-300 ${
              shouldExpandContent
                ? 'line-clamp-none overflow-visible'
                : `overflow-hidden ${descCollapsedClamp}`
            }`}
          >
            {descriptionTop}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResourceCard);
