import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import React from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (loginMethod === 'password') {
        console.log('尝试登录:', email);
        
        // 首先验证用户是否存在且是管理员
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, password')
          .eq('email', email)
          .single();

        if (profileError) {
          console.error('Profile查询错误:', profileError);
          throw new Error('用户不存在');
        }
        
        if (!profile) {
          throw new Error('未找到用户信息');
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, profile.password);
        
        if (!isPasswordValid) {
          throw new Error('邮箱或密码错误');
        }

        if (profile.role !== 'admin') {
          throw new Error('您没有管理员权限');
        }

        // 使用邮箱登录方式创建 Supabase 会话
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false, // 不创建新用户
          }
        });

        if (signInError) {
          throw signInError;
        }

        // 等待会话创建完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 登录成功，直接跳转到管理页面
        navigate('/admin', { replace: true });
        return;
      } else {
        // Magic link 登录逻辑保持不变
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + '/admin'
          }
        });
      
        if (magicLinkError) throw magicLinkError;
      
        setError('登录链接已发送到您的邮箱，请查收！');
        setEmail('');
      }
    } catch (error: unknown) {
      setError((error as { message?: string }).message || '登录失败，请重试');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
}

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/admin',  // 修正URI，移除多余的逗号
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) throw error;
    } catch (error: unknown) {
      setError((error as { message?: string }).message || '登录失败，请重试');
      console.error('Google登录错误:', error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">管理员登录</h2>
          <p className="text-gray-600">请使用管理员账号登录</p>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setLoginMethod('password')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
              loginMethod === 'password'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            密码登录
          </button>
          <button
            onClick={() => setLoginMethod('magic')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
              loginMethod === 'magic'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            邮箱链接登录
          </button>
        </div>
        
        {error && (
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center ${
              error.includes('已发送') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <svg 
              className={`w-5 h-5 mr-2 ${error.includes('已发送') ? 'text-green-500' : 'text-red-500'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {error.includes('已发送') ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              )}
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="请输入管理员邮箱"
                required
              />
              <svg 
                className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {loginMethod === 'password' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="请输入密码"
                  required={loginMethod === 'password'}
                />
                <svg 
                  className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loginMethod === 'password' ? '登录中...' : '发送中...'}
              </div>
            ) : (loginMethod === 'password' ? '登录' : '发送登录链接')}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或者</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            使用 Google 账号登录
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;