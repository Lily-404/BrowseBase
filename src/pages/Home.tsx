import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { resourceService } from '../services/resourceService';
import Header from '../components/Header';
import ResourceCategories from '../components/ResourceCategories';
import ResourceTags from '../components/ResourceTags';
import ResourcePreview from '../components/ResourcePreview';
import LoadingState from '../components/LoadingState';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
import { FilterState, CachedData } from '../types/home';

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
    
    // 如果已经有缓存，不需要预加载
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
      
      // 检查缓存
      if (cachedData[cacheKey]) {
        setResources(cachedData[cacheKey].data);
        setTotalCount(cachedData[cacheKey].count);
        setTotalPages(Math.ceil(cachedData[cacheKey].count / itemsPerPage));
        setIsLoading(false);
        
        // 触发下一页预加载
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
      
      // 更新缓存
      setCachedData(prev => ({
        ...prev,
        [cacheKey]: { data: result.data, count: result.count }
      }));
      
      // 触发下一页预加载
      preloadNextPage();
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
      if (isInitialLoading) {
        // 先设置动画状态
        setIsAnimating(true);
        // 等待动画开始后，立即开始准备移除加载界面
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 300); // 动画开始后立即准备移除
        // 等待动画完全结束后再重置动画状态
        setTimeout(() => {
          setIsAnimating(false);
        }, 700); // 确保动画完全结束
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
    <div className="min-h-screen flex flex-col relative">
      {/* 首次加载动画 */}
      {(isInitialLoading || isAnimating) && (
        <div className={`fixed inset-0 bg-gradient-to-br from-[#F5F5F5] to-[#F0F0F0] z-50 flex items-center justify-center
          transition-all duration-500 ease-in-out ${!isInitialLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
          <div className={`relative flex flex-col items-center gap-12 ${isAnimating ? 'animate-[neumorphicFade_0.8s_cubic-bezier(0.33,1,0.68,1)_forwards]' : ''}`}>
            {/* 产品名称 */}
            <div className="relative flex flex-col items-center gap-2">
              <h1 className={`text-3xl font-bold bg-gradient-to-r from-[#4D4D4D] to-[#666666] bg-clip-text text-transparent
                tracking-wider ${isAnimating ? 'animate-[textFade_0.8s_cubic-bezier(0.33,1,0.68,1)_forwards]' : ''}`}>
                BrowseBase
              </h1>
              <p className={`text-sm text-[#4D4D4D]/60 tracking-wide ${isAnimating ? 'animate-[textFade_0.8s_cubic-bezier(0.33,1,0.68,1)_forwards]' : ''}`}>
              链接, 像盲盒一样简单
              </p>
            </div>
            
            {/* 加载动画组 */}
            <div className="relative flex flex-col items-center gap-6">
              {/* 动态圆环 */}
              <div className={`relative w-24 h-24 ${isAnimating ? 'animate-[ringExpand_0.8s_cubic-bezier(0.33,1,0.68,1)_forwards]' : ''}`}>
                {/* 外圈光晕 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4D4D4D]/5 via-[#4D4D4D]/10 to-[#4D4D4D]/5 blur-xl animate-pulse"></div>
                
                {/* 主圆环 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-[#F8F8F8]
                  shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.05)]"></div>
                
                {/* 动态圆环 */}
                <div className="absolute inset-2 rounded-full border-4 border-transparent
                  border-t-[#4D4D4D] border-r-[#4D4D4D]/20 animate-spin"></div>
                
                {/* 内圈装饰 */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-[#F8F8F8]
                  shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.05)]"></div>
                
                {/* 中心点 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#4D4D4D] to-[#4D4D4D]/80
                    shadow-[0_0_8px_rgba(77,77,77,0.3)]"></div>
                </div>
              </div>
              
              {/* 加载文字 */}
              <div className="relative flex flex-col items-center gap-2">
                <p className={`text-[#4D4D4D] text-sm font-medium tracking-wider flex items-center gap-1.5
                  ${isAnimating ? 'animate-[textFade_0.8s_cubic-bezier(0.33,1,0.68,1)_forwards]' : ''}`}>
                  <span>加载中</span>
                  <span className="flex gap-1">
                    <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce"></span>
                    <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </p>
                <p className={`text-xs text-[#4D4D4D]/40 tracking-wide ${isAnimating ? 'animate-[textFade_0.8s_cubic-bezier(0.33,1,0.68,1)_forwards]' : ''}`}>
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
            {/* Left section - Categories and Tags */}
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
            </div>
            
            {/* Right section - Resource Preview */}
            <div className="w-full md:w-2/3">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// 添加自定义动画
const style = document.createElement('style');
style.textContent = `
  @keyframes neumorphicFade {
    0% {
      opacity: 1;
      transform: scale(1);
      filter: brightness(1) blur(0);
    }
    30% {
      opacity: 0.95;
      transform: scale(1.05);
      filter: brightness(1.1) blur(0.5px);
    }
    70% {
      opacity: 0.8;
      transform: scale(1.1);
      filter: brightness(1.2) blur(1px);
    }
    100% {
      opacity: 0;
      transform: scale(1.15);
      filter: brightness(1.3) blur(1.5px);
    }
  }

  @keyframes ringExpand {
    0% {
      opacity: 1;
      transform: scale(1);
      filter: brightness(1) blur(0);
    }
    30% {
      opacity: 0.95;
      transform: scale(1.1);
      filter: brightness(1.1) blur(0.5px);
    }
    70% {
      opacity: 0.8;
      transform: scale(1.2);
      filter: brightness(1.2) blur(1px);
    }
    100% {
      opacity: 0;
      transform: scale(1.25);
      filter: brightness(1.3) blur(1.5px);
    }
  }

  @keyframes textFade {
    0% {
      opacity: 1;
      transform: translateY(0);
      filter: brightness(1) blur(0);
    }
    30% {
      opacity: 0.95;
      transform: translateY(-8px);
      filter: brightness(1.1) blur(0.5px);
    }
    70% {
      opacity: 0.8;
      transform: translateY(-15px);
      filter: brightness(1.2) blur(1px);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
      filter: brightness(1.3) blur(1.5px);
    }
  }
`;
document.head.appendChild(style);

export default Home; 