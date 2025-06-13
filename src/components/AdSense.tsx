import React, { useEffect, useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 确保 adsbygoogle 已定义
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      console.log('AdSense pushed:', { slot, format, responsive });
      
      // 添加加载超时检查
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    } catch (error) {
      console.error('AdSense error:', error);
      setError('广告加载失败');
      setIsLoading(false);
    }
  }, [slot, format, responsive]);

  const neumorphicStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '15px',
    background: '#e0e5ec',
    boxShadow: '8px 8px 15px #a3b1c6, -8px -8px 15px #ffffff',
    margin: '20px 0',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  if (error) {
    return (
      <div style={neumorphicStyle}>
        <div style={{ color: '#666', textAlign: 'center' }}>{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={neumorphicStyle}>
        <div style={{ color: '#666', textAlign: 'center' }}>广告加载中...</div>
      </div>
    );
  }

  return (
    <div style={neumorphicStyle}>
      <ins
        className={`adsbygoogle ${className}`}
        style={{
          display: 'block',
          minHeight: '100px',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
        data-ad-client="ca-pub-2452864169775781"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default AdSense; 