import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
      <Header />
      <main className="w-full pt-20 flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
