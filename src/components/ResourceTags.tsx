import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLED } from './ui/Button';
import { ResourceTagsProps } from '../types/resourceTags';
import s from './ui/CapsuleButton.module.css';

const ResourceTags: React.FC<ResourceTagsProps> = ({
  tags,
  selectedTags,
  onSelectTag
}) => {
  const { t } = useTranslation();
  const handleClick = (tagId: string) => {
    const audio = new Audio('/pressed.wav');
    audio.volume = 0.4;
    audio.play().catch((error) => {
      console.warn('音频播放失败:', error);
    });
    onSelectTag(tagId);
  };

  // 移动端渲染
  const renderMobileView = () => (
    <div className={s.CapsuleWrapper}>
      <div className={s.CapsuleContainer}>
        {tags.map((tag) => (
          <button
            key={tag.id}
            className={s.CapsuleButton}
            data-selected={selectedTags.includes(tag.id)}
            onClick={() => handleClick(tag.id)}
          >
            {t(`filter.${tag.id}`)}
          </button>
        ))}
      </div>
    </div>
  );

  // 桌面端渲染
  const renderDesktopView = () => (
    <div className="grid grid-cols-2 gap-4">
      {tags.map((tag) => (
        <div key={tag.id} className="relative">
          <Button
            selected={selectedTags.includes(tag.id)}
            className="h-16 w-full p-3"
            onClick={() => handleClick(tag.id)}
          >
            <span className="font-mono text-xs uppercase text-[#1A1A1A] absolute top-2 left-2 max-w-[calc(100%-16px)] truncate">
              {t(`filter.${tag.id}`)}
            </span>
            <ButtonLED />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mb-6">
      <h2 className="text-base uppercase mb-3 text-[#4D4D4D]">{t('filter.title')}</h2>
      <div className="block md:hidden">
        {renderMobileView()}
      </div>
      <div className="hidden md:block">
        {renderDesktopView()}
      </div>
    </div>
  );
};

export default ResourceTags;