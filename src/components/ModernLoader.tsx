import React, { useRef, useState } from 'react';

interface ModernLoaderProps {
  message?: string;
  subMessage?: string;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({
  message = '加载中',
  subMessage = '正在为您准备精彩内容',
}) => {
  const [specialEffect, setSpecialEffect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 监听动画每次转一圈
  const handleSpinIteration = () => {
    setSpecialEffect(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSpecialEffect(false), 220);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F5] to-[#F0F0F0]">
      {/* 更精致的拟物表盘 */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-8">
        {/* 外层高光金属圈 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f8f8f8] via-[#e0e0e0] to-[#bdbdbd] shadow-[0_10px_36px_rgba(0,0,0,0.16),inset_0_6px_20px_rgba(255,255,255,0.9)] border-4 border-[#eaeaea]" />
        {/* 第二层暗色金属圈 */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#bdbdbd] via-[#e0e0e0] to-[#bdbdbd] border-2 border-[#b0b0b0] opacity-80" />
        {/* 表盘底部放射状渐变 */}
        <svg className="absolute inset-3 w-[124px] h-[124px]" viewBox="0 0 124 124">
          <defs>
            <radialGradient id="dial-gradient" cx="62" cy="62" r="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8f8f8" />
              <stop offset="60%" stopColor="#e0e0e0" />
              <stop offset="100%" stopColor="#d1d1d1" />
            </radialGradient>
            <radialGradient id="sunburst" cx="62" cy="62" r="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="62" cy="62" r="62" fill="url(#dial-gradient)" />
          {/* 放射状底纹 */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            const x1 = 62 + 0 * Math.sin(angle);
            const y1 = 62 - 0 * Math.cos(angle);
            const x2 = 62 + 62 * Math.sin(angle);
            const y2 = 62 - 62 * Math.cos(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fff"
                strokeWidth={i % 6 === 0 ? 1.2 : 0.5}
                opacity={i % 6 === 0 ? 0.13 : 0.07}
              />
            );
          })}
          <circle cx="62" cy="62" r="62" fill="url(#sunburst)" />
        </svg>
        {/* 刻度线和数字 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 144">
          {[...Array(60)].map((_, i) => {
            const angle = (i * 6) * Math.PI / 180;
            const r1 = i % 5 === 0 ? 62 : 66;
            const r2 = 70;
            const x1 = 72 + r1 * Math.sin(angle);
            const y1 = 72 - r1 * Math.cos(angle);
            const x2 = 72 + r2 * Math.sin(angle);
            const y2 = 72 - r2 * Math.cos(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 5 === 0 ? '#bdbdbd' : '#e0e0e0'}
                strokeWidth={i % 5 === 0 ? 2 : 1}
                opacity={i % 5 === 0 ? 0.7 : 0.4}
              />
            );
          })}
          {/* 刻度数字 */}
          {[[0, '12'], [15, '3'], [30, '6'], [45, '9']].map(([idx, num]) => {
            const angle = (idx * 6) * Math.PI / 180;
            const r = 54;
            const x = 72 + r * Math.sin(angle);
            const y = 72 - r * Math.cos(angle) + 6;
            return (
              <text
                key={num}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#888"
                fontFamily="inherit"
                opacity="0.7"
              >{num}</text>
            );
          })}
          {/* 顶部玻璃反光弧线 */}
          <path d="M36 44 Q72 18 108 44" stroke="#fff" strokeWidth="4" fill="none" opacity="0.22" />
          {/* 底部淡淡反射弧线 */}
          <path d="M44 110 Q72 126 100 110" stroke="#fff" strokeWidth="3" fill="none" opacity="0.10" />
        </svg>
        {/* 指针阴影 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <div className="w-2 h-14 rounded-full bg-black/10 blur-md opacity-40 origin-bottom" style={{ marginTop: '22px' }} />
        </div>
        {/* 旋转指针 */}
        <div
          className="absolute inset-0 flex items-center justify-center animate-spin-slow"
          style={{ zIndex: 2 }}
          onAnimationIteration={handleSpinIteration}
        >
          <div className="w-1.5 h-16 bg-gradient-to-b from-[#888] to-[#ccc] rounded-full shadow-lg origin-bottom" style={{ marginTop: '18px' }} />
          <div
            className={`absolute top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-[#fff] to-[#bbb] rounded-full shadow-md border border-[#e0e0e0] transition-all duration-200 ${specialEffect ? 'scale-125 ring-4 ring-yellow-200/60' : ''}`}
            style={{ boxShadow: specialEffect ? '0 0 16px 6px #ffe066' : undefined }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 absolute left-1.5 top-1.5" />
          </div>
        </div>
        {/* 更精致的中心按钮 */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#f8f8f8] via-[#e0e0e0] to-[#bdbdbd] shadow-[0_2px_12px_rgba(0,0,0,0.13),inset_0_2px_10px_rgba(255,255,255,0.7)] border border-[#e0e0e0] flex items-center justify-center transition-transform duration-200 ${specialEffect ? 'scale-110' : ''}`}
          style={{ zIndex: 3 }}
        >
          <span className="text-[#666] font-bold text-2xl select-none drop-shadow-sm">B</span>
          {/* 按钮高光 */}
          <div className="absolute left-3 top-3 w-5 h-2 rounded-full bg-white/70 blur-sm opacity-80" />
          {/* 按钮内阴影 */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.10)]" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4D4D4D] to-[#666666] bg-clip-text text-transparent tracking-wider">
          BrowseBase
        </h1>
        <p className="text-base text-[#4D4D4D]/80 font-medium tracking-wide flex items-center gap-2">
          {message}
          <span className="flex gap-1">
            <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce"></span>
            <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="inline-block w-1 h-3 bg-[#4D4D4D] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </span>
        </p>
        <p className="text-xs text-[#4D4D4D]/40 tracking-wide mt-1">{subMessage}</p>
      </div>
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 2.2s cubic-bezier(0.4,0,0.2,1) infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModernLoader; 