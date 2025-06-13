import React, { useState, useEffect, Suspense, useCallback } from 'react';
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
import AdSense from '../components/AdSense';

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
        
        <Header />
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

                {/* 桌面端广告 */}
                <div className="hidden md:block w-full mt-8 p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
                  <AdSense
                    slot="ca-pub-2452864169775781"
                    format="auto"
                    responsive={true}
                    style={{ display: 'block', minHeight: '100px' }}
                  />
                </div>
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

                  {/* 移动端广告 - 直接跟在资源列表后面 */}
                  <div className="md:hidden w-full mb-20 p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm -mt-4">
                    <AdSense
                      slot="ca-pub-2452864169775781"
                      format="auto"
                      responsive={true}
                      style={{ display: 'block', minHeight: '250px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Home; 