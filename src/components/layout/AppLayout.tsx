
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({
  children
}: AppLayoutProps) {
  return <div className="min-h-screen bg-white flex flex-col">
      <DashboardHeader />
      <main className="flex-1 min-h-[calc(100vh-8rem)] pt-16 bg-neutral-50">
        {children}
      </main>
      <DashboardFooter />
    </div>;
}
