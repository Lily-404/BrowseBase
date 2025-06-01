import React from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.css';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
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
      // Play click sound
      new Audio('/click.mp3').play().catch(() => {});
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