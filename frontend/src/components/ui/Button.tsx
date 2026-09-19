import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showArrow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  showArrow = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'group inline-flex items-center justify-center font-label-lg text-label-lg tracking-wide transition-colors duration-200 rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-space-sm py-1 gap-1 text-label-md',
    md: 'px-space-md py-space-xs gap-space-xs text-label-lg',
    lg: 'px-space-lg py-space-sm gap-space-sm text-label-lg',
  };

  const variantStyles = {
    primary:
      'bg-ink-primary text-canvas-paper hover:bg-accent-terracotta hover:text-canvas-paper',
    secondary:
      'bg-surface-cream text-ink-primary hover:bg-surface-container-high',
    ghost:
      'bg-transparent text-ink-primary hover:text-accent-terracotta underline underline-offset-4 decoration-border-hairline hover:decoration-accent-terracotta px-0 py-0',
    outline:
      'bg-transparent border border-border-hairline text-ink-primary hover:bg-surface-cream',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="shrink-0 flex items-center">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="shrink-0 flex items-center">{icon}</span>
      )}
      {showArrow && (
        <span className="transition-transform duration-200 group-hover:translate-x-1 shrink-0">
          →
        </span>
      )}
    </button>
  );
};
