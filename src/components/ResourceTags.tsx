import React from 'react';

interface Tag {
  id: string;
  name: string;
  description: string;
}

interface ResourceTagsProps {
  tags: Tag[];
  selectedTags: string[];
  onSelectTag: (tagId: string) => void;
}

const ResourceTags: React.FC<ResourceTagsProps> = ({
  tags,
  selectedTags,
  onSelectTag
}) => {
  const handleClick = (tagId: string) => {
    new Audio('/click.mp3').play().catch(() => {});
    onSelectTag(tagId);
  };

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Tags</h2>
      <div className="grid grid-cols-2 gap-3">
        {tags.map((tag) => (
          <div key={tag.id} className="relative">
            {/* 底部固定矩形，向左上偏移 */}
            <div className="absolute top-[-1px] left-[-1px] w-full h-full bg-[#D7D7D7] rounded-lg" />
            
            <button
              className={`
                btn-base h-14 w-full
                bg-[#F1F1F1] rounded-lg
                ${selectedTags.includes(tag.id) 
                  ? 'shadow-[0_2px_4px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.9),0_1px_2px_#CAC9C9] scale-[0.98]'
                  : 'shadow-[0_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(0,0,0,0.1),inset_3px_3px_6px_rgba(255,255,255,0.9),0_1px_2px_#CAC9C9]'}
                relative transition-all duration-300 ease-in-out
              `}
              onClick={() => handleClick(tag.id)}
            >
              <span className="text-sm uppercase text-gray-600">{tag.name}</span>
              <span 
                className={`absolute bottom-3 left-3 w-2 h-2 rounded-full transition-colors duration-300 ${
                  selectedTags.includes(tag.id) ? 'bg-[#FF3B30]' : 'bg-[#CDCDCD]'
                }`} 
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceTags;