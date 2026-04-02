import React from 'react';
import Header from '../components/Header';
import { audioLoader } from '../utils/audioLoader';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

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
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] mb-8 tracking-tight">{t('about.title')}</h2>
            
            <div className="space-y-8 sm:space-y-10">
              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">{t('about.origin.heading')}</h3>
                <div className="text-[#1A1A1A]/70 leading-relaxed space-y-4 text-base sm:text-lg">
                  <p>{t('about.origin.p1')}</p>
                  <p>
                    {t('about.origin.p2_line1')}
                    <br />
                    {t('about.origin.p2_line2')}
                  </p>
                  <p>
                    {t('about.origin.p3_line1')}
                    <br />
                    {t('about.origin.p3_line2')}
                    <br />
                    {t('about.origin.p3_line3')}
                  </p>
                  <p>
                    {t('about.origin.p4_line1')}
                    <br />
                    {t('about.origin.p4_line2')}
                    <br />
                    {t('about.origin.p4_line3')}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">{t('about.update.heading')}</h3>
                <p className="text-[#1A1A1A]/70 leading-relaxed text-base sm:text-lg">
                  {t('about.update.p1')}
                </p>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">{t('about.opensource.heading')}</h3>
                <div className="text-[#1A1A1A]/70 leading-relaxed space-y-4 text-base sm:text-lg">
                  <p>
                    {t('about.opensource.repoLabel')}
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
                    {t('about.opensource.inspiredBy')}
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
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-4 sm:mb-5 tracking-tight">{t('about.contact.heading')}</h3>
                <p className="text-[#1A1A1A]/70 leading-relaxed text-base sm:text-lg">
                  {t('about.contact.wechat')}
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