import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import About from './pages/About';
import { initGA, trackPageView } from './utils/analytics';
import { audioLoader } from './utils/audioLoader';

// 初始化 Google Analytics
initGA('G-W0ZSDCR0XB');

// 在应用启动时立即开始预加载所有音效
// 这样可以在后台加载音效，避免首次使用时延迟
audioLoader.waitForLoad().catch(error => {
  console.warn('Failed to preload audio files:', error);
});

// 路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    // Track page view when location changes
    trackPageView(location.pathname);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        checkAuth();
        // 清理 URL 中的认证参数
        if (location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem('userSession');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

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
        <div className="bg-white/90 p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4">
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
        <Route path="/about" element={<About />} />
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