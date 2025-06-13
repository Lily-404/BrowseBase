import React, { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdSense: React.FC<AdSenseProps> = ({
  slot,
  style,
  format = 'auto',
  responsive = true,
  className = '',
}) => {
  useEffect(() => {
    try {
      // 确保 adsbygoogle 已定义
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-2452864169775781"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
};

export default AdSense; 