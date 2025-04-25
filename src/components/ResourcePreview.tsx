import React from 'react';
import { ExternalLink } from 'lucide-react';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';  // 添加这行

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
  currentPage: number;
  itemsPerPage: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ 
  resources, 
  currentPage, 
  itemsPerPage,
  onNextPage,
  onPrevPage
}) => {
  const { t } = useTranslation();
  // 确保当前页码不超过总页数
  const totalPages = Math.max(1, Math.ceil(resources.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  // 计算当前页的资源索引范围
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, resources.length);
  
  // 使用资源的唯一ID创建一个集合，确保没有重复
  const uniqueResourceIds = new Set();
  const uniqueResources = resources.slice(startIndex, endIndex).filter(resource => {
    if (uniqueResourceIds.has(resource.id)) {
      return false;
    }
    uniqueResourceIds.add(resource.id);
    return true;
  });
  
  if (!resources.length) {
    return (
      <div>
        <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">{t('resourcePreview.title')}</h2>
        <div className="w-full h-full bg-[#F1F1F1] rounded p-5 flex items-center justify-center
          shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
        >
          <p className="text-gray-500">{t('resourcePreview.noMatch')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold uppercase mb-3 text-[#1A1A1A]">{t('resourcePreview.title')}</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {uniqueResources.map(resource => (
          <div key={resource.id} 
            className="bg-[#F1F1F1] rounded p-4
            shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1 flex-1 mr-4">{resource.title}</h3>
              <a 
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center w-7 h-7 bg-[#F1F1F1] rounded hover:scale-105 transition-transform ml-auto
                shadow-[4px_4px_7px_rgba(0,0,0,0.25),inset_-1px_-1px_2px_rgba(0,0,0,0.1),inset_1px_1px_2px_rgba(255,255,255,0.9)]
                active:shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,1),4px_4px_7px_rgba(0,0,0,0.15)] active:scale-[0.995]"
                onClick={() => new Audio('/click.mp3').play().catch(() => {})}
              >
                <ExternalLink size={16} className="text-gray-600 group-hover:text-gray-800" />
              </a>
            </div>

            <div className="text-sm leading-relaxed text-[#1A1A1A] line-clamp-3">
              {resource.description.split('\n\n')[0]}
            </div>
          </div>
        ))}
      </div>
      <Footer 
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
      />
    </div>
  );
};

export default ResourcePreview;