import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { t } = useTranslation();
  

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header>
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="BrowseBase Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center">BrowseBase</h1>
            </Link>
            <p className="hidden md:block text-xs text-[#9A9A9A] self-end pb-[5px]">{t('header.slogan')}</p>
          </div>
          
          <div className="flex items-center gap-5 ml-auto pr-2">
            <a 
              href="https://www.jimmy-blog.top/" 

              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A1A]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-bold uppercase text-sm">{t('header.blog')}</span>
              <ArrowRight size={16} />
            </a>
            <a 
              href="https://github.com/Lily-404/BrowseBase" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A1A]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-bold uppercase text-sm">{t('header.openSource')}</span>
              <ArrowRight size={16} />
            </a>
            <button
              onClick={() => {
                toggleLanguage();
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A1A]"
            >
              <span className="font-bold uppercase text-sm">
                {i18n.language === 'en' ? t('header.switchToChinese') : t('header.switchToEnglish')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;