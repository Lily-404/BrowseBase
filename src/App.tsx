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
  
  // 筛选资源：根据分类和标签筛选
  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'all' || resource.category === selectedCategory;
    const tagMatch = selectedTags.length === 0 || 
      resource.tags.some(tag => selectedTags.includes(tag));
    return categoryMatch && tagMatch;
  });
  
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // 移除这行，不再清空标签
    // setSelectedTags([]); 
  };
  
  const handleSelectTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  // Get description of the first selected tag
  const selectedTagDescription = selectedTags.length > 0
    ? tags.find(tag => tag.id === selectedTags[0])?.description
    : '';

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 md:px-6 py-4">
      <Header />
      
      <main className="flex flex-col md:flex-row gap-8 flex-grow my-8">
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
          <ResourcePreview resources={filteredResources} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;