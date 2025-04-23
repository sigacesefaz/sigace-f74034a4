import React from 'react';
import { Link } from 'react-router-dom';
import { NavMenu } from '@/components/navigation/NavMenu';
import { ManagementFooter } from '@/components/ManagementFooter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=64&h=64&fit=crop&auto=format" 
                  alt="SIGPRO Logo" 
                  className="h-12 object-contain"
                />
              </Link>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary">SIGPRO</span>
                <span className="text-xs text-gray-500">Sistema de Gestão de Processos</span>
              </div>
            </div>
            <NavMenu />
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-8 bg-gray-50 mt-16">
        {children}
      </main>

      <ManagementFooter />
    </div>
  );
}
