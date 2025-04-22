import React from 'react';

interface DescriptionBoxProps {
  description: string;
}

const DescriptionBox: React.FC<DescriptionBoxProps> = ({ description }) => {
  return (
    <div className="bg-[#F1F1F1] rounded-lg p-4 shadow-lg mb-6">
      <p className="text-base leading-relaxed text-[#1A1A1A]">{description}</p>
    </div>
  );
};

export default DescriptionBox;