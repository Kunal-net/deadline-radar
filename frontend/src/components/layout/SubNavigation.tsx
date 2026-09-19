import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export interface SubNavItem {
  label: string;
  path: string;
  badge?: string;
  indicator?: boolean;
}

export interface SubNavigationProps {
  items: SubNavItem[];
  statusText?: string;
  rightContent?: React.ReactNode;
}

export const SubNavigation: React.FC<SubNavigationProps> = ({
  items,
  statusText,
  rightContent,
}) => {
  return (
    <nav aria-label="Secondary navigation" className="w-full bg-surface-container-low border-b border-border-hairline">
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xs flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
          {items.map((item, idx) => (
            <React.Fragment key={item.path}>
              {idx > 0 && <span className="text-ink-muted text-[11px] select-none">/</span>}
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'font-label-md text-label-md transition-colors duration-150 flex items-center gap-1.5 px-space-xs sm:px-space-sm py-1 rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary',
                    isActive
                      ? 'font-semibold text-ink-primary bg-surface-cream'
                      : 'text-ink-secondary hover:text-ink-primary'
                  )
                }
              >
                {item.indicator && (
                  <span className="w-1.5 h-1.5 bg-accent-terracotta shrink-0" />
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="font-label-md text-[11px] px-1.5 py-0.5 bg-ink-primary text-canvas-paper rounded-none">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </React.Fragment>
          ))}
        </div>

        {(statusText || rightContent) && (
          <div className="hidden sm:flex items-center gap-space-xs text-ink-muted font-label-md text-label-md shrink-0">
            {statusText && <span>{statusText}</span>}
            {rightContent}
          </div>
        )}
      </div>
    </nav>
  );
};
