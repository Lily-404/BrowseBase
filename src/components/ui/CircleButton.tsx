import React from 'react';
import clsx from 'clsx';
import styles from './CircleButton.module.css';

interface CircleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  href?: string;
  disabled?: boolean;
  iconOnly?: boolean;
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
    ...props 
  }, ref) => {
    const Component = href ? 'a' : 'button';
    const elementProps = href ? { href } : {};

    return (
      <Component
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
        {...elementProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CircleButton.displayName = 'CircleButton';

export default CircleButton; 