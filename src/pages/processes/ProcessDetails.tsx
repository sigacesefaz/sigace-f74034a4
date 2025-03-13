
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
import { DatajudProcess, DatajudMovimentoProcessual } from '@/types/datajud';
import { ProcessHeader } from '@/components/process/ProcessHeader';
import { ProcessPartiesList } from '@/components/process/ProcessPartiesList';
import { ProcessNavigation } from '@/components/process/ProcessNavigation';
import { toast } from '@/hooks/use-toast';

export default function ProcessDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [movements, setMovements] = useState<DatajudMovimentoProcessual[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
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

  const handlePrevMovimento = () => {
    if (currentMovimentoIndex > 0) {
      setCurrentMovimentoIndex(currentMovimentoIndex - 1);
    }
  };

  const handleNextMovimento = () => {
    if (currentMovimentoIndex < movements.length - 1) {
      setCurrentMovimentoIndex(currentMovimentoIndex + 1);
    }
  };

  const handleImportProcess = async () => {
    setIsImporting(true);
    try {
      // Simulate import process with progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      toast({
        title: "Processo importado com sucesso",
        description: "O processo foi importado para o sistema.",
      });
    } catch (error) {
      console.error("Error importing process:", error);
      toast({
        title: "Erro ao importar processo",
        description: "Não foi possível importar o processo.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Detalhes do Processo</h1>
      
      {loading ? (
        <Card className="p-4 sm:p-6">
          <Skeleton className="h-6 w-3/4 mb-2 sm:mb-4" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      ) : process ? (
        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {details && (
            <ProcessHeader 
              currentProcess={details}
              importProgress={importProgress}
              isImporting={isImporting}
              handleImportProcess={handleImportProcess}
            />
          )}
          
          {/* Navigation between movimentos */}
          {movements && movements.length > 0 && (
            <ProcessNavigation
              currentMovimentoIndex={currentMovimentoIndex}
              totalMovimentos={movements.length}
              handlePrevMovimento={handlePrevMovimento}
              handleNextMovimento={handleNextMovimento}
            />
          )}
          
          {/* Process details content */}
          <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left column */}
            <div className="space-y-4 sm:space-y-6">
              {subjects && subjects.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Assuntos</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {subjects.map((subject, index) => (
                      <li key={index}>{subject.nome}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {movements && movements.length > 0 && movements[currentMovimentoIndex] && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Movimentação atual</h3>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-md">
                    <p className="font-medium">
                      {movements[currentMovimentoIndex].process.movimentos && 
                       movements[currentMovimentoIndex].process.movimentos[0]?.nome}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {movements[currentMovimentoIndex].process.movimentos && 
                       movements[currentMovimentoIndex].process.movimentos[0]?.dataHora && 
                       new Date(movements[currentMovimentoIndex].process.movimentos[0].dataHora).toLocaleDateString()}
                    </p>
                    {movements[currentMovimentoIndex].process.movimentos && 
                     movements[currentMovimentoIndex].process.movimentos[0]?.complemento && (
                      <p className="mt-2 text-xs sm:text-sm">
                        {movements[currentMovimentoIndex].process.movimentos[0].complemento}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column */}
            <div>
              <ProcessPartiesList parties={parties} />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-6">
          <p>Processo não encontrado</p>
        </Card>
      )}
    </div>
  );
}
