import React, { useState, useEffect, Suspense } from 'react';
import { resourceService } from '../services/resourceService';
import Header from '../components/Header';
import ResourceCategories from '../components/ResourceCategories';
import ResourceTags from '../components/ResourceTags';
import ResourcePreview from '../components/ResourcePreview';
import LoadingState from '../components/LoadingState';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
import { FilterState, CachedData } from '../types/home';

const Home: React.FC = () => {
const [resources, setResources] = useState<Resource[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterState>({ type: 'category', id: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [cachedData, setCachedData] = useState<Record<string, CachedData>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // 预加载下一页数据
  const preloadNextPage = async (nextPage: number) => {
    const preloadCacheKey = `${nextPage}-${activeFilter.type}-${activeFilter.id}`;
    
    if (!cachedData[preloadCacheKey]) {
      try {
        const { data, count } = await resourceService.fetchResources(
          nextPage,
          itemsPerPage,
          {
            category: activeFilter.type === 'category' ? activeFilter.id : undefined,
            tag: activeFilter.type === 'tag' ? activeFilter.id : undefined
          }
        );
        
        setCachedData(prev => ({
          ...prev,
          [preloadCacheKey]: { data, count }
        }));
      } catch (error) {
        console.error('Error preloading next page:', error);
      }
    }
  };
  
  async function fetchResources(): Promise<void> {
    try {
      setIsLoading(true);
      
      const cacheKey = `${currentPage}-${activeFilter.type}-${activeFilter.id}`;
      
      if (cachedData[cacheKey]) {
        setResources(cachedData[cacheKey].data);
        setTotalCount(cachedData[cacheKey].count);
        setIsLoading(false);
        return;
      }
      
      const { data, count } = await resourceService.fetchResources(
        currentPage,
        itemsPerPage,
        {
          category: activeFilter.type === 'category' ? activeFilter.id : undefined,
          tag: activeFilter.type === 'tag' ? activeFilter.id : undefined
        }
      );
      
      setResources(data || []);
      setTotalCount(count || 0);
      
      setCachedData(prev => ({
        ...prev,
        [cacheKey]: { data, count }
      }));
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }
  
  useEffect(() => {
    fetchResources();
    
    // 预加载下一页
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      preloadNextPage(currentPage + 1);
    }
  }, [currentPage, activeFilter, fetchResources, totalCount, preloadNextPage]);

  const handleNextPage = (): void => {
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleSelectCategory = (categoryId: string): void => {
    setActiveFilter({ type: 'category', id: categoryId });
    setCurrentPage(1);
  };
  
  const handleSelectTag = (tagId: string): void => {
    setActiveFilter({ type: 'tag', id: tagId });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                />
              </Suspense>
              
              <Suspense fallback={<LoadingState message="加载标签..." />}>
                <ResourceTags 
                  tags={tags}
                  selectedTags={activeFilter.type === 'tag' ? [activeFilter.id] : []}
                  onSelectTag={handleSelectTag}
                />
              </Suspense>
            </div>
            
            {/* Right section - Resource Preview */}
            <div className="w-full md:w-2/3">
              {(isInitialLoading || isLoading) ? (
                <div className="flex flex-col h-full">
                  <div className="flex flex-row justify-between relative items-center gap-2 mb-3">
                    <h2 className="text-base uppercase text-[#4D4D4D]">资源</h2>
                    <div className="flex flex-1 h-[1px] bg-foreground/8" />
                  </div>
                  <div className="flex flex-1 flex-col rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {[...Array(8)].map((_, index) => (
                        <div key={index} 
                          className="bg-[#F1F1F1] rounded-lg p-4 animate-pulse
                          shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]"
                          style={{ 
                            '--animation-delay': `${index * 0.05}s`,
                            animationDelay: 'var(--animation-delay)'
                          } as React.CSSProperties}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                              <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                            </div>
                            <div className="w-7 h-7 bg-gray-200 rounded-lg ml-4 flex-shrink-0"></div>
                          </div>
                          <div className="space-y-2 mt-4">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <ResourcePreview 
                  resources={resources}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                  totalPages={Math.ceil(totalCount / itemsPerPage)}
                  totalCount={totalCount}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 