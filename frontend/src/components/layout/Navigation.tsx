import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Today', path: '/today' },
  { label: 'Radar', path: '/radar' },
  { label: 'Work', path: '/work' },
  { label: 'Planning', path: '/planning' },
  { label: 'Insights', path: '/insights' },
];

export interface NavigationProps {
  className?: string;
  onItemClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ className, onItemClick }) => {
  return (
    <nav className={clsx('flex items-center gap-space-sm lg:gap-space-md', className)}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className={({ isActive }) =>
            clsx(
              'font-label-lg text-label-lg transition-colors duration-150 rounded-none px-space-sm py-space-xs',
              isActive
                ? 'bg-surface-cream text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
