import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      <main className="flex-1 bg-gray-50 min-h-[calc(100vh-8rem)]">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}
