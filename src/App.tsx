import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import About from './pages/About';
import { initGA, trackPageView } from './utils/analytics';
import './styles/nothing.css';
import PixelLoader from './components/ui/PixelLoader';
import { Toaster } from './components/ui/Toaster';
import { loadNothingFonts } from './utils/loadNothingFonts';


initGA('G-W0ZSDCR0XB');

// 路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [theme] = useState<'dark' | 'light'>(() => {
    try {
      const v = localStorage.getItem('adminNothingTheme');
      if (v === 'light' || v === 'dark') return v;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    loadNothingFonts();
  }, []);

  // 首次挂载时执行鉴权并注册 auth 事件
  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        checkAuth();
        // 清理 URL 中的认证参数
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
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
  }, []);

  // 路由变化时仅做埋点
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

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
      <div className={`nd ${theme === 'light' ? 'nd-light' : ''} nd-dot-grid`}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <p className="nd-label mb-6">BrowseBase</p>
          <p className="nd-heading mb-6">身份验证</p>
          <PixelLoader label="验证中" variant="Drive" />
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
      <Toaster />
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