import React from 'react';

interface ResourcePreviewProps {
  content: string;
}

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ content }) => {
  return (
    <div className="bg-[#F1F1F1] rounded-lg p-5 shadow-lg h-full">
      <div className="text-base leading-relaxed text-[#1A1A1A]">
        {content}
      </div>
    </div>
  );
};

export default ResourcePreview;