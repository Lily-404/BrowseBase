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
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const itemsPerPage = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [cachedData, setCachedData] = useState<Record<string, CachedData>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [preloadedData, setPreloadedData] = useState<{ data: Resource[]; count: number }>({ data: [], count: 0 });
  
  // 预加载下一页数据
  const preloadNextPage = async () => {
    if (currentPage >= totalPages) return;
    
    try {
      const nextPage = currentPage + 1;
      const result = await resourceService.fetchResources(
        activeFilter.type === 'category' ? activeFilter.id : undefined,
        activeFilter.type === 'tag' ? [activeFilter.id] : [],
        nextPage,
        itemsPerPage
      );
      
      // 只有当有数据时才预加载
      if (result.data.length > 0) {
        setPreloadedData(result);
      }
    } catch (error) {
      // 只在非范围错误时记录错误
      if (error.code !== 'PGRST103') {
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
        setTotalPages(Math.ceil(cachedData[cacheKey].count / itemsPerPage));
        setIsLoading(false);
        return;
      }
      
      const { data, count } = await resourceService.fetchResources(
        currentPage,
        itemsPerPage,
        {
          category: activeFilter.type === 'category' ? activeFilter.id : undefined,
          tag: activeFilter.type === 'tag' ? [activeFilter.id] : undefined
        }
      );
      
      setResources(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil(count / itemsPerPage));
      
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
      preloadNextPage();
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

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= Math.ceil(totalCount / itemsPerPage)) {
      setCurrentPage(page);
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
                totalPages={Math.ceil(totalCount / itemsPerPage)}
                totalCount={totalCount}
                isLoading={isLoading || isInitialLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 