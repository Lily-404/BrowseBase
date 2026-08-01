import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import React from 'react';
import '../styles/nothing.css';
import { loadNothingFonts } from '../utils/loadNothingFonts';

interface AuthError {
  message?: string;
  status?: number;
  name?: string;
}

type ThemeMode = 'dark' | 'light';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const v = localStorage.getItem('adminNothingTheme');
      if (v === 'light' || v === 'dark') return v;
      return 'dark';
    } catch {
      return 'dark';
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadNothingFonts();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adminNothingTheme', theme);
    } catch {
      // ignore
    }
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    return () => {
      root.classList.remove('dark');
    };
  }, [theme]);

  const isGoogleOAuthSupported = () => {
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const hasContentBlocker =
      window.navigator.userAgent.includes('AdBlock') ||
      window.navigator.userAgent.includes('uBlock');
    return (isChrome || isEdge) && !hasContentBlocker;
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginMethod === 'password') {
        console.log('尝试登录:', email);

        try {
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

          const isPasswordValid = await bcrypt.compare(password, profile.password);

          if (!isPasswordValid) {
            throw new Error('邮箱或密码错误');
          }

          if (profile.role !== 'admin') {
            throw new Error('您没有管理员权限');
          }

          console.log('Login successful');
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminEmail', email);
          navigate('/admin', { replace: true });
          return;
        } catch (error: unknown) {
          console.error('登录过程错误:', error);
          const authError = error as AuthError;
          if (authError.message) {
            throw new Error(authError.message);
          }
          throw new Error('登录失败，请检查网络连接后重试');
        }
      } else {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', email)
            .single();

          if (profileError) {
            console.error('Profile查询错误:', profileError);
            throw new Error('用户不存在');
          }

          if (!profile) {
            throw new Error('未找到用户信息');
          }

          if (profile.role !== 'admin') {
            throw new Error('您没有管理员权限');
          }

          const { error: emailError } = await supabase.functions.invoke('send-login-email', {
            body: { email },
          });

          if (emailError) {
            throw new Error('发送邮件失败');
          }

          setError('登录链接已发送到您的邮箱，请查收！');
          setEmail('');
        } catch (error: unknown) {
          console.error('Magic link 过程错误:', error);
          const authError = error as AuthError;
          if (authError.message) {
            throw new Error(authError.message);
          }
          throw new Error('发送登录链接失败，请检查网络连接后重试');
        }
      }
    } catch (error: unknown) {
      console.error('完整错误信息:', error);
      const authError = error as AuthError;
      setError(authError.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!isGoogleOAuthSupported()) {
      setError(
        '您的浏览器可能不支持 Google 登录，请尝试使用 Chrome 或 Edge 浏览器，或暂时关闭内容拦截器。'
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError((error as { message?: string }).message || '登录失败，请重试');
      console.error('Google登录错误:', error);
    }
  }

  const isSuccessMsg = error.includes('已发送');

  return (
    <div className={`nd ${theme === 'light' ? 'nd-light' : ''} nd-dot-grid`}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
            <p className="nd-label">BrowseBase</p>
            <div className="nd-mode-toggle" role="group" aria-label="主题">
              <button
                type="button"
                className={theme === 'dark' ? 'nd-active' : ''}
                onClick={() => setTheme('dark')}
              >
                深色
              </button>
              <button
                type="button"
                className={theme === 'light' ? 'nd-active' : ''}
                onClick={() => setTheme('light')}
              >
                浅色
              </button>
            </div>
          </div>

          <div className="nd-surface p-6 md:p-8">
            {/* Method segmented control */}
            <div className="nd-mode-toggle w-full mb-8 !h-11">
              <button
                type="button"
                className={`flex-1 ${loginMethod === 'password' ? 'nd-active' : ''}`}
                onClick={() => {
                  setLoginMethod('password');
                  setError('');
                }}
              >
                密码登录
              </button>
              <button
                type="button"
                className={`flex-1 ${loginMethod === 'magic' ? 'nd-active' : ''}`}
                onClick={() => {
                  setLoginMethod('magic');
                  setError('');
                }}
              >
                邮箱链接
              </button>
            </div>

            {error && (
              <p className={`nd-status mb-6 ${isSuccessMsg ? 'nd-status-ok' : 'nd-status-err'}`}>
                [{isSuccessMsg ? '已发送' : '错误'}] {error}
              </p>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="nd-label block mb-2">
                  邮箱地址
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="nd-input"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              {loginMethod === 'password' && (
                <div>
                  <label htmlFor="password" className="nd-label block mb-2">
                    密码
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="nd-input"
                    placeholder="••••••••"
                    required={loginMethod === 'password'}
                    autoComplete="current-password"
                  />
                </div>
              )}

              <button type="submit" disabled={loading} className="nd-btn nd-btn-primary w-full">
                {loading
                  ? loginMethod === 'password'
                    ? '[登录中...]'
                    : '[发送中...]'
                  : loginMethod === 'password'
                    ? '登录'
                    : '发送登录链接'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--nd-border)]">
              <p className="nd-label text-center mb-4">或者</p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="nd-btn nd-btn-secondary w-full"
              >
                使用 Google 账号登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
