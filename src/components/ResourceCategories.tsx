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
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Voice</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="aspect-square">
            <button
              className={`
                w-full h-full bg-[#F1F1F1] rounded-2xl relative p-5
                ${selectedCategory === category.id 
                  ? 'shadow-[0_4px_12px_rgba(0,0,0,0.06)] scale-[0.98]' // 选中状态：较小的阴影和缩小效果
                  : 'shadow-[0_8px_24px_rgba(0,0,0,0.08)]'} // 未选中状态：较大的阴影
                hover:bg-[#F8F8F8] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]
                transition-all duration-200
              `}
              onClick={() => handleClick(category.id, category.disabled)}
            >
              <span className="font-mono text-sm uppercase text-gray-500 absolute top-5 left-5">
                {category.name}
              </span>
              
              {/* 左下角的指示点 */}
              <div 
                className={`
                  w-2 h-2 rounded-full absolute bottom-3 left-3
                  ${selectedCategory === category.id ? 'bg-[#FB3208]' : 'bg-[#575757]'}
                  transition-colors duration-200
                `}
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