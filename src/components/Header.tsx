import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { Link } from 'react-router-dom';
import CircleButton from './ui/CircleButton';
import { audioLoader } from '../utils/audioLoader';
import Icon from './ui/Icon';

const Header: React.FC = () => {
  const { t } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  return (
    <header>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
                  BrowseBase
                </h1>
                <p className="text-[10px] sm:text-xs font-medium tracking-wide text-[#9A9A9A]/70 -mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  {t('header.slogan')}
                </p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <CircleButton
              href="https://www.jimmy-blog.top/"
              variant="secondary"
              size="sm"
              title={t('header.blog')}
              onClick={playClickSound}
              className="text-[10px] sm:text-xs"
            >
              {t('header.blog')}
            </CircleButton>
            <Link to="/about" onClick={playClickSound}>
              <CircleButton
                variant="secondary"
                size="sm"
                title={t('header.about')}
                className="text-[10px] sm:text-xs"
              >
                {t('header.about')}
              </CircleButton>
            </Link>
            <CircleButton
              onClick={() => {
                playClickSound();
                toggleLanguage();
              }}
              variant="secondary"
              size="sm"
              iconOnly
              title={i18n.language === 'en' ? t('header.switchToChinese') : t('header.switchToEnglish')}
            >
              <Icon 
                name="Globe" 
                size={16} 
                fallback={<span className="text-xs">🌐</span>}
              />
            </CircleButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;