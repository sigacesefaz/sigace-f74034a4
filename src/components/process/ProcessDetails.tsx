import React, { useState } from "react";
import { DatajudMovimentoProcessual, DatajudProcess, DatajudMovement } from "@/types/datajud";
import { ProcessHeader } from "./ProcessHeader";
import { ProcessNavigation } from "./ProcessNavigation";
import { ProcessInformation } from "./ProcessInformation";
import { ProcessPartiesList } from "./ProcessPartiesList";
import { ProcessMovements } from "./ProcessMovements";
import { ProcessDecisions } from "./ProcessDecisions";
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
  const [showEventFilter, setShowEventFilter] = useState(false);

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
  const allEventsSorted = [...allEvents].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

  // Intimations - filter by codes 12266 and 12265
  const intimationEvents = allEventsSorted.filter(event => event.codigo === 12266 || event.codigo === 12265);

  // Documents - filter by code 581
  const documentEvents = allEventsSorted.filter(event => event.codigo === 581);

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
  return <div className="space-y-3">
      <div className="flex items-center gap-2 justify-end">
        {mainProcess.assuntos && mainProcess.assuntos.length === 0 && (
          <div className="w-64 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
            <AlertCircle className="text-yellow-500 w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700">
              Este processo não possui assuntos cadastrados no DataJud. 
              Você poderá adicionar assuntos manualmente após a importação.
            </p>
          </div>
        )}
        
        {isImport && !isPublicView && (
          <Button 
            onClick={handleImportProcess} 
            disabled={isLoading} 
            className="bg-primary text-white" 
            size="sm"
          >
            {isLoading ? (
              <>Importando...</>
            ) : (
              <>
                <Save className="w-3 h-3 mr-1" /> 
                <span className="hidden sm:inline">Importar Processo</span>
                <span className="sm:hidden">+</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="relative">
        <ProcessHeader currentProcess={currentProcess} importProgress={importProgress} isImporting={isLoading} isPublicView={isPublicView} />
      </div>
      
      <ProcessNavigation currentMovimentoIndex={currentMovimentoIndex} totalMovimentos={totalMovimentos} handlePrevMovimento={handlePrevMovimento} handleNextMovimento={handleNextMovimento} />

      <ProcessInformation currentProcess={currentProcess} />
      
      <div className="border-t pt-2">
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
          <div className="flex justify-between items-center">
            <CollapsibleTrigger className="w-full flex justify-between items-center py-1 hover:bg-gray-100 px-2 rounded-md">
              <span className="font-semibold">Detalhes do Processo</span>
              {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-2">
            <Tabs defaultValue="eventos" className="w-full">
              <TabsList className="w-full grid grid-cols-6">
                <TabsTrigger value="eventos" className="text-xs py-1">Eventos</TabsTrigger>
                <TabsTrigger value="intimacoes" className="text-xs py-1">Intimações</TabsTrigger>
                <TabsTrigger value="documentos" className="text-xs py-1">Documentos</TabsTrigger>
                <TabsTrigger value="decisao" className="text-xs py-1">Decisão</TabsTrigger>
                <TabsTrigger value="partes" className="text-xs py-1">Partes</TabsTrigger>
                <TabsTrigger value="inteiro-teor" className="text-xs py-1">Inteiro Teor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="eventos" className="mt-2 max-h-[60vh] overflow-auto">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {allEventsSorted.length > 0 && <Pagination currentPage={currentEventPage} totalPages={getTotalPages(allEventsSorted)} onPageChange={setCurrentEventPage} className="my-1 justify-start" />}
                    </div>
                  </div>
                  
                  {showEventFilter && <div className="bg-gray-50 p-3 rounded-md space-y-2 mb-3 border">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p className="text-sm text-gray-500">Filtros em desenvolvimento...</p>
                      </div>
                    </div>}
                  
                  {allEventsSorted.length > 0 ? <div className="space-y-2 pb-2">
                      {currentPageEvents.map((movimento, index) => <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm">
                                #{index + 1 + (currentEventPage - 1) * itemsPerPage} {movimento.nome}
                                {movimento.codigo && <span className="ml-1 text-xs text-gray-500">
                                    (Código: {movimento.codigo})
                                  </span>}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatEventDate(movimento.dataHora)}
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div> : <div className="p-2 text-center text-gray-500 text-sm">
                      Nenhuma informação encontrada
                    </div>}
                </div>
              </TabsContent>
              
              <TabsContent value="intimacoes" className="mt-2 max-h-[60vh] overflow-auto">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {intimationEvents.length > 0 && <Pagination currentPage={currentIntimationPage} totalPages={getTotalPages(intimationEvents)} onPageChange={setCurrentIntimationPage} className="my-1 justify-start" />}
                    </div>
                  </div>
                  
                  {intimationEvents.length > 0 ? <div className="space-y-2 pb-2">
                      {currentPageIntimations.map((movimento, index) => <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm">
                                #{index + 1 + (currentIntimationPage - 1) * itemsPerPage} {movimento.nome}
                                {movimento.codigo && <span className="ml-1 text-xs text-gray-500">
                                    (Código: {movimento.codigo})
                                  </span>}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatEventDate(movimento.dataHora)}
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div> : <div className="p-2 text-center text-gray-500 text-sm">
                      Nenhuma intimação encontrada
                    </div>}
                </div>
              </TabsContent>
              
              <TabsContent value="documentos" className="mt-2 max-h-[60vh] overflow-auto">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {documentEvents.length > 0 && <Pagination currentPage={currentDocumentPage} totalPages={getTotalPages(documentEvents)} onPageChange={setCurrentDocumentPage} className="my-1 justify-start" />}
                    </div>
                  </div>
                  
                  {documentEvents.length > 0 ? <div className="space-y-2 pb-2">
                      {currentPageDocuments.map((movimento, index) => <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm">
                                #{index + 1 + (currentDocumentPage - 1) * itemsPerPage} {movimento.nome}
                                {movimento.codigo && <span className="ml-1 text-xs text-gray-500">
                                    (Código: {movimento.codigo})
                                  </span>}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatEventDate(movimento.dataHora)}
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div> : <div className="p-2 text-center text-gray-500 text-sm">
                      Nenhum documento encontrado
                    </div>}
                </div>
              </TabsContent>
              
              <TabsContent value="decisao" className="mt-2 max-h-[60vh] overflow-auto">
                <div className="p-2 text-center text-gray-500 text-sm">
                  Nenhuma informação encontrada
                </div>
              </TabsContent>
              
              <TabsContent value="partes" className="mt-2 max-h-[60vh] overflow-auto">
                {partiesData.length > 0 ? <ProcessPartiesList parties={partiesData} /> : <div className="p-2 text-center text-gray-500 text-sm">
                    Nenhuma informação encontrada
                  </div>}
              </TabsContent>
              
              <TabsContent value="inteiro-teor" className="mt-2 max-h-[60vh] overflow-auto">
                <div className="p-2 text-center text-gray-500 text-sm">
                  Nenhuma informação encontrada
                </div>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      
      {isPublicView && <p className="text-xs text-gray-500 text-center">
          Esta consulta pública é fornecida apenas para fins informativos.
          Os dados são provenientes da API DataJud e podem estar incompletos ou desatualizados.
        </p>}
    </div>;
}
