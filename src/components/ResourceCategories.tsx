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
      new Audio('/click.mp3').play().catch(() => {});
      onSelectCategory(categoryId);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Category</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="aspect-square relative">
            {/* 底部固定矩形，向左上偏移 */}
            <div className="absolute top-[-1px] left-[-1px] w-full h-full bg-[#D7D7D7] rounded-lg" />
            
            <button
              className={`
                w-full h-full bg-[#F1F1F1] rounded-lg relative p-5
                ${selectedCategory === category.id 
                  ? 'shadow-[0_2px_4px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.9),0_1px_2px_#CAC9C9] scale-[0.98]' 
                  : 'shadow-[0_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(0,0,0,0.1),inset_3px_3px_6px_rgba(255,255,255,0.9),0_1px_2px_#CAC9C9]'}
                relative transition-all duration-300 ease-in-out
              `}
              onClick={() => handleClick(category.id, category.disabled)}
            >
              <span className="font-mono text-sm uppercase text-gray-600">{category.name}</span>
              <span 
                className={`absolute bottom-3 left-3 w-2 h-2 rounded-full transition-colors duration-300 ${
                  selectedCategory === category.id ? 'bg-[#FF3B30]' : 'bg-[#CDCDCD]'
                }`} 
              />
              
              {/* 右下角的星形图标 */}
              {category.icon && (
                <div className="absolute bottom-3 right-3">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M8 3l2 4.5L14 9l-4.5 2L8 15l-1.5-4L2 9l4-1.5L8 3z" 
                      fill="#575757"
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