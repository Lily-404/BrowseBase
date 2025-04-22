import React from 'react';
import { ExternalLink, Clock, Star } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  updatedAt: string;
  rating: number;
  reviews: number;
  tags: string[];
  category: string;
}

interface ResourcePreviewProps {
  resources: Resource[];
}

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ resources }) => {
  if (!resources.length) {
    return (
      <div className="w-full h-full bg-[#F1F1F1] rounded-lg p-5 flex items-center justify-center
        shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
      >
        <p className="text-gray-500">暂无匹配的资源</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map(resource => (
        <div key={resource.id} 
          className="bg-[#F1F1F1] rounded-lg p-5
          shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
        >
          {/* 资源标题和链接 */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-[#1A1A1A]">{resource.title}</h3>
            <a 
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <ExternalLink size={20} className="text-gray-600" />
            </a>
          </div>

          {/* 资源信息栏 */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{resource.updatedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} />
              <span>{resource.rating} ({resource.reviews} reviews)</span>
            </div>
          </div>

          {/* 资源描述 */}
          <div className="text-base leading-relaxed text-[#1A1A1A] mb-4">
            {resource.description.split('\n\n')[0]}
          </div>

          {/* 资源标签 */}
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-black/5 rounded-full text-sm text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourcePreview;