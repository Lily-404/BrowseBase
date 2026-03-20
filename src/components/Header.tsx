import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { Link } from 'react-router-dom';
import CircleButton from './ui/CircleButton';
import { audioLoader } from '../utils/audioLoader';
import Icon from './ui/Icon';

type HeaderMode = 'default' | 'about';

type LayoutMode = 'grid' | 'list' | 'single';

type HeaderProps = {
  onBlindBoxClick?: () => void;
  mode?: HeaderMode;
  layoutMode?: LayoutMode;
  onLayoutToggle?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  onBlindBoxClick,
  mode = 'default',
  layoutMode,
  onLayoutToggle,
}) => {
  const { t } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  const getLayoutLabel = () => {
    if (i18n.language !== 'en') {
      if (layoutMode === 'list') return '列表';
      if (layoutMode === 'single') return '单列';
      return '网格';
    }
    if (layoutMode === 'list') return 'List';
    if (layoutMode === 'single') return 'Single';
    return 'Grid';
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

          {mode === 'about' ? (
            <div className="flex items-center ml-auto">
              <Link
                to="/"
                onClick={playClickSound}
                className="inline-flex items-center px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F1F1F1] text-[#4D4D4D] font-medium text-sm transition-all duration-200 hover:bg-[#E7E7E7] hover:text-[#1A1A1A] shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)]"
              >
                {t('header.back')}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              {onLayoutToggle ? (
                <CircleButton
                  onClick={() => {
                    playClickSound();
                    onLayoutToggle();
                  }}
                  variant="secondary"
                  size="sm"
                  title="布局模式"
                  className="!hidden sm:!inline-flex text-[10px] sm:text-xs bg-gray-800 text-white border-none"
                >
                  {getLayoutLabel()}
                </CircleButton>
              ) : (
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
              )}
              <CircleButton
                onClick={onBlindBoxClick}
                variant="secondary"
                size="sm"
                title={t('header.blindBox')}
                className="text-[10px] sm:text-xs bg-gray-400 text-white  border-none"
              >
                {t('header.blindBox')}
              </CircleButton>
              <Link to="/about" onClick={playClickSound}>
                {/* 移动端显示icon */}
                <CircleButton
                  variant="secondary"
                  size="sm"
                  title={t('header.about')}
                  iconOnly
                  className="hidden"
                >
                  <Icon name="Info" size={16} />
                </CircleButton>
                {/* PC端显示文字 */}
                <CircleButton
                  variant="secondary"
                  size="sm"
                  title={t('header.about')}
                  className="text-[10px] sm:text-xs inline-flex"
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
                className="inline-flex"
              >
                <Icon
                  name="Globe"
                  size={16}
                  fallback={<span className="text-xs">🌐</span>}
                />
              </CircleButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;