import React from 'react';
import clsx from 'clsx';

type SectionHeaderProps = {
  title: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, trailing, className }) => {
  return (
    <div
      className={clsx(
        'flex flex-row justify-between -mb-[1px] relative items-center gap-2',
        className,
      )}
    >
      <div className="flex uppercase py-1 text-[#4D4D4D]/70">
        <h2 className="text-base font-medium">{title}</h2>
      </div>
      <div className="flex flex-1 min-w-0 h-[1px] bg-[#4D4D4D]/8" />
      {trailing != null ? (
        <span className="text-sm text-[#4D4D4D]/60 whitespace-nowrap shrink-0">{trailing}</span>
      ) : null}
    </div>
  );
};

export default SectionHeader;
