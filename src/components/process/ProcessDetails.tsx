
import React, { useState } from "react";
import { DatajudMovimentoProcessual, DatajudProcess, DatajudMovement } from "@/types/datajud";
import { ProcessHeader } from "./ProcessHeader";
import { ProcessNavigation } from "./ProcessNavigation";
import { ProcessInformation } from "./ProcessInformation";
import { ProcessPartiesList } from "./ProcessPartiesList";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProcessDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  mainProcess: DatajudProcess;
  onSave: () => Promise<boolean>;
  onCancel: () => void;
  isImport?: boolean;
  importProgress?: number;
  isPublicView?: boolean;
  isLoading?: boolean;
  handleProcessSelect?: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
}

export function ProcessDetails({
  processMovimentos,
  mainProcess,
  isImport = false,
  onSave,
  onCancel,
  importProgress = 0,
  isPublicView = false,
  isLoading = false,
  handleProcessSelect
}: ProcessDetailsProps) {
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentEventPage, setCurrentEventPage] = useState(1);
  const [currentIntimationPage, setCurrentIntimationPage] = useState(1);
  const [currentDocumentPage, setCurrentDocumentPage] = useState(1);
  
  // Se não existirem movimentos processuais múltiplos, utilizar o principal
  const currentMovimento = processMovimentos[currentMovimentoIndex] || processMovimentos[0];
  const currentProcess = currentMovimento.process;
  
  const totalMovimentos = processMovimentos.length;
  
  const handleNextMovimento = () => {
    if (currentMovimentoIndex < totalMovimentos - 1) {
      setCurrentMovimentoIndex(currentMovimentoIndex + 1);
    }
  };
  
  const handlePrevMovimento = () => {
    if (currentMovimentoIndex > 0) {
      setCurrentMovimentoIndex(currentMovimentoIndex - 1);
    }
  };

  const handleImportProcess = async () => {
    return await onSave();
  };

  // Filter events by code for each tab
  const allEvents = currentProcess.movimentos || [];
  
  // Pagination configuration
  const itemsPerPage = 5;
  
  // All events for the Events tab
  const paginateEvents = (events: DatajudMovement[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return events.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // Total pages calculation for pagination
  const getTotalPages = (items: any[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  // Events for different tabs
  const allEventsSorted = [...allEvents].sort((a, b) => 
    new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
  );
  
  // Intimations - filter by codes 12266 and 12265
  const intimationEvents = allEventsSorted.filter(event => 
    event.codigo === 12266 || event.codigo === 12265
  );
  
  // Documents - filter by code 581
  const documentEvents = allEventsSorted.filter(event => 
    event.codigo === 581
  );
  
  // Current page events
  const currentPageEvents = paginateEvents(allEventsSorted, currentEventPage);
  const currentPageIntimations = paginateEvents(intimationEvents, currentIntimationPage);
  const currentPageDocuments = paginateEvents(documentEvents, currentDocumentPage);
  
  // Parties data
  const partiesData = currentProcess.partes || [];

  // Format date for displaying
  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <ProcessHeader 
          currentProcess={currentProcess} 
          importProgress={importProgress}
          isImporting={isLoading}
          isPublicView={isPublicView}
        />
        
        {isImport && !isPublicView && (
          <Button 
            onClick={handleImportProcess}
            disabled={isLoading}
            className="bg-primary text-white ml-4"
          >
            {isLoading ? (
              <>Importando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> 
                Importar Processo
              </>
            )}
          </Button>
        )}
      </div>
      
      <ProcessNavigation
        currentMovimentoIndex={currentMovimentoIndex}
        totalMovimentos={totalMovimentos}
        handlePrevMovimento={handlePrevMovimento}
        handleNextMovimento={handleNextMovimento}
      />

      <ProcessInformation currentProcess={currentProcess} />
      
      <div className="mt-8 border-t pt-4">
        <Collapsible
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          className="w-full"
        >
          <CollapsibleTrigger className="w-full flex justify-between items-center py-2 hover:bg-gray-100 px-2 rounded-md">
            <span className="font-semibold">Detalhes do Processo</span>
            {isDetailsOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <Tabs defaultValue="eventos" className="w-full">
              <TabsList className="w-full grid grid-cols-6">
                <TabsTrigger value="eventos">Eventos</TabsTrigger>
                <TabsTrigger value="intimacoes">Intimações</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="decisao">Decisão</TabsTrigger>
                <TabsTrigger value="partes">Partes</TabsTrigger>
                <TabsTrigger value="inteiro-teor">Inteiro Teor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="eventos" className="mt-4">
                {allEventsSorted.length > 0 ? (
                  <div className="space-y-4">
                    {currentPageEvents.map((movimento, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">
                              #{index + 1 + (currentEventPage-1) * itemsPerPage} {movimento.nome}
                              {movimento.codigo && 
                                <span className="ml-2 text-sm text-gray-500">
                                  (Código: {movimento.codigo})
                                </span>
                              }
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatEventDate(movimento.dataHora)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Pagination 
                      currentPage={currentEventPage} 
                      totalPages={getTotalPages(allEventsSorted)}
                      onPageChange={setCurrentEventPage}
                    />
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma informação encontrada
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="intimacoes" className="mt-4">
                {intimationEvents.length > 0 ? (
                  <div className="space-y-4">
                    {currentPageIntimations.map((movimento, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">
                              #{index + 1 + (currentIntimationPage-1) * itemsPerPage} {movimento.nome}
                              {movimento.codigo && 
                                <span className="ml-2 text-sm text-gray-500">
                                  (Código: {movimento.codigo})
                                </span>
                              }
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatEventDate(movimento.dataHora)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Pagination 
                      currentPage={currentIntimationPage} 
                      totalPages={getTotalPages(intimationEvents)}
                      onPageChange={setCurrentIntimationPage}
                    />
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma informação encontrada
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="documentos" className="mt-4">
                {documentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {currentPageDocuments.map((movimento, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">
                              #{index + 1 + (currentDocumentPage-1) * itemsPerPage} {movimento.nome}
                              {movimento.codigo && 
                                <span className="ml-2 text-sm text-gray-500">
                                  (Código: {movimento.codigo})
                                </span>
                              }
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatEventDate(movimento.dataHora)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Pagination 
                      currentPage={currentDocumentPage} 
                      totalPages={getTotalPages(documentEvents)}
                      onPageChange={setCurrentDocumentPage}
                    />
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma informação encontrada
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="decisao" className="mt-4">
                <div className="p-4 text-center text-gray-500">
                  Nenhuma informação encontrada
                </div>
              </TabsContent>
              
              <TabsContent value="partes" className="mt-4">
                {partiesData.length > 0 ? (
                  <ProcessPartiesList parties={partiesData} />
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma informação encontrada
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="inteiro-teor" className="mt-4">
                <div className="p-4 text-center text-gray-500">
                  Nenhuma informação encontrada
                </div>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {mainProcess.assuntos && mainProcess.assuntos.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
          <AlertCircle className="text-yellow-500 w-5 h-5 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">
              Este processo não possui assuntos cadastrados no DataJud. 
              Você poderá adicionar assuntos manualmente após a importação.
            </p>
          </div>
        </div>
      )}
      
      {isPublicView && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          Esta consulta pública é fornecida apenas para fins informativos.
          Os dados são provenientes da API DataJud e podem estar incompletos ou desatualizados.
        </p>
      )}
    </div>
  );
}
