import React from 'react';
import clsx from 'clsx';

export interface MetricBlockProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'surface' | 'cream' | 'container';
  className?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  label,
  value,
  unit,
  description,
  icon,
  variant = 'surface',
  className,
}) => {
  const variantStyles = {
    surface: 'bg-surface',
    cream: 'bg-surface-cream',
    container: 'bg-surface-container-low',
  };

  return (
    <div
      className={clsx(
        variantStyles[variant],
        'p-space-md flex flex-col justify-between min-h-[160px] border-0 rounded-none transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between gap-space-xs">
        <span className="font-label-md text-label-md text-ink-muted font-medium">
          {label}
        </span>
        {icon && <span className="text-ink-secondary">{icon}</span>}
      </div>
      <div className="mt-space-sm">
        <div className="font-numeric-hero text-numeric-hero-mobile md:text-numeric-hero text-ink-primary flex items-baseline leading-none">
          <span>{value}</span>
          {unit && (
            <span className="font-headline-md text-headline-md text-ink-muted ml-1.5 font-normal">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <p className="font-body-md text-body-md text-ink-secondary mt-space-xs leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
