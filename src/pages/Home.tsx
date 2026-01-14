import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
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
import styles from '../styles/animations.module.css';
// import AdSense from '../components/AdSense';  // 暂时注释，等待 AdSense 审核通过后再启用
import Icon from '../components/ui/Icon';
import { audioLoader } from '../utils/audioLoader';

// 添加错误类型定义
interface PostgrestError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

const Home: React.FC = () => {
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

  // 优化预加载逻辑
  const preloadNextPage = useCallback(async () => {
    if (currentPage >= totalPages) return;
    
    const nextPage = currentPage + 1;
    const cacheKey = `${nextPage}-${activeFilter.type}-${activeFilter.id}`;
    
    if (cachedData[cacheKey]) return;
    
    try {
      const result = await resourceService.fetchResources(
        nextPage,
        itemsPerPage,
        {
          category: activeFilter.type === 'category' ? activeFilter.id : undefined,
          tag: activeFilter.type === 'tag' ? activeFilter.id : undefined
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
  }, [currentPage, totalPages, activeFilter, cachedData, itemsPerPage]);

  // 优化资源获取逻辑
  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const cacheKey = `${currentPage}-${activeFilter.type}-${activeFilter.id}`;
      
      if (cachedData[cacheKey]) {
        setResources(cachedData[cacheKey].data);
        setTotalCount(cachedData[cacheKey].count);
        setTotalPages(Math.ceil(cachedData[cacheKey].count / itemsPerPage));
        setIsLoading(false);
        
        preloadNextPage();
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
      
      preloadNextPage();
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error; // 让错误边界处理错误
    } finally {
      setIsLoading(false);
      if (isInitialLoading) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 300);
        setTimeout(() => {
          setIsAnimating(false);
        }, 700);
      }
    }
  }, [currentPage, activeFilter, cachedData, itemsPerPage, preloadNextPage, isInitialLoading]);

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
      const allResources = await resourceService.fetchAllResources(
        activeFilter.type === 'category' && activeFilter.id !== 'all'
          ? { category: activeFilter.id }
          : activeFilter.type === 'tag'
          ? { tag: activeFilter.id }
          : undefined
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col relative">
        {(isInitialLoading || isAnimating) && (
          <div className={`fixed inset-0 bg-gradient-to-br from-[#F5F5F5] to-[#F0F0F0] z-50 flex items-center justify-center
            transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isInitialLoading ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`relative flex flex-col items-center gap-12 ${isAnimating ? styles.fadeIn : ''}`}>
              <div className="relative flex flex-col items-center gap-2">
                <h1 className={`text-3xl font-bold bg-gradient-to-r from-[#4D4D4D] to-[#666666] bg-clip-text text-transparent
                  tracking-wider ${isAnimating ? styles.textFade : ''}`}>
                  BrowseBase
                </h1>
                <p className={`text-sm text-[#4D4D4D]/60 tracking-wide ${isAnimating ? styles.textFade : ''}`}>
                  链接, 像盲盒一样简单
                </p>
              </div>
              
              <div className="relative flex flex-col items-center gap-6">
                <div className={`relative w-24 h-24 ${isAnimating ? styles.ringExpand : ''}`}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4D4D4D]/5 via-[#4D4D4D]/10 to-[#4D4D4D]/5 blur-xl animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-[#F8F8F8]
                    shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.05)]"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-transparent
                    border-t-[#4D4D4D] border-r-[#4D4D4D]/20 animate-spin"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-[#F8F8F8]
                    shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.05)]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#4D4D4D] to-[#4D4D4D]/80
                      shadow-[0_0_8px_rgba(77,77,77,0.3)]"></div>
                  </div>
                </div>
                
                <div className="relative flex flex-col items-center gap-2">
                  <p className={`text-[#4D4D4D] text-sm font-medium tracking-wider flex items-center gap-1.5
                    ${isAnimating ? styles.textFade : ''}`}>
                    <span>加载中</span>
                    <span className="flex gap-1">
                      <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce"></span>
                      <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                  </p>
                  <p className={`text-xs text-[#4D4D4D]/40 tracking-wide ${isAnimating ? styles.textFade : ''}`}>
                    正在为您准备精彩内容
                  </p>
                </div>
              </div>
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
                  <div className="relative z-0 h-full bg-white/60 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[260px] border border-[#e0e0e0]/70 backdrop-blur-xl">
                    <div className="w-12 h-12 border-4 border-[#4D4D4D]/20 border-t-[#4D4D4D] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#4D4D4D] text-sm font-medium">加载中...</p>
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
                      再来一次
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
                      进入
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