import React from 'react';
import { ExternalLink } from 'lucide-react';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { ResourcePreviewProps } from '../types/resourcePreview';

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ 
  resources, 
  currentPage, 
  itemsPerPage,
  onNextPage,
  onPrevPage,
  totalPages  // 直接使用传入的 totalPages
}) => {
  const { t } = useTranslation();
  
  // 移除这行，直接使用传入的 totalPages
  // const totalPages = Math.ceil(resources.length / itemsPerPage);
  
  if (!resources.length) {
    return (
      <div className="flex flex-1 flex-col shrink-0 mb-10">
        <div className="flex flex-row justify-between -mb-[1px] relative items-center gap-2">
          <div className="flex uppercase py-1 text-current/70 font-semibold">{t('resourcePreview.title')}</div>
          <div className="flex flex-1 h-[1px] bg-foreground/8" />
        </div>
        <div className="flex flex-1 flex-col pt-3 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} 
                className="bg-[#F1F1F1] rounded-lg p-4 animate-pulse
                shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]"
                style={{ 
                  '--animation-delay': `${item * 0.05}s`,
                  animationDelay: 'var(--animation-delay)'
                } as React.CSSProperties}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                  </div>
                  <div className="w-7 h-7 bg-gray-200 rounded-lg ml-4 flex-shrink-0"></div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col shrink-0 mb-10">
      <div className="flex flex-row justify-between -mb-[1px] relative items-center gap-2">
        <div className="flex uppercase py-1 text-current/70 font-semibold">{t('resourcePreview.title')}</div>
        <div className="flex flex-1 h-[1px] bg-foreground/8" />
      </div>
      <div className="flex flex-1 flex-col pt-3 rounded-lg">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {resources.map(resource => (
            <div key={resource.id} 
              className="bg-[#F1F1F1] rounded-lg p-4
              shadow-[inset_-0.5px_-0.5px_2px_rgba(255,255,255,0.9),inset_0.5px_0.5px_2px_rgba(0,0,0,0.25)]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1 flex-1 mr-4">{resource.title}</h3>
                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center w-7 h-7 bg-[#F1F1F1] rounded-lg hover:scale-105 transition-transform ml-auto
                  shadow-[1px_1px_2px_rgba(0,0,0,0.2),inset_-0.5px_-0.5px_1px_rgba(0,0,0,0.1),inset_0.5px_0.5px_1px_rgba(255,255,255,0.9)]
                  active:shadow-[inset_-0.5px_-0.5px_2px_rgba(0,0,0,0.25),inset_0.5px_0.5px_2px_rgba(255,255,255,1),0.5px_0.5px_2px_rgba(0,0,0,0.15)] active:scale-[0.995]"
                  onClick={() => new Audio('/click.mp3').play().catch(() => {})}
                >
                  <ExternalLink size={16} className="text-gray-600 group-hover:text-gray-800" />
                </a>
              </div>

              <div className="text-sm leading-relaxed text-[#1A1A1A]/60 line-clamp-3">
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
    </div>
  );
};

export default React.memo(ResourcePreview);