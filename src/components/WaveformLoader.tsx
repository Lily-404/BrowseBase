import React from 'react';
import styles from '../styles/animations.module.css';

/** 与 openai-fm PlayButton 加载态相同的固定幅度，用于“busy”波形动画 */
const LOADING_LEVELS = [0.032, 0.032, 0.032, 0.032, 0.032];

export interface WaveformLoaderProps {
  className?: string;
  barClassName?: string;
}

export const WaveformLoader: React.FC<WaveformLoaderProps> = ({
  className,
  barClassName = 'bg-[#4D4D4D]',
}) => (
  <div className={['relative h-4 w-[36px]', className].filter(Boolean).join(' ')}>
    {LOADING_LEVELS.map((level, idx) => {
      const height = `${Math.min(Math.max(level * 30, 0.2), 1.9) * 100}%`;
      return (
        <div
          key={idx}
          className={[
            'absolute top-1/2 w-0.5 -translate-y-1/2 rounded-[2px] transition-all duration-150',
            barClassName,
            styles.animateWave,
          ].join(' ')}
          style={{
            height,
            animationDelay: `${idx * 0.15}s`,
            left: `${idx * 6}px`,
          }}
        />
      );
    })}
  </div>
);

export default WaveformLoader;
