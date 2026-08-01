import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { resourceService } from '../services/resourceService';
import Header from '../components/Header';
import ResourceCategories from '../components/ResourceCategories';
import ResourceTags from '../components/ResourceTags';
import ResourcePreview from '../components/ResourcePreview';
import LoadingState from '../components/LoadingState';
import ErrorBoundary from '../components/ErrorBoundary';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
import { FilterState, CachedData } from '../types/home';
// import AdSense from '../components/AdSense';  // 暂时注释，等待 AdSense 审核通过后再启用
import Icon from '../components/ui/Icon';
import WaveformLoader from '../components/WaveformLoader';
import PixelLoader from '../components/ui/PixelLoader';
import { audioLoader } from '../utils/audioLoader';
import '../styles/nothing.css';

// 添加错误类型定义
interface PostgrestError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const layoutMode = 'grid' as const;

  const [resources, setResources] = useState<Resource[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterState>({ type: 'category', id: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const itemsPerPage = 12;
  const [isLoading, setIsLoading] = useState(false);
  const [cachedData, setCachedData] = useState<Record<string, CachedData>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBlindBoxModal, setShowBlindBoxModal] = useState(false);
  const [blindBoxIndex, setBlindBoxIndex] = useState<number | null>(null);
  // 盲盒专用资源池
  const [blindBoxResources, setBlindBoxResources] = useState<Resource[]>([]);
  // 盲盒加载状态
  const [isBlindBoxLoading, setIsBlindBoxLoading] = useState(false);
  // 盲盒资源池缓存（基于过滤条件）
  const blindBoxCacheRef = useRef<Record<string, Resource[]>>({});
  // 用 ref 读缓存，避免 setCachedData 触发 fetch 依赖变化 → 重复请求
  const cachedDataRef = useRef(cachedData);
  cachedDataRef.current = cachedData;
  const totalPagesRef = useRef(totalPages);
  totalPagesRef.current = totalPages;
  const isInitialLoadingRef = useRef(isInitialLoading);
  isInitialLoadingRef.current = isInitialLoading;

  // 优化预加载逻辑
  const preloadNextPage = useCallback(async (page: number, filter: FilterState) => {
    const pages = totalPagesRef.current;
    if (page >= pages) return;

    const nextPage = page + 1;
    const cacheKey = `${nextPage}-${filter.type}-${filter.id}`;

    if (cachedDataRef.current[cacheKey]) return;

    try {
      const result = await resourceService.fetchResources(
        nextPage,
        itemsPerPage,
        {
          category: filter.type === 'category' ? filter.id : undefined,
          tag: filter.type === 'tag' ? filter.id : undefined
        }
      );

      if (result.data.length > 0) {
        setCachedData(prev => ({
          ...prev,
          [cacheKey]: { data: result.data, count: result.count }
        }));
      }
    } catch (error: unknown) {
      const pgError = error as PostgrestError;
      if (pgError.code !== 'PGRST103') {
        console.error('Error preloading next page:', pgError);
      }
    }
  }, [itemsPerPage]);

  // 优化资源获取逻辑
  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true);

      const cacheKey = `${currentPage}-${activeFilter.type}-${activeFilter.id}`;
      const hit = cachedDataRef.current[cacheKey];

      if (hit) {
        setResources(hit.data);
        setTotalCount(hit.count);
        setTotalPages(Math.ceil(hit.count / itemsPerPage));
        void preloadNextPage(currentPage, activeFilter);
        return;
      }

      const result = await resourceService.fetchResources(
        currentPage,
        itemsPerPage,
        {
          category: activeFilter.type === 'category' ? activeFilter.id : undefined,
          tag: activeFilter.type === 'tag' ? activeFilter.id : undefined
        }
      );

      setResources(result.data || []);
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil(result.count / itemsPerPage));

      setCachedData(prev => ({
        ...prev,
        [cacheKey]: { data: result.data, count: result.count }
      }));

      void preloadNextPage(currentPage, activeFilter);
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error; // 让错误边界处理错误
    } finally {
      setIsLoading(false);
      // 数据就绪后立刻结束首屏遮罩，只保留短暂淡出
      if (isInitialLoadingRef.current) {
        setIsAnimating(true);
        setIsInitialLoading(false);
        window.setTimeout(() => {
          setIsAnimating(false);
        }, 280);
      }
    }
  }, [currentPage, activeFilter, itemsPerPage, preloadNextPage]);

  // 处理分类选择
  const handleSelectCategory = useCallback((categoryId: string) => {
    setActiveFilter({ type: 'category', id: categoryId });
    setCurrentPage(1);
  }, []);

  // 处理标签选择
  const handleSelectTag = useCallback((tagId: string) => {
    setActiveFilter({ type: 'tag', id: tagId });
    setCurrentPage(1);
  }, []);

  // 处理页面变化
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 处理下一页
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  // 处理上一页
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // 打开盲盒弹窗
  const handleOpenBlindBox = useCallback(async () => {
    // 生成缓存键
    const cacheKey = `${activeFilter.type}-${activeFilter.id}`;
    
    // 检查本地缓存
    if (blindBoxCacheRef.current[cacheKey] && blindBoxCacheRef.current[cacheKey].length > 0) {
      const cachedResources = blindBoxCacheRef.current[cacheKey];
      setBlindBoxResources(cachedResources);
      audioLoader.playSound('/to.wav');
      setShowBlindBoxModal(true);
      setBlindBoxIndex(Math.floor(Math.random() * cachedResources.length));
      return;
    }
    
    // 如果没有缓存，显示加载状态并获取资源
    setIsBlindBoxLoading(true);
    try {
      // 为盲盒建立资源池时增加结果上限，避免数据量大导致一次性拉取过慢
      const allResources = await resourceService.fetchAllResources(
        activeFilter.type === 'category' && activeFilter.id !== 'all'
          ? { category: activeFilter.id }
          : activeFilter.type === 'tag'
          ? { tag: activeFilter.id }
          : undefined,
        { limit: 200 }
      );
      
      if (allResources.length === 0) {
        setIsBlindBoxLoading(false);
        return;
      }
      
      // 缓存结果
      blindBoxCacheRef.current[cacheKey] = allResources;
      
      setBlindBoxResources(allResources);
      audioLoader.playSound('/to.wav');
      setShowBlindBoxModal(true);
      setBlindBoxIndex(Math.floor(Math.random() * allResources.length));
    } catch (error) {
      console.error('Error fetching blind box resources:', error);
    } finally {
      setIsBlindBoxLoading(false);
    }
  }, [activeFilter]);

  // 关闭盲盒弹窗
  const handleCloseBlindBox = useCallback(() => {
    setShowBlindBoxModal(false);
    setBlindBoxIndex(null);
  }, []);

  // 再来一次/下一张
  const handleNextBlindBox = useCallback(() => {
    if (blindBoxResources.length === 0) return;
    audioLoader.playSound('/to.wav');
    let nextIndex = Math.floor(Math.random() * blindBoxResources.length);
    // 保证不和当前重复
    if (blindBoxResources.length > 1 && nextIndex === blindBoxIndex) {
      nextIndex = (nextIndex + 1) % blindBoxResources.length;
    }
    setBlindBoxIndex(nextIndex);
  }, [blindBoxResources, blindBoxIndex]);

  // Tinder风格左右滑动
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (blindBoxResources.length === 0 || blindBoxIndex === null) return;
    audioLoader.playSound('/to.wav');
    let nextIndex = blindBoxIndex + (direction === 'right' ? 1 : -1);
    if (nextIndex < 0) nextIndex = blindBoxResources.length - 1;
    if (nextIndex >= blindBoxResources.length) nextIndex = 0;
    setBlindBoxIndex(nextIndex);
  }, [blindBoxResources, blindBoxIndex]);

  // 监听页面和过滤条件变化
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // 首屏结束后再预热音频，避免和首请求抢带宽
  useEffect(() => {
    if (isInitialLoading) return;

    const idle =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 800);

    const id = idle(() => {
      void audioLoader.waitForLoad().catch((error) => {
        console.warn('Failed to preheat audio:', error);
      });
    });

    return () => {
      if ('cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, [isInitialLoading]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col relative">
        {(isInitialLoading || isAnimating) && (
          <div
            className={`nd nd-light nd-dot-grid fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${
              !isInitialLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            role="status"
            aria-live="polite"
            aria-busy={isInitialLoading}
          >
            <div className="flex flex-col items-center gap-6 px-6">
              <div className="text-center">
                <p className="nd-label mb-2">BrowseBase</p>
                <h1 className="nd-heading text-[28px] tracking-tight">信息，而非噪音</h1>
              </div>
              <PixelLoader label="加载中" variant="Drive" />
            </div>
          </div>
        )}
        
        <Header onBlindBoxClick={handleOpenBlindBox} />
        <main className="flex-grow">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
              <div className="w-full md:w-1/3 space-y-4">
                <Suspense fallback={<LoadingState message="加载分类..." />}>
                  <ResourceCategories 
                    categories={[{ id: 'all', name: 'all' }, ...categories]}
                    selectedCategory={activeFilter.type === 'category' ? activeFilter.id : ''}
                    onSelectCategory={handleSelectCategory}
                    isPageSelectorOpen={isPageSelectorOpen}
                  />
                </Suspense>
                
                <Suspense fallback={<LoadingState message="加载标签..." />}>
                  <ResourceTags 
                    tags={tags}
                    selectedTags={activeFilter.type === 'tag' ? [activeFilter.id] : []}
                    onSelectTag={handleSelectTag}
                    isPageSelectorOpen={isPageSelectorOpen}
                  />
                </Suspense>

                {/* 桌面端广告 - 暂时注释，等待 AdSense 审核通过后再启用
                <div className="hidden md:block w-full mt-8 p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
                  <AdSense
                    slot="ca-pub-2452864169775781"
                    format="auto"
                    responsive={true}
                    style={{ display: 'block', minHeight: '100px' }}
                  />
                </div>
                */}
              </div>
              
              <div className="w-full md:w-2/3">
                <div className="flex flex-col">
                  <ResourcePreview 
                    resources={resources}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onNextPage={handleNextPage}
                    onPrevPage={handlePrevPage}
                    onPageChange={handlePageChange}
                    onPageSelectorOpenChange={setIsPageSelectorOpen}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    layoutMode={layoutMode}
                    isLoading={isLoading && !isInitialLoading}
                  />

                  {/* 移动端广告 - 暂时注释，等待 AdSense 审核通过后再启用
                  <div className="md:hidden w-full mb-20 p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm -mt-4">
                    <AdSense
                      slot="ca-pub-2452864169775781"
                      format="auto"
                      responsive={true}
                      style={{ display: 'block', minHeight: '250px' }}
                    />
                  </div>
                  */}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {(showBlindBoxModal || isBlindBoxLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[6px] animate-fade-in">
          <div className="absolute inset-0" onClick={handleCloseBlindBox} />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-[90vw] max-w-md mx-auto">
              {isBlindBoxLoading ? (
                // 加载状态 - 简单的加载圈圈
                <div className="relative w-full h-full select-none">
                  <div className="relative z-0 h-full bg-white/60 rounded-2xl p-6 shadow-2xl flex items-center justify-center min-h-[260px] border border-[#e0e0e0]/70 backdrop-blur-xl">
                    <WaveformLoader className="scale-125" />
                  </div>
                  {/* 保留底部按钮占位，避免加载完成切换时跳动 */}
                  <div className="flex justify-between mt-4 items-center opacity-60 cursor-not-allowed pointer-events-none">
                    <button
                      disabled
                      className="rounded-full p-2 bg-white/60 border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                      style={{ boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                    >
                      <Icon name="ChevronLeft" size={24} className="text-[#222]" />
                    </button>
                    <div className="flex gap-3">
                      <button
                        disabled
                        className="inline-flex items-center gap-1 px-5 py-1.5 rounded-full bg-white/60 text-[#222] font-semibold text-base cursor-pointer select-none border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                        style={{ fontSize: '15px', fontWeight: 600, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                      >
                        {t('blindBox.nextOne')}
                      </button>
                      <button
                        disabled
                        className="inline-flex items-center gap-1 px-5 py-1.5 rounded-full bg-white/60 text-[#222] font-semibold text-base cursor-pointer select-none border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                        style={{ fontSize: '15px', fontWeight: 600, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                      >
                        <Icon name="ExternalLink" size={20} />
                        {t('blindBox.enter')}
                      </button>
                    </div>
                    <button
                      disabled
                      className="rounded-full p-2 bg-white/60 border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                      style={{ boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                    >
                      <Icon name="ChevronRight" size={24} className="text-[#222]" />
                    </button>
                  </div>
                </div>
              ) : blindBoxIndex !== null && blindBoxResources[blindBoxIndex] ? (
                // 卡片内容复用
                <div className="relative w-full h-full select-none">
                <div
                  className="relative z-0 h-full bg-white/60 rounded-2xl p-6 shadow-2xl cursor-pointer flex flex-col group transition-all duration-300 min-h-[260px] border border-[#e0e0e0]/70 backdrop-blur-xl"
                  style={{ boxShadow: '0 8px 32px 0 rgba(60,60,60,0.10), 0 1.5px 8px 0 rgba(77,77,77,0.06)' }}
                  onClick={() => window.open(blindBoxResources[blindBoxIndex].url, '_blank', 'noopener,noreferrer')}
                >
                  {/* 封面图（如有） */}
                  {blindBoxResources[blindBoxIndex].cover && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-[#eaeaea] flex items-center justify-center">
                      <img
                        src={blindBoxResources[blindBoxIndex].cover}
                        alt="cover"
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 mb-2">
                    <h3 className="text-xl font-bold text-[#1A1A1A] line-clamp-none drop-shadow-sm">
                      {blindBoxResources[blindBoxIndex].title}
                    </h3>
                  </div>
                  {/* 左下角标签 */}
                  <div className="absolute left-4 bottom-4 flex flex-wrap gap-2 z-10">
                    {/* 分类标签 */}
                    {(() => {
                      const cat = categories.find(c => c.id === blindBoxResources[blindBoxIndex].category);
                      return cat ? (
                        <span key={cat.id} className="inline-block px-2 py-0.5 rounded-full bg-[#222]/10 text-[#222] text-xs font-semibold border border-[#222]/20 select-none">{cat.name}</span>
                      ) : null;
                    })()}
                    {/* 资源标签 */}
                    {blindBoxResources[blindBoxIndex].tags?.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span key={tag.id} className="inline-block px-2 py-0.5 rounded-full bg-[#444]/10 text-[#333] text-xs font-semibold border border-[#444]/15 select-none">{tag.name}</span>
                      ) : null;
                    })}
                  </div>
                  <div className="text-base leading-relaxed text-[#1A1A1A]/70 line-clamp-none mb-4">
                    {blindBoxResources[blindBoxIndex].description.split('\n\n')[0]}
                  </div>
                </div>
                {/* Tinder风格左右滑动按钮 */}
                <div className="flex justify-between mt-4 items-center">
                  <button
                    onClick={() => handleSwipe('left')}
                    className="rounded-full p-2 bg-white/60 border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                    style={{ boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                  >
                    <Icon name="ChevronLeft" size={24} className="text-[#222]" />
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleNextBlindBox}
                      className="inline-flex items-center gap-1 px-5 py-1.5 rounded-full bg-white/60 text-[#222] font-semibold text-base cursor-pointer select-none border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                      style={{ fontSize: '15px', fontWeight: 600, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                    >
                      {t('blindBox.nextOne')}
                    </button>
                    <button
                      className="inline-flex items-center gap-1 px-5 py-1.5 rounded-full bg-white/60 text-[#222] font-semibold text-base cursor-pointer select-none border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                      style={{ fontSize: '15px', fontWeight: 600, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        audioLoader.playSound('/to.wav');
                        window.open(blindBoxResources[blindBoxIndex].url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Icon name="ExternalLink" size={20} />
                      {t('blindBox.enter')}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSwipe('right')}
                    className="rounded-full p-2 bg-white/60 border border-[#e0e0e0]/70 shadow-md backdrop-blur-md transition-all hover:bg-white/80"
                    style={{ boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }}
                  >
                    <Icon name="ChevronRight" size={24} className="text-[#222]" />
                  </button>
                </div>
              </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default Home; 
