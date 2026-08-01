import React from 'react';

type Direction = 'left' | 'right';

interface DotMatrixChevronProps {
  direction?: Direction;
  size?: number;
  className?: string;
  /** Dot diameter in SVG units */
  dot?: number;
}

/**
 * Nothing-style dot-matrix arrow: shaft + sharp chevron tip (-> / <-)
 */
const DotMatrixChevron: React.FC<DotMatrixChevronProps> = ({
  direction = 'left',
  size = 18,
  className = '',
  dot = 1.5,
}) => {
  // 7×5 grid — shaft + sharp › tip
  //         ·
  //       ·
  // · · · · ·
  //       ·
  //         ·
  const rightDots: [number, number][] = [
    // shaft
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    // sharp chevron tip (same as previous ‹/› style)
    [4, 0],
    [5, 1],
    [6, 2],
    [5, 3],
    [4, 4],
  ];

  const cols = 7;
  const dots =
    direction === 'right'
      ? rightDots
      : rightDots.map(([x, y]) => [cols - 1 - x, y] as [number, number]);

  const cell = 2.6;
  const viewW = cell * cols;
  const viewH = cell * 5;
  const r = dot / 2;
  const offset = (cell - dot) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewW} ${viewH}`}
      className={`shrink-0 self-center ${className}`}
      aria-hidden
    >
      {dots.map(([gx, gy], i) => (
        <circle
          key={i}
          cx={gx * cell + offset + r}
          cy={gy * cell + offset + r}
          r={r}
          fill="currentColor"
        />
      ))}
    </svg>
  );
};

export default DotMatrixChevron;
