import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 尝试使用魔法链接登录
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/admin'
        }
      });

      if (magicLinkError) throw magicLinkError;
      
      setError('登录链接已发送到您的邮箱，请查收！');
      setEmail('');
    } catch (error: any) {
      setError(error.message || '登录失败，请重试');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">管理员登录</h2>
        {error && (
          <div className={`p-3 rounded mb-4 ${
            error.includes('已发送') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '发送中...' : '发送登录链接'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          我们会向您的邮箱发送一个登录链接，点击链接即可登录
        </p>
      </div>
    </div>
  );
}

export default Login;