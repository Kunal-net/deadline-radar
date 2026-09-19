import React from 'react';
import clsx from 'clsx';

export interface OpenListRowProps {
  className?: string;
  leftContent: React.ReactNode;
  centerContent: React.ReactNode;
  rightContent?: React.ReactNode;
  onClick?: () => void;
}

export const OpenListRow: React.FC<OpenListRowProps> = ({
  className,
  leftContent,
  centerContent,
  rightContent,
  onClick,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'group py-space-md lg:py-space-lg px-space-xs lg:px-space-md -mx-space-xs lg:-mx-space-md',
        'transition-colors duration-200 hover:bg-surface-cream rounded-none',
        'grid grid-cols-1 lg:grid-cols-12 gap-space-sm items-baseline',
        onClick && 'cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary',
        className
      )}
    >
      <div className="lg:col-span-3 flex flex-col justify-start">
        {leftContent}
      </div>
      <div className="lg:col-span-6 pr-0 lg:pr-space-md flex flex-col gap-space-xs">
        {centerContent}
      </div>
      {rightContent && (
        <div className="lg:col-span-3 flex lg:justify-end items-center mt-space-xs lg:mt-0">
          {rightContent}
        </div>
      )}
    </div>
  );
};
