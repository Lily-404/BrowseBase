import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLED } from './ui/Button';

interface Tag {
  id: string;
  name: string;
  description: string;
}

interface ResourceTagsProps {
  tags: Tag[];
  selectedTags: string[];
  onSelectTag: (tagId: string) => void;
  disabled?: boolean; 
}

const ResourceTags: React.FC<ResourceTagsProps> = ({
  tags,
  selectedTags,
  onSelectTag
}) => {
  const { t } = useTranslation();
  const handleClick = (tagId: string) => {
    new Audio('/pressed.wav').play().catch(() => {});
    onSelectTag(tagId);
  };

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">{t('filter.title')}</h2>
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
    </div>
  );
};

export default ResourceTags;