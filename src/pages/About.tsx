import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { audioLoader } from '../utils/audioLoader';
import { aboutContent } from '../data/aboutContent';

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
            {aboutContent.map((section, index) => (
              <section key={index}>
                <h3 className="text-lg font-mono text-gray-700 mb-3">{section.title}</h3>
                {Array.isArray(section.content) ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-600 font-mono">
                    {section.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 font-mono leading-relaxed">
                    {section.content}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 