import React from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.css';
import { audioLoader } from '../../utils/audioLoader';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
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
    const Component = href ? 'a' : 'button';
    const elementProps = href ? { href, target, rel } : {};

    const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
        onClick();
      }
      // Play click sound using audioLoader
      audioLoader.playSound('/click.mp3');
    };

    return (
      <Component
        ref={ref}
        className={clsx(
          styles.IconButton,
          className
        )}
        data-size={size}
        data-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        {...elementProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton; 