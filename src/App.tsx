import  { useState } from 'react';
import Header from './components/Header';
import ResourceCategories from './components/ResourceCategories';
import ResourceTags from './components/ResourceTags';
import ResourcePreview from './components/ResourcePreview';

import { categories, tags,  resources } from './data/mockData';

function App() {
  const [activeFilter, setActiveFilter] = useState({ type: 'category', id: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  
  // 筛选资源：根据活动筛选条件筛选
  const filteredResources = resources.filter(resource => {
    if (activeFilter.type === 'category') {
      return activeFilter.id === 'all' || resource.category === activeFilter.id;
    } else if (activeFilter.type === 'tag') {
      return resource.tags.includes(activeFilter.id);
    }
    return true;
  });
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // 处理分类选择
  const handleSelectCategory = (categoryId: string) => {
    setActiveFilter({ type: 'category', id: categoryId });
    setCurrentPage(1);
  };
  
  // 处理标签选择
  const handleSelectTag = (tagId: string) => {
    setActiveFilter({ type: 'tag', id: tagId });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left section - Categories and Tags */}
            <div className="w-full md:w-2/5">
              <ResourceCategories 
                categories={[{ id: 'all', name: 'all' }, ...categories]}
                selectedCategory={activeFilter.type === 'category' ? activeFilter.id : ''}
                onSelectCategory={handleSelectCategory}
              />
              
              <ResourceTags 
                tags={tags}
                selectedTags={activeFilter.type === 'tag' ? [activeFilter.id] : []}
                onSelectTag={handleSelectTag}
              />
            </div>
            
            {/* Right section - Resource Preview */}
            <div className="w-full md:w-3/5">
              <ResourcePreview 
                resources={filteredResources} 
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;