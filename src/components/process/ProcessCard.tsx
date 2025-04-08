import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Calendar, Building2, Scale, Eye, ArrowLeft, ArrowRight, Archive, ArchiveRestore } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeStringValue, getSafeNestedValue } from "@/utils/data";
import { ProcessTimeline } from "./ProcessTimeline";
import { ProcessParties } from "@/components/process/ProcessParties";
import { ProcessNavigation } from "./ProcessNavigation";
import { ProcessMovements } from "./ProcessMovements";

interface ProcessCardProps {
  process: {
    id: string;
    number: string;
    type: string;
    metadata: any;
    created_at: string;
    updated_at: string;
    hits?: Array<{
      id: string;
      number: string;
      type: string;
      metadata: any;
      created_at: string;
      updated_at: string;
    }>;
  };
}

export function ProcessCard({ process }: ProcessCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTab, setCurrentTab] = useState("dados");
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);

  const movimentos = process.metadata?.movimentos || [];
  const totalMovimentos = movimentos.length;

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const handlePrevMovimento = () => {
    if (currentMovimentoIndex > 0) {
      setCurrentMovimentoIndex(currentMovimentoIndex - 1);
    }
  };

  const handleNextMovimento = () => {
    if (currentMovimentoIndex < totalMovimentos - 1) {
      setCurrentMovimentoIndex(currentMovimentoIndex + 1);
    }
  };

  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const currentMovimento = movimentos[currentMovimentoIndex] || null;
  const isArchived = process.status === "Arquivado";

  const handleArchive = async (password: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .update({ 
          status: isArchived ? "Em andamento" : "Arquivado",
          updated_at: new Date().toISOString()
        })
        .eq('id', process.id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Processo ${isArchived ? "desarquivado" : "arquivado"} com sucesso`);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao arquivar processo:", error);
      toast.error("Erro ao processar operação");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">PROCESSO PRINCIPAL</span>
          <span className="text-xs text-muted-foreground">
            Última atualização: {formatDate(process.updated_at)}
          </span>
        </div>
        <h2 className="text-xl font-medium">{safeStringValue(process.type)}</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm text-blue-600">{safeStringValue(process.number)}</div>
            <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {safeStringValue(process.metadata?.formato, "Eletrônico")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
              className="flex items-center"
            >
              {isArchived ? (
                <><ArchiveRestore className="h-4 w-4 mr-1" /> Desarquivar</>
              ) : (
                <><Archive className="h-4 w-4 mr-1" /> Arquivar</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            Ver menos
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            Ver mais
          </>
        )}
      </Button>

      {isExpanded && (
        <div className="mt-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="w-full">
              <TabsTrigger value="dados">Dados do Processo</TabsTrigger>
              <TabsTrigger value="movimentacao">
                Movimentação Processual
                {movimentos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                    {movimentos.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Data do Ajuizamento</div>
                    <div className="text-sm">
                      {formatDate(getSafeNestedValue(process.metadata, 'dataAjuizamento'))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Sistema</div>
                    <div className="text-sm">{safeStringValue(process.metadata?.sistema?.nome, "Inválido")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Scale className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Grau</div>
                    <div className="text-sm">{safeStringValue(process.metadata?.grau, "G1")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Órgão Julgador</div>
                    <div className="text-sm">{safeStringValue(process.metadata?.orgaoJulgador?.nome)}</div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Assuntos</div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(process.metadata?.assuntos) ? (
                          process.metadata.assuntos.map((assunto: any, index: number) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50"
                            >
                              {safeStringValue(assunto.nome)}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                            {safeStringValue(process.metadata?.assuntos)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Nível de Sigilo</div>
                    <div className="text-sm">{safeStringValue(process.metadata?.nivelSigilo, "Público")}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="movimentacao" className="mt-4">
              {movimentos.length > 0 ? (
                <div className="space-y-4">
                  <ProcessNavigation
                    currentMovimentoIndex={currentMovimentoIndex}
                    totalMovimentos={movimentos.length}
                    handlePrevMovimento={handlePrevMovimento}
                    handleNextMovimento={handleNextMovimento}
                  />
                  
                  {currentMovimento && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {currentMovimento.nome}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(currentMovimento.dataHora)}
                          </div>
                        </div>
                        {currentMovimento.codigo && (
                          <Badge variant="outline" className="text-gray-600">
                            Código: {currentMovimento.codigo}
                          </Badge>
                        )}
                      </div>
                      
                      {currentMovimento.complemento && (
                        <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                          {currentMovimento.complemento}
                        </div>
                      )}
                      
                      {currentMovimento.tipo && (
                        <div className="text-sm text-gray-500">
                          Tipo: {currentMovimento.tipo}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma movimentação processual encontrada
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {process.hits && process.hits.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium">Processos Relacionados</h3>
          {process.hits.map((hit) => (
            <div key={hit.id} className="border-t pt-6">
              <div className="space-y-2 mb-4">
                <h4 className="text-md font-medium">{safeStringValue(hit.type)}</h4>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-blue-600">{safeStringValue(hit.number)}</div>
                  <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {safeStringValue(hit.metadata?.formato, "Eletrônico")}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Data do Ajuizamento</div>
                    <div className="text-sm">
                      {formatDate(getSafeNestedValue(hit.metadata, 'dataAjuizamento'))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Sistema</div>
                    <div className="text-sm">{safeStringValue(hit.metadata?.sistema?.nome)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProcessArchiveDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        onConfirm={handleArchive}
        action={isArchived ? "unarchive" : "archive"}
        processNumber={process.number}
      />
    </Card>
  );
}
