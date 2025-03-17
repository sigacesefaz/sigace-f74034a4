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
      {/* Header - Estilo institucional */}
      <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <img 
                  src="/images/logo_sefaz_estado.png" 
                  alt="Governo do Tocantins" 
                  className="h-12 object-contain"
                  style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0))" }}
                />
              </Link>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#2e3092]">SIGACE</span>
                <span className="text-xs text-gray-500">Secretaria da Fazenda do Tocantins</span>
              </div>
            </div>
            <NavMenu />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50 mt-16">
        {children}
      </main>

      {/* Footer */}
      <ManagementFooter />
    </div>
  );
}
