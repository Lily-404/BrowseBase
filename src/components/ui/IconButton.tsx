import React from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.css';
import { audioLoader } from '../../utils/audioLoader';

export interface IconButtonProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    children, 
    className, 
    size = 'md', 
    href, 
    disabled,
    onClick,
    target,
    rel,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
        onClick(e);
      }
      // Play to sound using audioLoader
      audioLoader.playSound('/to.wav');
    };

    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={clsx(
            styles.IconButton,
            className
          )}
          data-size={size}
          data-disabled={disabled}
          onClick={handleClick}
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
          styles.IconButton,
          className
        )}
        data-size={size}
        data-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton; 