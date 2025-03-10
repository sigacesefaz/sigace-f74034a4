
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatajudProcess, DatajudHit } from "@/types/datajud";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  UserCircle, 
  GavelIcon, 
  FileText, 
  Bookmark, 
  AlertCircle, 
  Users, 
  Clock,
  Bell,
  File,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarIcon
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/shared/Pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface for the component props
interface ProcessDetailsProps {
  processHits: DatajudHit[];
  mainProcess: DatajudProcess;
  onSave: () => void;
  onCancel: () => void;
  isImport?: boolean;
}

// A helper function to format process numbers
const formatProcessNumber = (number: string) => {
  if (!number) return "";
  const numericOnly = number.replace(/\D/g, '');
  if (numericOnly.length !== 20) return number;
  return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
};

export function ProcessDetails({ processHits, mainProcess, onSave, onCancel, isImport = true }: ProcessDetailsProps) {
  const [currentTab, setCurrentTab] = useState("overview");
  const [selectedHitIndex, setSelectedHitIndex] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filtering state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateFilter, setDateFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  // Get the currently selected hit
  const selectedHit = processHits[selectedHitIndex];
  const selectedProcess = selectedHit?.process || mainProcess;

  // Formatar data para exibição
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error, dateString);
      return "Data inválida";
    }
  };

  // Formatar data com hora para exibição
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data/hora:", error, dateString);
      return "Data inválida";
    }
  };

  // Filter and sort movements based on current filters
  const filteredMovements = useMemo(() => {
    if (!selectedProcess.movimentos || !Array.isArray(selectedProcess.movimentos)) {
      return [];
    }
    
    return selectedProcess.movimentos
      .filter(movement => {
        const matchesCode = codeFilter ? 
          movement.codigo?.toString().includes(codeFilter) : true;
        
        const matchesName = nameFilter ? 
          movement.nome?.toLowerCase().includes(nameFilter.toLowerCase()) : true;
        
        const matchesDate = dateFilter ? 
          (movement.dataHora && movement.dataHora.includes(dateFilter)) : true;
        
        return matchesCode && matchesName && matchesDate;
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.dataHora || '');
          const dateB = new Date(b.dataHora || '');
          return sortOrder === "desc" ? 
            dateB.getTime() - dateA.getTime() : 
            dateA.getTime() - dateB.getTime();
        } catch (error) {
          return 0;
        }
      });
  }, [selectedProcess.movimentos, sortOrder, dateFilter, codeFilter, nameFilter]);

  // Intimations - filter for movement codes 12265 and 12266 or names containing "intima"
  const filteredIntimations = useMemo(() => {
    return filteredMovements.filter(movement => 
      movement.codigo?.toString() === "12265" || 
      movement.codigo?.toString() === "12266" || 
      (movement.nome && movement.nome.toLowerCase().includes("intima"))
    );
  }, [filteredMovements]);

  // Documents - filter for movement code 581
  const filteredDocuments = useMemo(() => {
    return filteredMovements.filter(movement => 
      movement.codigo?.toString() === "581"
    );
  }, [filteredMovements]);

  // Decisions - filter for names containing "decisão", "sentença" or "despacho"
  const filteredDecisions = useMemo(() => {
    return filteredMovements.filter(movement => 
      movement.nome && (
        movement.nome.toLowerCase().includes("decisão") || 
        movement.nome.toLowerCase().includes("sentença") || 
        movement.nome.toLowerCase().includes("despacho")
      )
    );
  }, [filteredMovements]);

  // Get paginated items for the current tab
  const getPaginatedItems = () => {
    let items: any[] = [];
    
    switch(currentTab) {
      case "movements":
        items = filteredMovements;
        break;
      case "intimations":
        items = filteredIntimations;
        break;
      case "documents":
        items = filteredDocuments;
        break;
      case "decisions":
        items = filteredDecisions;
        break;
      default:
        items = [];
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate total pages for the current tab
  const getTotalPages = () => {
    let totalItems = 0;
    
    switch(currentTab) {
      case "movements":
        totalItems = filteredMovements.length;
        break;
      case "intimations":
        totalItems = filteredIntimations.length;
        break;
      case "documents":
        totalItems = filteredDocuments.length;
        break;
      case "decisions":
        totalItems = filteredDecisions.length;
        break;
      default:
        totalItems = 0;
    }
    
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  };

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, selectedHitIndex]);

  // Reset to page 1 when changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder, dateFilter, codeFilter, nameFilter]);

  // Handles tab changes
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  // Navigate between hits
  const handleHitChange = (index: number) => {
    if (index >= 0 && index < processHits.length) {
      setSelectedHitIndex(index);
    }
  };

  // Render filter controls based on current tab
  const renderFilterControls = () => {
    if (currentTab === "overview") return null;
    
    return (
      <div className="flex items-center justify-between mb-4">
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Mais recentes primeiro</SelectItem>
            <SelectItem value="asc">Mais antigos primeiro</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex space-x-2">
          <div className="relative">
            <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Data" 
              className="pl-8 w-32" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <Input 
            placeholder="Nome do movimento" 
            className="w-48" 
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <Input 
            placeholder="Código" 
            className="w-24" 
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formatProcessNumber(mainProcess.numeroProcesso)}
              </h2>
              <p className="text-gray-500 text-sm">
                Classe: {mainProcess.classe?.nome || "Não informado"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={onSave}>
                {isImport ? 'Importar Processo' : 'Salvar Processo'}
              </Button>
            </div>
          </div>
        </div>

        {processHits.length > 1 && (
          <div className="p-4 bg-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Este processo possui {processHits.length} hits relacionados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleHitChange(selectedHitIndex - 1)}
                  disabled={selectedHitIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {selectedHitIndex + 1} de {processHits.length}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleHitChange(selectedHitIndex + 1)}
                  disabled={selectedHitIndex === processHits.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" value={currentTab} onValueChange={handleTabChange}>
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="movements">Movimentação</TabsTrigger>
              <TabsTrigger value="intimations">Intimação</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="decisions">Decisão</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-4">
            <h3 className="text-lg font-medium mb-4">Detalhes do Processo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Data de Ajuizamento</p>
                  <p className="text-gray-600">{formatDate(selectedProcess.dataAjuizamento)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <GavelIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Sistema</p>
                  <p className="text-gray-600">{selectedProcess.sistema?.nome || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Órgão Julgador</p>
                  <p className="text-gray-600">{selectedProcess.orgaoJulgador?.nome || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Nível de Sigilo</p>
                  <Badge variant={selectedProcess.nivelSigilo ? "destructive" : "outline"}>
                    {selectedProcess.nivelSigilo ? `Nível ${selectedProcess.nivelSigilo}` : "Público"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Grau</p>
                  <p className="text-gray-600">{selectedProcess.grau || "Não informado"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Assuntos</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProcess.assuntos && selectedProcess.assuntos.length > 0 ? (
                  selectedProcess.assuntos.map((assunto, index) => (
                    <Badge key={index} variant="secondary">
                      {assunto.nome}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum assunto registrado</p>
                )}
              </div>
            </div>

            {isImport && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Resumo dos Dados a Importar</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 border rounded bg-gray-50">
                      <h4 className="font-medium text-sm">Processo Principal</h4>
                      <ul className="mt-2 text-sm">
                        <li><span className="font-medium">Processo:</span> {formatProcessNumber(mainProcess.numeroProcesso)}</li>
                        <li><span className="font-medium">Tribunal:</span> {mainProcess.tribunal || "Não informado"}</li>
                        <li><span className="font-medium">Classe:</span> {mainProcess.classe?.nome || "Não informado"}</li>
                      </ul>
                    </div>

                    <div className="p-3 border rounded bg-gray-50">
                      <h4 className="font-medium text-sm">Hits Relacionados</h4>
                      <ul className="mt-2 text-sm">
                        <li><span className="font-medium">Total de Hits:</span> {processHits.length}</li>
                        <li><span className="font-medium">Hit atual:</span> {selectedHitIndex + 1}</li>
                        <li><span className="font-medium">Sigilo:</span> {selectedProcess.nivelSigilo || "Público"}</li>
                      </ul>
                    </div>

                    <div className="p-3 border rounded bg-gray-50">
                      <h4 className="font-medium text-sm">Informações Temporais</h4>
                      <ul className="mt-2 text-sm">
                        <li><span className="font-medium">Data de Ajuizamento:</span> {formatDate(selectedProcess.dataAjuizamento)}</li>
                        <li><span className="font-medium">Última Atualização:</span> {formatDate(selectedProcess.dataHoraUltimaAtualizacao)}</li>
                        <li><span className="font-medium">Movimento mais recente:</span> {filteredMovements.length > 0 ? formatDate(filteredMovements[0].dataHora) : "Não disponível"}</li>
                      </ul>
                    </div>
                  </div>

                  {selectedProcess.partes && selectedProcess.partes.length > 0 && (
                    <div className="p-3 border rounded bg-gray-50">
                      <h4 className="font-medium text-sm">Partes do Processo</h4>
                      <div className="mt-2 text-sm max-h-32 overflow-y-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left">
                              <th className="pr-2">Papel</th>
                              <th>Nome</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProcess.partes.map((parte, index) => (
                              <tr key={index} className="border-t">
                                <td className="pr-2 py-1">{parte.papel}</td>
                                <td className="py-1">{parte.nome}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-md text-sm">
                    <p className="font-medium text-yellow-800">
                      Atenção: Todos os dados acima serão importados para o banco de dados, incluindo todos os hits relacionados. Verifique se estão corretos antes de prosseguir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="p-4">
            <h3 className="text-lg font-medium mb-4">Movimentações</h3>
            {renderFilterControls()}
            
            <ScrollArea className="h-[400px]">
              {getPaginatedItems().length > 0 ? (
                <div className="space-y-3">
                  {getPaginatedItems().map((movement, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="mr-2">
                              #{((currentPage - 1) * itemsPerPage) + index + 1}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-100">
                              Código: {movement.codigo}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{movement.nome}</h4>
                          <div className="text-sm text-gray-500">
                            <p>{formatDateTime(movement.dataHora)}</p>
                          </div>
                        </div>
                      </div>
                      {movement.complementosTabelados && movement.complementosTabelados.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium">Complementos:</p>
                          <ul className="text-xs text-gray-600 pl-2">
                            {movement.complementosTabelados.map((comp, idx) => (
                              <li key={idx}>• {comp.descricao || comp.nome}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma movimentação encontrada</p>
              )}
            </ScrollArea>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={getTotalPages()}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="intimations" className="p-4">
            <h3 className="text-lg font-medium mb-4">Intimações</h3>
            {renderFilterControls()}
            
            <ScrollArea className="h-[400px]">
              {getPaginatedItems().length > 0 ? (
                <div className="space-y-3">
                  {getPaginatedItems().map((movement, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="mr-2">
                              #{((currentPage - 1) * itemsPerPage) + index + 1}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-100">
                              Código: {movement.codigo}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{movement.nome}</h4>
                          <div className="text-sm text-gray-500">
                            <p>{formatDateTime(movement.dataHora)}</p>
                          </div>
                        </div>
                        <Badge className="ml-2" variant="outline">Intimação</Badge>
                      </div>
                      {movement.complementosTabelados && movement.complementosTabelados.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium">Complementos:</p>
                          <ul className="text-xs text-gray-600 pl-2">
                            {movement.complementosTabelados.map((comp, idx) => (
                              <li key={idx}>• {comp.descricao || comp.nome}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma intimação encontrada</p>
              )}
            </ScrollArea>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={getTotalPages()}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="documents" className="p-4">
            <h3 className="text-lg font-medium mb-4">Documentos</h3>
            {renderFilterControls()}
            
            <ScrollArea className="h-[400px]">
              {getPaginatedItems().length > 0 ? (
                <div className="space-y-3">
                  {getPaginatedItems().map((movement, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="mr-2">
                              #{((currentPage - 1) * itemsPerPage) + index + 1}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-100">
                              Código: {movement.codigo}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{movement.nome}</h4>
                          <div className="text-sm text-gray-500">
                            <p>{formatDateTime(movement.dataHora)}</p>
                          </div>
                        </div>
                        <Badge className="ml-2" variant="outline">Documento</Badge>
                      </div>
                      {movement.complementosTabelados && movement.complementosTabelados.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium">Complementos:</p>
                          <ul className="text-xs text-gray-600 pl-2">
                            {movement.complementosTabelados.map((comp, idx) => (
                              <li key={idx}>• {comp.descricao || comp.nome}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum documento encontrado</p>
              )}
            </ScrollArea>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={getTotalPages()}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="decisions" className="p-4">
            <h3 className="text-lg font-medium mb-4">Decisões</h3>
            {renderFilterControls()}
            
            <ScrollArea className="h-[400px]">
              {getPaginatedItems().length > 0 ? (
                <div className="space-y-3">
                  {getPaginatedItems().map((movement, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="mr-2">
                              #{((currentPage - 1) * itemsPerPage) + index + 1}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-100">
                              Código: {movement.codigo}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{movement.nome}</h4>
                          <div className="text-sm text-gray-500">
                            <p>{formatDateTime(movement.dataHora)}</p>
                          </div>
                        </div>
                        <Badge className="ml-2" variant="outline">Decisão</Badge>
                      </div>
                      {movement.complementosTabelados && movement.complementosTabelados.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium">Complementos:</p>
                          <ul className="text-xs text-gray-600 pl-2">
                            {movement.complementosTabelados.map((comp, idx) => (
                              <li key={idx}>• {comp.descricao || comp.nome}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma decisão encontrada</p>
              )}
            </ScrollArea>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={getTotalPages()}
              onPageChange={setCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
