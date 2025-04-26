import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLED } from './ui/Button';

interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  icon?: string;
}

interface ResourceCategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ResourceCategories: React.FC<ResourceCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const { t } = useTranslation();
  const handleClick = (categoryId: string, disabled: boolean | undefined) => {
    if (!disabled) {
      new Audio('/click.wav').play().catch(() => {});
      onSelectCategory(categoryId);
    }
  };


  const allCategories = [
    ...categories.map(category => ({
      ...category,
      icon: category.id === 'ai' || category.id === 'opensource' || category.id === 'all' || category.id === 'design'? 'true' : undefined
    })),
    {
      id: 'opensource',
      name: 'Open Source',
      icon: true
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">{t('category.title')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allCategories.map((category) => (
          <div key={category.id} className="aspect-square relative">
            <Button
              color={category.id === 'all' ? 'secondary' : undefined}
              selected={selectedCategory === category.id}
              disabled={'disabled' in category ? category.disabled : undefined}
              className="w-full h-full p-3"
              onClick={() => handleClick(category.id, 'disabled' in category ? category.disabled : undefined)}
            >
              <span className={`font-mono text-xs uppercase absolute top-2 left-2 max-w-[calc(100%-16px)] truncate`}>
                {t(`category.${category.id}`)}
              </span>
              
              <ButtonLED />
              
              {category.icon && (
                <div className="absolute bottom-2 right-2">
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                  >
                    <path 
                      d="M8 3l2 4.5L14 9l-4.5 2L8 15l-1.5-4L2 9l4-1.5L8 3z" 
                      fill={category.id === 'all' ? 'white' : '#575757'}
                    />
                  </svg>
                </div>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceCategories;