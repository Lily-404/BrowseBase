import React, { useEffect, useState } from 'react';
import '../styles/nothing.css';
import { loadNothingFonts } from '../utils/loadNothingFonts';
import ThemeModeToggle from '../components/ui/ThemeModeToggle';
import {
  getSystemThemeMediaQuery,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '../utils/adminTheme';

const ENV_EXAMPLE = `VITE_SUPABASE_URL=你的-supabase-url
VITE_SUPABASE_ANON_KEY=你的-supabase-anon-key`;

const SetupRequired: React.FC = () => {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readThemePreference())
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadNothingFonts();
  }, []);

  useEffect(() => {
    writeThemePreference(themePreference);

    const apply = () => {
      const next = resolveTheme(themePreference);
      setResolvedTheme(next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    };

    apply();

    if (themePreference !== 'system') {
      return () => {
        document.documentElement.classList.remove('dark');
      };
    }

    const media = getSystemThemeMediaQuery();
    const onChange = () => apply();
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
      document.documentElement.classList.remove('dark');
    };
  }, [themePreference]);

  async function copyEnvExample() {
    try {
      await navigator.clipboard.writeText(ENV_EXAMPLE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`nd ${resolvedTheme === 'light' ? 'nd-light' : ''} nd-dot-grid`}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-10">
            <p className="nd-label">BrowseBase</p>
            <ThemeModeToggle value={themePreference} onChange={setThemePreference} />
          </div>

          <div className="nd-surface p-6 md:p-8">
            <p className="nd-label mb-3">本地开发</p>
            <h1 className="nd-heading mb-4">尚未连接 Supabase</h1>
            <p className="nd-caption text-[var(--nd-text-secondary)] mb-6 leading-relaxed">
              资源数据与登录功能依赖 Supabase。请在项目根目录创建{' '}
              <code className="text-[var(--nd-text-primary)]">.env.local</code>，填入 API 凭证后重启开发服务器。
            </p>

            <ol className="space-y-3 mb-6 text-sm text-[var(--nd-text-secondary)] list-decimal list-inside">
              <li>在 Supabase 控制台新建项目，并执行根目录的 <code>schema.sql</code></li>
              <li>打开 Project Settings → API，复制 Project URL 与 anon public key</li>
              <li>写入下方变量并执行 <code>npm run dev</code></li>
            </ol>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="nd-label">.env.local 示例</p>
                <button type="button" className="nd-btn nd-btn-secondary text-xs py-1 px-3" onClick={copyEnvExample}>
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <pre className="p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all border border-[var(--nd-border-visible)] bg-[var(--nd-surface-raised)] rounded-md font-mono text-[var(--nd-text-primary)]">
                {ENV_EXAMPLE}
              </pre>
            </div>

            <p className="nd-caption text-[var(--nd-text-disabled)] mb-6">
              配置完成后保存文件，若开发服务器已在运行，请重启以加载环境变量。
            </p>

            <button type="button" className="nd-btn nd-btn-primary w-full" onClick={() => window.location.reload()}>
              我已配置，刷新页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupRequired;
