import React from 'react';
import Header from '../components/Header';
import { audioLoader } from '../utils/audioLoader';

const About: React.FC = () => {
  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header mode="about" />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Main Content */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F1F1F1] p-6 sm:p-8 md:p-12 shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] mb-8 tracking-tight">关于</h2>
            
            <div className="space-y-8 sm:space-y-10">
              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">初衷</h3>
                <div className="text-[#1A1A1A]/70 leading-relaxed space-y-4 text-base sm:text-lg" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  <p>在信息过载的时代，算法决定你看到什么，热榜塑造你的兴趣。</p>
                  <p>我们被困在标签、点赞和推荐里，以为那是选择，其实只是圈养。<br />
                  资源唾手可得，却越来越难遇见真正惊喜的内容。</p>
                  <p>
                  亲自筛选的链接，凭喜好分类，凭心情编辑。<br/>
                  这里没有广告，没有推广，没有利益相关。<br />
                  只是单纯地，想把值得一看的东西分享出来。</p>
                  <p>点开它们，像打开一个盲盒：你永远不知道会遇见什么。<br />
                  博主、知识、资源、有趣——这是我为自己，也为你准备的一点自由。<br />
                  目标是1000个资源。还在路上，但每一个都值得你停留。</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">更新</h3>
                <p className="text-[#1A1A1A]/70 leading-relaxed text-base sm:text-lg" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  本站资源会不定期更新，如果遇到资源失效，请及时联系我。
                </p>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">开源</h3>
                <div className="text-[#1A1A1A]/70 leading-relaxed space-y-4 text-base sm:text-lg" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  <p>
                    本站仓库：
                    <a
                      href="https://github.com/Lily-404/BrowseBase"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playClickSound}
                      className="text-[#4D4D4D] hover:text-[#1A1A1A] underline transition-colors ml-1"
                    >
                      https://github.com/Lily-404/BrowseBase
                    </a>
                  </p>
                  <p>
                    UI 与交互部分参考了 OpenAI 开源演示项目 openai-fm：
                    <a
                      href="https://github.com/openai/openai-fm"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playClickSound}
                      className="text-[#4D4D4D] hover:text-[#1A1A1A] underline transition-colors ml-1"
                    >
                      https://github.com/openai/openai-fm
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">联系</h3>
                <p className="text-[#1A1A1A]/70 leading-relaxed text-base sm:text-lg" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  微信：OOIll0
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About; 