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
import React from 'react';

// 主页组件
const Home = () => {
  const [resources, setResources] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ type: 'category', id: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [cachedData, setCachedData] = useState<Record<string, any>>({});
  
  async function fetchResources() {
    try {
      setIsLoading(true);
      
      // 生成缓存键
      const cacheKey = `${currentPage}-${activeFilter.type}-${activeFilter.id}`;
      
      // 检查缓存中是否有数据
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
      
      // 更新状态
      setResources(data || []);
      setTotalCount(count || 0);
      
      // 更新缓存
      setCachedData(prev => ({
        ...prev,
        [cacheKey]: { data, count }
      }));
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    fetchResources();
    
    // 预加载下一页
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      const nextPage = currentPage + 1;
      const preloadCacheKey = `${nextPage}-${activeFilter.type}-${activeFilter.id}`;
      
      // 如果缓存中没有下一页数据，则预加载
      if (!cachedData[preloadCacheKey]) {
        resourceService.fetchResources(
          nextPage,
          itemsPerPage,
          {
            category: activeFilter.type === 'category' ? activeFilter.id : undefined,
            tag: activeFilter.type === 'tag' ? activeFilter.id : undefined
          }
        ).then(({ data, count }) => {
          // 更新缓存
          setCachedData(prev => ({
            ...prev,
            [preloadCacheKey]: { data, count }
          }));
        }).catch(error => {
          console.error('Error preloading next page:', error);
        });
      }
    }
  }, [currentPage, activeFilter]); // 依赖项中包含分页和筛选条件

  const handleNextPage = () => {
    console.log('Next page clicked, current:', currentPage, 'max:', Math.ceil(totalCount / itemsPerPage));
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    console.log('Prev page clicked, current:', currentPage);
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
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
              {isLoading ? (
                <ResourcePreview 
                  resources={[]}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                  totalPages={Math.ceil(totalCount / itemsPerPage)}
                />
              ) : (
                <ResourcePreview 
                  resources={isLoading ? [] : resources}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                  totalPages={Math.ceil(totalCount / itemsPerPage)}
                />
              )}
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem('userSession'); // 确保登出时清除本地存储
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem('userSession');
        return;
      }

      // 获取用户信息和角色
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      const isAdminUser = profile?.role === 'admin';
      
      setIsAuthenticated(true);
      setIsAdmin(isAdminUser);
      
      // 更新本地存储
      localStorage.setItem('userSession', JSON.stringify({
        isAuthenticated: true,
        isAdmin: isAdminUser
      }));
      
    } catch (error) {
      console.error('认证检查失败:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      localStorage.removeItem('userSession');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium text-gray-700">验证身份中</span>
            <span className="text-sm text-gray-500">请稍候...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
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
        <Route 
          path="/management-console" 
          element={
            <Navigate to="/login" replace />
          } 
        />
        {/* 添加通配符路由来处理所有未授权的访问 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;