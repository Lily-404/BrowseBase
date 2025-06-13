import React from 'react';
import { Link } from 'react-router-dom';
import { audioLoader } from '../utils/audioLoader';

const About: React.FC = () => {
  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/" 
            onClick={playClickSound}
            className="text-gray-600 hover:text-gray-800 font-mono text-sm transition-colors"
          >
            返回
          </Link>
        </div>

        {/* Main Content */}
        <div className="border-2 border-[#2c2c2c] bg-[#f0f0f0] p-6 sm:p-8">
          <h2 className="text-2xl font-mono text-gray-800 mb-6">关于</h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-4">初衷</h3>
              <div className="text-gray-600 font-mono leading-relaxed space-y-4">
                <p>在信息过载的时代，算法决定你看到什么，热榜塑造你的兴趣。</p>
                <p>我们被困在标签、点赞和推荐里，以为那是选择，其实只是圈养。<br />
                资源唾手可得，却越来越难遇见真正惊喜的内容。</p>
                <p>所以我建了这个站。</p>
                <p>
                只有我亲自筛选的链接，凭喜好分类，凭心情编辑。</p>
                <p>点开它们，像打开一个盲盒：你永远不知道会遇见什么。<br />
                博主、知识、资源、有趣——这是我为自己，也为你准备的一点自由。</p>
                <p>目标是1000个资源。还在路上，但每一个都值得你停留。</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-4">更新</h3>
              <p className="text-gray-600 font-mono leading-relaxed">
                本站资源会不定期更新，如果遇到资源失效，请及时联系我。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-mono text-gray-700 mb-4">联系</h3>
              <p className="text-gray-600 font-mono leading-relaxed">
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