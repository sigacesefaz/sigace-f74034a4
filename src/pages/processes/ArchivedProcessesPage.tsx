
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Footer } from '@/components/Footer';

export default function ArchivedProcessesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Processos Arquivados</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="text-gray-500">Não há processos arquivados no momento.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
