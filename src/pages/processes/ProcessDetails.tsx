
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { getProcessById } from '@/services/processService';
import { getProcessDetailsById } from '@/services/process-details';
import { getMovementsByProcessId } from '@/services/process-movements';
import { getPartiesByProcessId } from '@/services/process-parties';
import { getSubjectsByProcessId } from '@/services/process-subjects';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProcessDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchProcessData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch all process related data in parallel
        const [processData, detailsData, movementsData, partiesData, subjectsData] = await Promise.all([
          getProcessById(id),
          getProcessDetailsById(id).catch(() => null),
          getMovementsByProcessId(id).catch(() => []),
          getPartiesByProcessId(id).catch(() => []),
          getSubjectsByProcessId(id).catch(() => [])
        ]);
        
        setProcess(processData);
        setDetails(detailsData);
        setMovements(movementsData);
        setParties(partiesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching process data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcessData();
  }, [id]);
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Detalhes do Processo</h1>
        
        {loading ? (
          <Card className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </Card>
        ) : process ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">{process.title}</h2>
            <p className="text-gray-600 mb-4">Número: {process.number}</p>
            
            {details && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Informações do Processo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Tribunal:</span> {details.tribunal}</p>
                    <p><span className="font-medium">Órgão Julgador:</span> {details.orgao_julgador?.nome}</p>
                    <p><span className="font-medium">Data de Ajuizamento:</span> {new Date(details.data_ajuizamento).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Grau:</span> {details.grau}</p>
                    <p><span className="font-medium">Sistema:</span> {details.sistema?.nome}</p>
                    <p><span className="font-medium">Classe:</span> {details.classe?.nome}</p>
                  </div>
                </div>
              </div>
            )}
            
            {subjects && subjects.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Assuntos</h3>
                <ul className="list-disc pl-5">
                  {subjects.map((subject, index) => (
                    <li key={index}>{subject.nome}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {parties && parties.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Partes</h3>
                <div className="space-y-3">
                  {parties.map((party, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p><span className="font-medium">{party.papel}:</span> {party.nome}</p>
                      {party.documento && <p><span className="font-medium">Documento:</span> {party.documento}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {movements && movements.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Movimentações</h3>
                <div className="space-y-3">
                  {movements.slice(0, 5).map((movement, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">{movement.nome}</p>
                      <p className="text-sm text-gray-600">{new Date(movement.data_hora).toLocaleDateString()}</p>
                      {movement.complemento && <p className="text-sm mt-1">{movement.complemento}</p>}
                    </div>
                  ))}
                  {movements.length > 5 && (
                    <p className="text-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      Ver mais movimentações ({movements.length - 5})
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <p>Processo não encontrado</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
