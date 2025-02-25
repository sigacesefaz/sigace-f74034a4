
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatajudProcess } from "@/types/datajud";
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
  File
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNextButton,
  PaginationPrevButton
} from "@/components/ui/pagination";

interface ProcessDetailsProps {
  process: DatajudProcess;
  onSave: () => void;
  onCancel: () => void;
}

export function ProcessDetails({ process, onSave, onCancel }: ProcessDetailsProps) {
  const [currentEventsPage, setCurrentEventsPage] = useState(1);
  const eventsPerPage = 10;
  
  // Formatação de data brasileira
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Data não informada";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  // Filtrar eventos específicos
  const isIntimationEvent = (evento: any) => {
    // Códigos específicos para intimações
    const intimationCodes = [12265, 12266];
    return intimationCodes.includes(evento.codigo);
  };

  const isDocumentEvent = (evento: any) => {
    // Código específico para documentos
    return evento.codigo === 581;
  };

  const intimationEvents = process.movimentos ? 
    process.movimentos.filter(isIntimationEvent) : [];

  const documentEvents = process.movimentos ? 
    process.movimentos.filter(isDocumentEvent) : [];

  // Paginação de eventos
  const totalEventPages = process.movimentos ? 
    Math.ceil(process.movimentos.length / eventsPerPage) : 0;
  
  const paginatedEvents = process.movimentos ? 
    process.movimentos.slice(
      (currentEventsPage - 1) * eventsPerPage, 
      currentEventsPage * eventsPerPage
    ) : [];

  // Componente de informações adicionais
  const AdditionalInfo = () => (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Data de Ajuizamento
            </h3>
            <p className="mt-1">{formatDate(process.dataAjuizamento)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <UserCircle className="h-4 w-4" /> Órgão Julgador
            </h3>
            <p className="mt-1">{process.orgaoJulgador?.nome || "Não informado"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <GavelIcon className="h-4 w-4" /> Grau
            </h3>
            <p className="mt-1">{process.grau || "Não informado"}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Sistema
            </h3>
            <p className="mt-1">{process.sistema?.nome || "Não informado"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Assuntos
            </h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {process.assuntos && process.assuntos.length > 0 ? (
                process.assuntos.map((assunto, index) => (
                  <Badge key={index} variant="secondary" className="bg-secondary/10 text-secondary-dark border-0">
                    {assunto.nome}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">Nenhum assunto informado</span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Nível de Sigilo
            </h3>
            <p className="mt-1">{process.nivelSigilo || "Não informado"}</p>
          </div>
        </div>
      </div>
      
      {/* Última atualização */}
      {process.dataHoraUltimaAtualizacao && (
        <div className="text-xs text-gray-500">
          Última atualização: {formatDate(process.dataHoraUltimaAtualizacao)}
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-6 bg-white border-t-4 border-t-primary">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{process.classe?.nome || "Sem classe"}</h2>
            <p className="text-primary font-mono">{process.numeroProcesso}</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-0 h-7 px-3">
            {process.tribunal}
          </Badge>
        </div>

        {/* Adicionar as informações abaixo do número do processo */}
        <AdditionalInfo />

        <Tabs defaultValue="parties" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="parties">Partes</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="intimations">Intimações</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>
          
          {/* Aba de Partes */}
          <TabsContent value="parties" className="space-y-4 mt-4">
            <div className="flex flex-col space-y-4">
              {process.partes && process.partes.length > 0 ? (
                process.partes.map((parte, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-lg">{parte.papel || "Parte"}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome</p>
                        <p className="font-medium">{parte.nome || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p>{parte.tipoPessoa || "Não informado"}</p>
                      </div>
                      {parte.documento && (
                        <div>
                          <p className="text-sm text-gray-500">Documento</p>
                          <p>{parte.documento}</p>
                        </div>
                      )}
                      {parte.advogados && parte.advogados.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 mb-2">Advogados</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {parte.advogados.map((advogado, advIndex) => (
                              <div key={advIndex} className="border-l-2 border-gray-200 pl-2">
                                <p className="font-medium">{advogado.nome}</p>
                                <p className="text-sm">{advogado.inscricao}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem informações de partes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Não há informações disponíveis sobre as partes deste processo.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Aba de Eventos */}
          <TabsContent value="events" className="space-y-4 mt-4">
            {process.movimentos && process.movimentos.length > 0 ? (
              <>
                <div className="space-y-3">
                  {paginatedEvents.map((movimento, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-md border">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">{movimento.nome}</span>
                              {movimento.complementosTabelados && movimento.complementosTabelados.length > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {movimento.complementosTabelados
                                    .map(comp => `${comp.nome}: ${comp.valor || comp.descricao}`)
                                    .join(" | ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDateTime(movimento.dataHora)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevButton
                          onClick={() => setCurrentEventsPage(p => Math.max(1, p - 1))}
                          disabled={currentEventsPage === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalEventPages }).map((_, i) => {
                        const page = i + 1;
                        // Mostrar apenas as páginas próximas à atual
                        if (
                          page === 1 || 
                          page === totalEventPages ||
                          (page >= currentEventsPage - 1 && page <= currentEventsPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === currentEventsPage}
                                onClick={() => setCurrentEventsPage(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        // Adicionar ellipsis para indicar páginas omitidas
                        if (page === currentEventsPage - 2 || page === currentEventsPage + 2) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNextButton
                          onClick={() => setCurrentEventsPage(p => Math.min(totalEventPages, p + 1))}
                          disabled={currentEventsPage === totalEventPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem eventos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há eventos registrados para este processo.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Aba de Intimações */}
          <TabsContent value="intimations" className="space-y-4 mt-4">
            {intimationEvents.length > 0 ? (
              <div className="space-y-3">
                {intimationEvents.map((evento, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-md border border-purple-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Bell className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <span className="font-medium text-purple-800">{evento.nome}</span>
                            <p className="text-xs text-purple-700 mt-1">Código: {evento.codigo}</p>
                            {evento.complementosTabelados && evento.complementosTabelados.length > 0 && (
                              <p className="text-sm text-purple-700 mt-1">
                                {evento.complementosTabelados
                                  .map(comp => `${comp.nome}: ${comp.valor || comp.descricao}`)
                                  .join(" | ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-purple-600 whitespace-nowrap">
                          {formatDateTime(evento.dataHora)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem intimações</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não foram encontradas intimações para este processo.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Nova Aba de Documentos */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            {documentEvents.length > 0 ? (
              <div className="space-y-3">
                {documentEvents.map((evento, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <File className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <span className="font-medium text-blue-800">{evento.nome}</span>
                            <p className="text-xs text-blue-700 mt-1">Código: {evento.codigo}</p>
                            {evento.complementosTabelados && evento.complementosTabelados.length > 0 && (
                              <p className="text-sm text-blue-700 mt-1">
                                {evento.complementosTabelados
                                  .map(comp => `${comp.nome}: ${comp.valor || comp.descricao}`)
                                  .join(" | ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 whitespace-nowrap">
                          {formatDateTime(evento.dataHora)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem documentos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não foram encontrados documentos para este processo.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            Importar Processo
          </Button>
        </div>
      </div>
    </Card>
  );
}
