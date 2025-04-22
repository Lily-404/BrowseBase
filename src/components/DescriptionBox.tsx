import React from 'react';

interface DescriptionBoxProps {
  description: string;
}

const DescriptionBox: React.FC<DescriptionBoxProps> = ({ description }) => {
  return (
    <div className="w-full bg-[#F1F1F1] rounded p-5 mb-6
      shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.2)]"
    >
      <p className="text-base leading-relaxed text-[#1A1A1A]">{description}</p>
    </div>
  );
};

export default DescriptionBox;