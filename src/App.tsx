import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { resourceService } from './services/resourceService';
import Header from './components/Header';
import ResourceCategories from './components/ResourceCategories';
import ResourceTags from './components/ResourceTags';
import ResourcePreview from './components/ResourcePreview';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { supabase } from './lib/supabase';
import { categories, tags } from './data/mockData';

// 主页组件
const Home = () => {
  const [resources, setResources] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ type: 'category', id: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const { data } = await resourceService.fetchResources(1, 1000); // 获取所有资源用于前端过滤
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }
  
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
};

// 路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('认证检查失败:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;