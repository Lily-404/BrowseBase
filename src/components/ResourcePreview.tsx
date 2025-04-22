import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(resources.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = resources.slice(startIndex, endIndex);

  if (!resources.length) {
    return (
      <div>
        <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Resources</h2>
        <div className="w-full h-full bg-[#F1F1F1] rounded p-5 flex items-center justify-center
          shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
        >
          <p className="text-gray-500">暂无匹配的资源</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">Resources</h2>
      <div className="grid grid-cols-2 gap-4">
        {currentResources.map(resource => (
          <div key={resource.id} 
            className="bg-[#F1F1F1] rounded p-4
            shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1">{resource.title}</h3>
              <a 
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-black/5 rounded transition-colors flex-shrink-0"
              >
                <ExternalLink size={16} className="text-gray-600" />
              </a>
            </div>

            <div className="text-sm leading-relaxed text-[#1A1A1A] line-clamp-3">
              {resource.description.split('\n\n')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcePreview;