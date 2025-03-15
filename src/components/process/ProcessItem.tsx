
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessItemProps {
  process: any;
  loadProcessDetails: (processId: string | null) => Promise<void>;
  expandedProcess: string | null;
  expandedDetails: any;
  isLoadingDetails: boolean;
}

export function ProcessItem({
  process,
  loadProcessDetails,
  expandedProcess,
  expandedDetails,
  isLoadingDetails
}: ProcessItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState("atual");

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const isExpanded = expandedProcess === process.id;
  
  // Garantir que hits seja sempre um array
  const processHits = Array.isArray(process.hits) ? process.hits : 
                     (process.hits ? [process.hits] : []);
  
  // Ordenar os hits pela data mais recente primeiro
  const sortedHits = [...processHits].sort((a, b) => {
    const dateA = new Date(a._source?.dataHoraUltimaAtualizacao || 0);
    const dateB = new Date(b._source?.dataHoraUltimaAtualizacao || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Hit mais recente para a aba "Atual"
  const currentHit = sortedHits.length > 0 ? sortedHits[0] : null;
  
  // Todos os outros hits para a aba "Anteriores"
  const previousHits = sortedHits.length > 1 ? sortedHits.slice(1) : [];

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

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold">{process.title}</div>
            <div className="text-sm text-gray-500">{process.number}</div>
            <div className="text-sm text-gray-500">
              {process.description}
            </div>
            <Badge
              variant="secondary"
              className="mt-2"
            >
              {process.status}
            </Badge>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex space-x-2">
              <Link to={`/processes/${process.id}`}>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadProcessDetails(process.id)}
              className="mt-2"
            >
              <ChevronsUpDown className="h-4 w-4 mr-2" />
              {isExpanded ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4">
            {isLoadingDetails ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : expandedDetails ? (
              <>
                <Tabs defaultValue="atual" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                  <TabsList className="w-full mb-2">
                    <TabsTrigger value="atual" className="flex-1">Atual</TabsTrigger>
                    <TabsTrigger value="anteriores" className="flex-1">
                      Anteriores
                      {previousHits.length > 0 && (
                        <Badge className="ml-2">{previousHits.length}</Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="atual" className="space-y-2">
                    {currentHit ? (
                      <div className="bg-white rounded-lg p-3 space-y-2">
                        <h4 className="font-medium text-gray-900">Informações Atuais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <p><span className="font-medium text-gray-500">Número do Processo:</span> {currentHit._source?.numeroProcesso || process.number}</p>
                          <p><span className="font-medium text-gray-500">Classe:</span> {currentHit._source?.classe?.nome || "Não informado"} {currentHit._source?.classe?.codigo ? `(Código: ${currentHit._source.classe.codigo})` : ""}</p>
                          <p><span className="font-medium text-gray-500">Data de Ajuizamento:</span> {formatDate(currentHit._source?.dataAjuizamento)}</p>
                          <p><span className="font-medium text-gray-500">Última Atualização:</span> {formatDate(currentHit._source?.dataHoraUltimaAtualizacao)}</p>
                          <p><span className="font-medium text-gray-500">Grau:</span> {currentHit._source?.grau || "G1"}</p>
                          <p><span className="font-medium text-gray-500">Tribunal:</span> {currentHit._source?.tribunal || "Não informado"}</p>
                          <p><span className="font-medium text-gray-500">Órgão Julgador:</span> {currentHit._source?.orgaoJulgador?.nome || "Não informado"}</p>
                          <p><span className="font-medium text-gray-500">Sistema:</span> {currentHit._source?.sistema?.nome || "Não informado"}</p>
                        </div>
                        
                        {currentHit._source?.assuntos && currentHit._source.assuntos.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900 mb-1">Assuntos</h4>
                            <div className="text-sm">
                              {currentHit._source.assuntos.map((assunto: any, index: number) => (
                                <div key={index} className="text-gray-700">
                                  {assunto.nome} <span className="text-gray-500">(Código: {assunto.codigo})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma informação atual disponível
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="anteriores" className="space-y-2">
                    {previousHits.length > 0 ? (
                      <div className="space-y-4">
                        {previousHits.map((hit, hitIndex) => (
                          <div key={hitIndex} className="bg-white rounded-lg p-4 border border-gray-100 mb-3">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">Atualização {hitIndex + 2}</h4>
                              <Badge variant="outline">
                                {formatDate(hit._source?.dataHoraUltimaAtualizacao)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Informações Básicas</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <p><span className="font-medium text-gray-500">Classe:</span> {hit._source?.classe?.nome || "Não informado"}</p>
                                  <p><span className="font-medium text-gray-500">Grau:</span> {hit._source?.grau || "Não informado"}</p>
                                  <p><span className="font-medium text-gray-500">Órgão Julgador:</span> {hit._source?.orgaoJulgador?.nome || "Não informado"}</p>
                                </div>
                              </div>
                              
                              {hit._source?.movimentos && hit._source.movimentos.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-1">Movimentos Recentes</h5>
                                  <div className="text-sm space-y-1">
                                    {hit._source.movimentos.slice(0, 3).map((movimento: any, movIndex: number) => (
                                      <div key={movIndex} className="border-l-2 border-gray-200 pl-2">
                                        <p className="font-medium">{movimento.nome}</p>
                                        <p className="text-xs text-gray-500">{formatDate(movimento.dataHora)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {previousHits.length > 1 && (
                          <div className="flex justify-center space-x-2 mt-3">
                            <Button size="sm" variant="outline">
                              Anterior
                            </Button>
                            <Button size="sm" variant="outline">
                              Próximo
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma atualização anterior encontrada
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <Table className="mt-4">
                  <TableCaption>Informações detalhadas do processo.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Campo</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Número</TableCell>
                      <TableCell>{process.number}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Classe</TableCell>
                      <TableCell>{process.metadata?.classe?.nome}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Data de Ajuizamento</TableCell>
                      <TableCell>{process.metadata?.dataAjuizamento}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sistema</TableCell>
                      <TableCell>{process.metadata?.sistema?.nome}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Órgão Julgador</TableCell>
                      <TableCell>{process.metadata?.orgaoJulgador?.nome}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Grau</TableCell>
                      <TableCell>{process.metadata?.grau}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Nível de Sigilo</TableCell>
                      <TableCell>{process.metadata?.nivelSigilo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Assuntos</TableCell>
                      <TableCell>
                        {process.metadata?.assuntos?.map((assunto: any) => (
                          <div key={assunto.codigo}>
                            {assunto.nome} ({assunto.codigo})
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Movimentos</TableCell>
                      <TableCell>
                        {process.metadata?.movimentos?.map((movimento: any) => (
                          <div key={movimento.codigo}>
                            {movimento.nome} - {movimento.dataHora}
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <div>Nenhum detalhe disponível.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
