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
          <div key={tag.id}>
            <button
              className={`
                btn-base h-14 w-full
                bg-[#F1F1F1] hover:bg-[#F8F8F8]
                ${selectedTags.includes(tag.id) 
                  ? 'shadow-[0_4px_12px_rgba(0,0,0,0.06)] scale-[0.98]' // 选中状态：较小的阴影和缩小效果
                  : 'shadow-[0_8px_24px_rgba(0,0,0,0.08)]'} // 未选中状态：较大的阴影
                relative transition-all duration-200
              `}
              onClick={() => handleClick(tag.id)}
            >
              <span className="text-sm uppercase text-gray-500">{tag.name}</span>
              <span 
                className={`absolute bottom-3 left-3 w-2 h-2 rounded-full transition-colors duration-200 ${
                  selectedTags.includes(tag.id) ? 'bg-[#FB3208]' : 'bg-[#575757]'
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