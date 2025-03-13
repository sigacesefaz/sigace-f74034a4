import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Calendar, Building2, Scale, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeStringValue, getSafeNestedValue } from "@/utils/data";
import { ProcessTimeline } from "./ProcessTimeline";
import ProcessParties from "./ProcessParties";
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
  const [showMovements, setShowMovements] = useState(false);
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const [isTabsExpanded, setIsTabsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const movimentos = process.metadata?.movimentos || [];
  const totalMovimentos = movimentos.length;
  const totalPages = Math.ceil(totalMovimentos / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentPageMovimentos = movimentos
    .sort((a: any, b: any) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
    .slice(startIndex, startIndex + itemsPerPage);

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

  const renderProcessInfo = (processData: any) => (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="flex items-start gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
        <div>
          <div className="text-sm text-muted-foreground">Data do Ajuizamento</div>
          <div className="text-sm">
            {formatDate(getSafeNestedValue(processData.metadata, 'dataAjuizamento'))}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
        <div>
          <div className="text-sm text-muted-foreground">Sistema</div>
          <div className="text-sm">{safeStringValue(processData.metadata?.sistema?.nome, "Inválido")}</div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Scale className="h-4 w-4 text-muted-foreground mt-1" />
        <div>
          <div className="text-sm text-muted-foreground">Grau</div>
          <div className="text-sm">{safeStringValue(processData.metadata?.grau, "G1")}</div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
        <div>
          <div className="text-sm text-muted-foreground">Órgão Julgador</div>
          <div className="text-sm">{safeStringValue(processData.metadata?.orgaoJulgador?.nome)}</div>
        </div>
      </div>
      <div className="flex items-start gap-2 col-span-2">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">Assuntos</div>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(processData.metadata?.assuntos) ? (
              processData.metadata.assuntos.map((assunto: any, index: number) => (
                <Badge key={index} variant="secondary" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                  {safeStringValue(assunto.nome)}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                {safeStringValue(processData.metadata?.assuntos)}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Eye className="h-4 w-4 text-muted-foreground mt-1" />
        <div>
          <div className="text-sm text-muted-foreground">Nível de Sigilo</div>
          <div className="text-sm">{safeStringValue(processData.metadata?.nivelSigilo, "Público")}</div>
        </div>
      </div>
      <div className="flex items-end justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMovements(!showMovements)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showMovements ? "Ocultar Movimentação" : "Ver Movimentação"}
        </Button>
      </div>

      {/* Componente de movimentação processual */}
      {showMovements && process.metadata?.movimentos && (
        <div className="col-span-2">
          <ProcessMovements movimentos={process.metadata.movimentos} />
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-6">
      {/* Processo Principal */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">PROCESSO PRINCIPAL</span>
          <span className="text-xs text-muted-foreground">
            Última atualização: {formatDate(process.updated_at)}
          </span>
        </div>
        <h2 className="text-xl font-medium">{safeStringValue(process.type)}</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-blue-600">{safeStringValue(process.number)}</div>
          <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            {safeStringValue(process.metadata?.formato, "Eletrônico")}
          </Badge>
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
        <>
          {/* Informações do Processo Principal */}
          {renderProcessInfo(process)}

          {/* Hits do Processo */}
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
                  {renderProcessInfo(hit)}
                </div>
              ))}
            </div>
          )}

          {/* Abas */}
          <Tabs defaultValue="movimentacao" className="w-full">
            <TabsList className="w-full bg-transparent border-b">
              <TabsTrigger 
                value="movimentacao" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Movimentação
                {process.metadata?.movimentos?.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-900">
                    {process.metadata.movimentos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="intimacao" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Intimação
              </TabsTrigger>
              <TabsTrigger 
                value="documentos" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger 
                value="decisao" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Decisão
              </TabsTrigger>
              <TabsTrigger 
                value="partes" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Partes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movimentacao">
              <ProcessTimeline 
                events={process.metadata?.movimentos?.map((mov: any) => ({
                  id: mov.id || String(Math.random()),
                  date: mov.data,
                  title: mov.descricao,
                  type: "movement"
                })) || []}
                maxItems={5}
              />
            </TabsContent>

            <TabsContent value="intimacao">
              <ProcessTimeline 
                events={process.metadata?.intimacoes?.map((int: any) => ({
                  id: int.id || String(Math.random()),
                  date: int.data,
                  title: int.descricao,
                  type: "document"
                })) || []}
                maxItems={5}
              />
            </TabsContent>

            <TabsContent value="documentos">
              <ProcessTimeline 
                events={process.metadata?.documentos?.map((doc: any) => ({
                  id: doc.id || String(Math.random()),
                  date: doc.data,
                  title: doc.descricao,
                  type: "document",
                  metadata: { documentType: doc.tipo }
                })) || []}
                maxItems={5}
              />
            </TabsContent>

            <TabsContent value="decisao">
              <ProcessTimeline 
                events={process.metadata?.decisoes?.map((dec: any) => ({
                  id: dec.id || String(Math.random()),
                  date: dec.data,
                  title: dec.descricao,
                  type: "decision"
                })) || []}
                maxItems={5}
              />
            </TabsContent>

            <TabsContent value="partes">
              <ProcessParties 
                processId={process.id}
                parties={process.metadata?.partes || []}
                onPartiesChange={(updatedParties) => {
                  // Aqui você pode implementar a lógica de atualização das partes se necessário
                  console.log('Partes atualizadas:', updatedParties);
                }}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </Card>
  );
}
