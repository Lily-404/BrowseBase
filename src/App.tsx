import React, { useState } from 'react';
import Header from './components/Header';
import ResourceCategories from './components/ResourceCategories';
import ResourceTags from './components/ResourceTags';
import DescriptionBox from './components/DescriptionBox';
import ResourcePreview from './components/ResourcePreview';
import Footer from './components/Footer';
import { categories, tags, previewContent, resources } from './data/mockData';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 筛选资源：根据分类和标签筛选
  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'all' || resource.category === selectedCategory;
    const tagMatch = selectedTags.length === 0 || 
      resource.tags.some(tag => selectedTags.includes(tag));
    return categoryMatch && tagMatch;
  });
  
  const itemsPerPage = 10; // 修改这里的值从8改为10
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // 当筛选条件改变时，重置页码到第一页
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };
  
  const handleSelectTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
    setCurrentPage(1);
  };
  
  // Get description of the first selected tag
  const selectedTagDescription = selectedTags.length > 0
    ? tags.find(tag => tag.id === selectedTags[0])?.description
    : '';

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
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
              
              <ResourceTags 
                tags={tags}
                selectedTags={selectedTags}
                onSelectTag={handleSelectTag}
              />
              
              {selectedTagDescription && (
                <DescriptionBox description={selectedTagDescription} />
              )}
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