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
    new Audio('/click.wav').play().catch(() => {});
    onSelectTag(tagId);
  };

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Filter</h2>
      <div className="grid grid-cols-2 gap-4">
        {tags.map((tag) => (
          <div key={tag.id} className="relative">
            {/* Bottom fixed rectangle with reduced offset */}
            <div className="absolute top-[-0.25px] left-[-0.25px] w-full h-full bg-[#D7D7D7] rounded pointer-events-none" />
            
            <button
              className={`
                btn-base h-16 w-full
                bg-[#F1F1F1] rounded
                ${selectedTags.includes(tag.id) 
                  ? 'shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,1),4px_4px_7px_rgba(0,0,0,0.15)] scale-[0.995]'
                  : 'shadow-[4px_4px_7px_rgba(0,0,0,0.25),-1px_-1px_0_rgba(255,255,255,1),inset_-1px_-1px_2px_rgba(0,0,0,0.1),inset_1px_1px_2px_rgba(255,255,255,0.9)]'}
                relative transition-all duration-300 ease-in-out cursor-default
              `}
              onClick={() => handleClick(tag.id)}
            >
              <span className="text-xs uppercase text-gray-600 absolute top-2 left-2 max-w-[calc(100%-16px)] truncate">{tag.name}</span>
              <span 
                className={`absolute bottom-2 left-2 w-2 h-2 rounded transition-colors duration-300 ${
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