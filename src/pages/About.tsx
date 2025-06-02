import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { audioLoader } from '../utils/audioLoader';

const About: React.FC = () => {
  const { t } = useTranslation();

  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-2 sm:gap-3" onClick={playClickSound}>
            <Button
              color="secondary"
              className="w-8 h-8 sm:w-10 sm:h-10 p-0 flex items-center justify-center rounded-full"
              onClick={playClickSound}
            />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-mono tracking-tight text-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
                BrowseBase
              </h1>
              <p className="text-[10px] sm:text-xs font-mono tracking-wide text-[#9A9A9A]/70 -mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                {t('header.slogan')}
              </p>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="border-2 border-[#2c2c2c] bg-[#f0f0f0] p-6 sm:p-8">
          <h2 className="text-2xl font-mono text-gray-800 mb-6">关于 BrowseBase</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-3">项目目的</h3>
              <p className="text-gray-600 font-mono leading-relaxed">
                BrowseBase 是一个专注于收集和整理优质网络资源的平台。我们的目标是帮助用户快速找到有价值的在线资源，包括但不限于学习资料、工具、教程等。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-3">主要功能</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 font-mono">
                <li>资源分类浏览：通过分类系统快速找到所需资源</li>
                <li>标签筛选：使用标签系统精确定位特定主题的资源</li>
                <li>搜索功能：支持快速搜索和智能推荐</li>
                <li>响应式设计：支持各种设备访问</li>
                <li>复古风格：独特的视觉体验</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-3">技术特点</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 font-mono">
                <li>使用 React 和 TypeScript 构建</li>
                <li>采用 Tailwind CSS 实现响应式设计</li>
                <li>集成 Supabase 作为后端服务</li>
                <li>实现优雅的动画和交互效果</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-3">联系我</h3>
              <p className="text-gray-600 font-mono leading-relaxed">
                如果您有任何建议或反馈，欢迎通过以下方式联系我们：
              </p>
              <div className="mt-3 space-y-2 text-gray-600 font-mono">
                <p>🌐 Website: <a href="https://www.jimmy-blog.top/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">jimmy-blog.top</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 