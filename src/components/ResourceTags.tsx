import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLED } from './ui/Button';
import { ResourceTagsProps } from '../types/resourceTags';
import s from './ui/CapsuleButton.module.css';
import { audioLoader } from '../utils/audioLoader';

const ResourceTags: React.FC<ResourceTagsProps> = ({
  tags,
  selectedTags,
  onSelectTag
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

  const handleClick = (tagId: string) => {
    audioLoader.playSound('/pressed.wav');
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
    <div className="mb-1 md:mb-6">
      <h2 className="text-base uppercase font-medium mb-1 md:mb-3 text-[#4D4D4D]">{t('filter.title')}</h2>
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