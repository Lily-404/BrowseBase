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
import ModernLoader from '../components/ModernLoader';
// import AdSense from '../components/AdSense';  // 暂时注释，等待 AdSense 审核通过后再启用

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
          <ModernLoader />
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
    </ErrorBoundary>
  );
};

export default Home; 