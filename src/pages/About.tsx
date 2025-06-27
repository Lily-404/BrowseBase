import React from 'react';
import { Link } from 'react-router-dom';
import { audioLoader } from '../utils/audioLoader';

const About: React.FC = () => {
  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  return (
    <div className="min-h-screen bg-[#f3e9d2] text-base sm:text-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex justify-end items-center mb-8">
          <Link 
            to="/" 
            onClick={playClickSound}
            className="px-6 py-2 rounded border border-[#8b6f47] bg-[#f8f3e3] text-[#4b2e09] font-serif text-base font-semibold transition-all duration-200 hover:underline hover:bg-[#f3e9d2] focus:outline-none"
            style={{ boxShadow: 'none' }}
          >
            返回
          </Link>
        </div>

        {/* Main Content */}
        <div
          className="rounded-md border border-[#8b6f47] bg-[#f8f3e3] p-8 sm:p-12"
        >
          <h2 className="text-2xl font-serif text-[#4b2e09] mb-6 underline decoration-[#8b6f47] decoration-2 underline-offset-4">关于</h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-serif text-[#4b2e09] mb-4">初衷</h3>
              <div className="text-[#5c4321] font-mono leading-relaxed space-y-4">
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
                <p></p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-serif text-[#4b2e09] mb-4">更新</h3>
              <p className="text-[#5c4321] font-mono leading-relaxed">
                本站资源会不定期更新，如果遇到资源失效，请及时联系我。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif text-[#4b2e09] mb-4">开源</h3>
              <p className="text-[#5c4321] font-mono leading-relaxed">
                链接：https://github.com/Lily-404/BrowseBase
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif text-[#4b2e09] mb-4">联系</h3>
              <p className="text-[#5c4321] font-mono leading-relaxed">
                微信：OOIll0
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 