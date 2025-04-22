import React from 'react';

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
  const handleClick = (categoryId: string, disabled: boolean | undefined) => {
    if (!disabled) {
      new Audio('/click.wav').play().catch(() => {});
      onSelectCategory(categoryId);
    }
  };

  const getShadowStyle = (categoryId: string, isSelected: boolean) => {
    if (categoryId === 'all') {
      return isSelected
        ? 'shadow-[-1px_-1px_2px_rgba(255,255,255,0.15),4px_4px_7px_rgba(0,0,0,0.25),inset_-1px_-1px_2px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.1)] scale-[0.995]'
        : 'shadow-[-3px_-3px_6px_rgba(255,255,255,0.15),6px_6px_10px_rgba(0,0,0,0.25),inset_-1px_-1px_2px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.1)]';
    }
    return isSelected
      ? 'shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,1),4px_4px_7px_rgba(0,0,0,0.15)] scale-[0.995]'
      : 'shadow-[4px_4px_7px_rgba(0,0,0,0.25),-1px_-1px_0_rgba(255,255,255,1),inset_-1px_-1px_2px_rgba(0,0,0,0.1),inset_1px_1px_2px_rgba(255,255,255,0.9)]';
  };

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Category</h2>
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="aspect-square relative">
            {/* 底部固定矩形，向左上偏移 */}
            <div className="absolute top-[-0.25px] left-[-0.25px] w-full h-full bg-[#D7D7D7] rounded" />
            
            <button
              className={`
                w-full h-full ${category.id === 'all' ? 'bg-[#9A9A9A]' : 'bg-[#F1F1F1]'} rounded relative p-3
                ${getShadowStyle(category.id, selectedCategory === category.id)}
                relative transition-all duration-300 ease-in-out
              `}
              onClick={() => handleClick(category.id, category.disabled)}
            >
              <span className={`font-mono text-xs uppercase ${
                category.id === 'all' ? 'text-white' : 'text-gray-600'
              } absolute top-2 left-2 max-w-[calc(100%-16px)] truncate`}>{category.name}</span>
              <span 
                className={`absolute bottom-2 left-2 w-2 h-2 rounded-full transition-colors duration-300 ${
                  selectedCategory === category.id 
                    ? category.id === 'all' ? 'bg-[#FF3B30]' : 'bg-[#FF3B30]'
                    : category.id === 'all' ? 'bg-[#808080]' : 'bg-[#CDCDCD]'
                }`} 
              />
              
              {category.icon && (
                <div className="absolute bottom-2 right-2">
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M8 3l2 4.5L14 9l-4.5 2L8 15l-1.5-4L2 9l4-1.5L8 3z" 
                      fill={category.id === 'all' ? 'white' : '#575757'}
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceCategories;