import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const ProductView: React.FC = () => {
  return (
    <div className="w-full flex flex-col">
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-xl pb-space-2xl">
        <div className="max-w-4xl mx-auto flex flex-col gap-space-lg text-center items-center">
          <div className="inline-flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-accent-terracotta" />
            <span className="font-label-md text-label-md uppercase tracking-widest text-ink-secondary">
              Personal Time Intelligence
            </span>
          </div>

          <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-ink-primary tracking-tight">
            Human capacity first. Zero residual guilt.
          </h1>

          <p className="font-body-xl text-body-xl text-ink-secondary max-w-2xl leading-relaxed">
            Deadline Radar is an editorial time-intelligence instrument that reveals whether your commitments realistically fit your available hours.
          </p>

          <div className="pt-space-md flex flex-wrap items-center justify-center gap-space-md">
            <Link to="/today">
              <Button variant="primary" size="lg" showArrow>
                Open Daily Brief
              </Button>
            </Link>
            <Link to="/radar">
              <Button variant="outline" size="lg">
                Explore Radar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
