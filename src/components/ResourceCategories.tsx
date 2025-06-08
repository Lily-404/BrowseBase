import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLED } from './ui/Button';
import { ResourceCategoriesProps } from '../types/resourceCategories';
import s from './ui/CapsuleButton.module.css';
import { audioLoader } from '../utils/audioLoader';

const ResourceCategories: React.FC<ResourceCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isPageSelectorOpen
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 预加载音频
  useEffect(() => {
    audioRef.current = new Audio('/pressed.wav');
    audioRef.current.volume = 0.4;
    // 预加载音频
    audioRef.current.load();
  }, []);

  const handleClick = (categoryId: string, disabled: boolean | undefined) => {
    if (!disabled && !isPageSelectorOpen) {
      audioLoader.playSound('/pressed.wav');
      onSelectCategory(categoryId);
    }
  };

  const allCategories = categories.map(category => ({
    ...category,
    icon: ['ai', 'resources', 'design'].includes(category.id) ? 'true' : undefined
  }));

  // 移动端渲染
  const renderMobileView = () => (
    <div className={`${s.CapsuleWrapper} ${isPageSelectorOpen ? 'opacity-50 blur-[2px] pointer-events-none' : ''}`}>
      <div className={s.CapsuleContainer}>
        {allCategories.map((category) => (
          <button
            key={category.id}
            className={`${s.CapsuleButton}`}
            data-selected={selectedCategory === category.id}
            onClick={() => handleClick(category.id, category.disabled)}
            disabled={category.disabled}
          >
            {t(`category.${category.id}`)}
          </button>
        ))}
      </div>
    </div>
  );

  // 桌面端渲染
  const renderDesktopView = () => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${isPageSelectorOpen ? 'opacity-50 blur-[2px] pointer-events-none' : ''}`}>
      {allCategories.map((category) => (
        <div key={category.id} className="relative aspect-square">
          <Button
            selected={selectedCategory === category.id}
            className="h-full w-full p-3"
            onClick={() => handleClick(category.id, category.disabled)}
            disabled={category.disabled}
            showStar={category.icon === 'true'}
            starColor={category.id === 'all' ? 'white' : '#575757'}
          >
            <span className="font-mono text-xs uppercase text-[#1A1A1A] absolute top-2 left-2 max-w-[calc(100%-16px)] truncate">
              {t(`category.${category.id}`)}
            </span>
            <ButtonLED />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mb-0 md:mb-6">
      <h2 className="text-base uppercase font-medium mb-0 md:mb-3 text-[#4D4D4D]">{t('category.title')}</h2>
      <div className="block md:hidden">
        {renderMobileView()}
      </div>
      <div className="hidden md:block">
        {renderDesktopView()}
      </div>
    </div>
  );
};

export default ResourceCategories;