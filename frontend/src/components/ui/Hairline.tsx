import React from 'react';
import clsx from 'clsx';

export interface HairlineProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Hairline: React.FC<HairlineProps> = ({
  className,
  orientation = 'horizontal',
}) => {
  return (
    <div
      role="separator"
      className={clsx(
        orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px',
        'bg-border-hairline shrink-0',
        className
      )}
    />
  );
};
