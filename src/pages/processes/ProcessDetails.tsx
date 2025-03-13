
import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';

// Component that was missing a default export
export default function ProcessDetailsPage() {
  const { id } = useParams();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Detalhes do Processo</h1>
        <Card className="p-6">
          <p>Carregando detalhes do processo {id}...</p>
        </Card>
      </div>
    </MainLayout>
  );
}
