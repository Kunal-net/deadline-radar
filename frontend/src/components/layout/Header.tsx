import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border-hairline">
      <div className="h-20 w-full px-margin-mobile md:px-margin-tablet lg:px-margin flex items-center justify-between gap-gutter">
        {/* Brand Anchor */}
        <div className="flex items-center gap-space-sm shrink-0">
          <Link to="/today" className="flex items-center gap-space-xs group">
            <img
              src="/assets/logo-wordmark.svg"
              alt="Deadline Radar Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Primary Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <Navigation />
        </div>

        {/* Action Elements */}
        <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={<span className="material-symbols-outlined text-[18px]">add</span>}
            onClick={() => navigate('/work/new')}
          >
            Add Work
          </Button>

          <Link
            to="/settings"
            aria-label="User Preferences & Settings"
            className="shrink-0 focus:outline-none focus:ring-1 focus:ring-ink-primary"
          >
            <img
              src="/assets/user-avatar.jpg"
              alt="User Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-border-hairline"
            />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="md:hidden p-1 text-ink-primary hover:text-accent-terracotta focus:outline-none"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-hairline bg-surface px-margin-mobile py-space-md flex flex-col gap-space-sm shadow-sm">
          <Navigation
            className="flex-col items-start gap-space-xs"
            onItemClick={() => setMobileMenuOpen(false)}
          />
          <div className="pt-space-xs border-t border-border-hairline flex justify-between items-center text-label-md text-ink-muted">
            <Link
              to="/timeline"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-ink-primary"
            >
              Timeline
            </Link>
            <Link
              to="/calendar"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-ink-primary"
            >
              Calendar
            </Link>
            <Link
              to="/workload"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-ink-primary"
            >
              Workload
            </Link>
            <Link
              to="/priorities"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-ink-primary"
            >
              Priorities
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
