import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  THEME_LABELS,
  THEME_OPTIONS,
  type ThemePreference,
} from '../../utils/adminTheme';

const THEME_ICONS = {
  system: Monitor,
  dark: Moon,
  light: Sun,
} as const;

type ThemeModeToggleProps = {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
  className?: string;
};

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  value,
  onChange,
  className = '',
}) => (
  <div
    className={`nd-mode-toggle ${className}`.trim()}
    role="group"
    aria-label="主题"
    style={
      {
        '--nd-seg-cols': THEME_OPTIONS.length,
        '--nd-seg-index': THEME_OPTIONS.indexOf(value),
      } as React.CSSProperties
    }
  >
    <span className="nd-mode-toggle-thumb" aria-hidden />
    {THEME_OPTIONS.map((option) => {
      const Icon = THEME_ICONS[option];
      return (
        <button
          key={option}
          type="button"
          className={value === option ? 'nd-active' : ''}
          aria-label={THEME_LABELS[option]}
          aria-pressed={value === option}
          title={THEME_LABELS[option]}
          onClick={() => onChange(option)}
        >
          <Icon size={14} strokeWidth={2.25} aria-hidden />
        </button>
      );
    })}
  </div>
);

export default ThemeModeToggle;
