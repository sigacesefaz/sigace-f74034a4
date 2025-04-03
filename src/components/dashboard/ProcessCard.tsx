import { useState } from "react";
import { Eye, Trash, Printer, Share2, RefreshCw, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Process } from "@/types/process";
import { formatProcessNumber } from "@/utils/format";
import { ProcessHitsNavigation } from "@/components/process/ProcessHitsNavigation";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateProcess } from "@/services/processUpdateService";
import { toast } from "sonner";

interface ProcessCardProps {
  process: Process;
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onView?: (id: string) => void;
  onShare?: (process: Process) => void;
  onPrint?: (process: Process) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isLoading?: boolean;
  relatedHits?: Process[];
}

export function ProcessCard({
  process,
  onDelete,
  onRefresh,
  onView,
  onShare,
  onPrint,
  isSelected,
  onToggleSelect,
  isLoading,
  relatedHits = []
}: ProcessCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [refreshing, setRefreshing] = useState(false);
  const { confirm } = useConfirmDialog();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não informada";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const processNumber = formatProcessNumber(process.number);
  const title = process.title || `Processo ${processNumber}`;
  const status = process.status || "Em andamento";
  const court = process.court || "Não informado";
  const createdAt = formatDate(process.created_at);
  const updatedAt = formatDate(process.updated_at);

  const mainSubject = process.metadata?.assuntos?.[0];
  const subjectName = mainSubject?.nome || "Assunto não informado";
  const subjectCode = mainSubject?.codigo;

  const processClass = process.metadata?.classe?.nome || "Não informado";
  const processClassCode = process.metadata?.classe?.codigo;

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const confirmed = await confirm({
        title: "Atualizar processo",
        description: `Deseja verificar agora se há atualizações para o processo ${processNumber}?`,
        confirmText: "Atualizar",
        cancelText: "Cancelar"
      });
      
      if (!confirmed) return;
      
      setRefreshing(true);
      
      const success = await updateProcess(process.id);
      
      if (success && onRefresh) {
        onRefresh(process.id);
      }
    } catch (error) {
      console.error("Erro ao atualizar processo:", error);
      toast.error("Ocorreu um erro ao atualizar o processo");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="bg-gray-50 p-2">
        <div className="flex flex-wrap items-start justify-between gap-1">
          <div className="flex items-start gap-1">
            {onToggleSelect && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => onToggleSelect(process.id)} 
                className="mt-1"
              />
            )}
            <div>
              <CardTitle className="text-lg font-medium text-gray-900">
                {title}
              </CardTitle>
              <div className="flex flex-col space-y-1">
                <div className="flex items-baseline gap-1">
                  <Badge variant={status === "Em andamento" ? "secondary" : "outline"}>
                    {status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {processNumber}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <Badge 
                    variant="default" 
                    className="bg-indigo-500 hover:bg-indigo-600 font-medium whitespace-normal text-xs text-white"
                    title={`${subjectName}${subjectCode ? ` (${subjectCode})` : ''}`}
                  >
                    {subjectName}
                    {subjectCode && (
                      <span className="ml-1 opacity-90">({subjectCode})</span>
                    )}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">
                      Data Ajuizamento: {formatDate(process.metadata?.dataAjuizamento)}
                    </Badge>
                    <Badge variant="outline">
                      Tribunal: {court}
                    </Badge>
                    <Badge variant="outline">
                      Grau: {process.metadata?.grau || "G1"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isLoading || refreshing}
                className="h-7 px-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {onPrint && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrint(process);
                }}
                className="h-7 px-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                title="Imprimir processo"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            
            {onView && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(process.id);
                }}
                className="h-7 px-2 text-green-500 hover:bg-green-50 hover:text-green-700"
                title="Visualizar processo"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {onShare && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(process);
                }}
                className="h-7 px-2 text-orange-500 hover:bg-orange-50 hover:text-orange-700"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(process.id);
                }}
                disabled={isLoading}
                className="h-7 px-2 text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2">
        <div>
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Criado em:</span> {createdAt}
            </div>
            <div>
              <span className="font-medium">Atualizado em:</span> {updatedAt}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 w-full justify-start px-0 text-left"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
            <span className="ml-1">Detalhes do processo</span>
          </Button>
          
          {showDetails && (
            <div className="mt-2 rounded border p-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
                  <TabsTrigger value="partes">Partes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="mt-2 space-y-3">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Número do Processo</p>
                        <p className="font-medium">{processNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Classe</p>
                        <p className="font-medium">
                          {processClass}
                          {processClassCode && <span className="text-sm text-gray-500"> ({processClassCode})</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tribunal</p>
                        <p className="font-medium">{court}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Órgão Julgador</p>
                        <p className="font-medium">{process.metadata?.orgaoJulgador?.nome || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Grau</p>
                        <p className="font-medium">{process.metadata?.grau || "G1"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sistema</p>
                        <p className="font-medium">{process.metadata?.sistema?.nome || "PJe"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Assuntos</p>
                    <div className="space-y-1 pt-1">
                      {process.metadata?.assuntos?.map((assunto, index) => (
                        <p key={index} className="text-sm">
                          {assunto.nome}
                          <span className="ml-1 text-xs text-gray-500">({assunto.codigo})</span>
                        </p>
                      )) || <p className="text-sm text-gray-500">Nenhum assunto informado</p>}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="movimentacoes" className="mt-2">
                  <ProcessHitsNavigation 
                    processId={process.id} 
                    hits={process.hits || []} 
                  />
                </TabsContent>
                
                <TabsContent value="partes" className="mt-2">
                  <div className="space-y-2">
                    {process.metadata?.partes?.map((parte, index) => (
                      <div key={index} className="rounded border p-2">
                        <p className="font-medium">{parte.nome}</p>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{parte.papel}</span>
                          {parte.documento && (
                            <span className="text-sm text-gray-500">{parte.documento}</span>
                          )}
                        </div>
                        {parte.advogados && parte.advogados.length > 0 && (
                          <div className="mt-1 border-t pt-1">
                            <p className="text-xs text-gray-500">Advogados:</p>
                            {parte.advogados.map((adv, i) => (
                              <p key={i} className="text-sm">
                                {adv.nome} - <span className="text-xs text-gray-500">{adv.inscricao}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )) || <p className="text-gray-500">Nenhuma parte registrada</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {relatedHits.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <p className="text-sm font-medium">Processos relacionados ({relatedHits.length})</p>
              <div className="mt-2 space-y-1">
                {relatedHits.map((hit) => (
                  <div key={hit.id} className="flex justify-between rounded bg-gray-50 p-2 text-sm">
                    <span>{formatProcessNumber(hit.number)}</span>
                    <span className="text-gray-500">{formatDate(hit.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
