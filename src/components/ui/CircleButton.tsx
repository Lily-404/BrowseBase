import React from 'react';
import clsx from 'clsx';
import styles from './CircleButton.module.css';

export interface CircleButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  href?: string;
  disabled?: boolean;
  iconOnly?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

const CircleButton = React.forwardRef<HTMLButtonElement, CircleButtonProps>(
  ({ 
    children, 
    className, 
    size = 'md', 
    variant = 'primary', 
    href, 
    disabled,
    iconOnly,
    onClick,
    ...props 
  }, ref) => {
    if (href) {
      return (
        <a
          href={href}
          className={clsx(
            styles.CircleButton,
            className
          )}
          data-variant={variant}
          data-size={size}
          data-disabled={disabled}
          data-icon-only={iconOnly}
          onClick={onClick}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={clsx(
          styles.CircleButton,
          className
        )}
        data-variant={variant}
        data-size={size}
        data-disabled={disabled}
        data-icon-only={iconOnly}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CircleButton.displayName = 'CircleButton';

export default CircleButton; 