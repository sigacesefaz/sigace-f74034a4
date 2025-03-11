import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { ArrowLeft, ArrowRight, Save, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface ProcessDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  mainProcess: DatajudProcess;
  onSave: () => void;
  onCancel: () => void;
  isImport?: boolean;
  importProgress?: number;
}

export function ProcessDetails({
  processMovimentos,
  isImport = false,
  onSave,
  importProgress = 0,
}: ProcessDetailsProps) {
  const navigate = useNavigate();
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTabsExpanded, setIsTabsExpanded] = useState(false);
  const itemsPerPage = 10;

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

  // Ordenar movimentos do mais recente para o mais antigo e calcular paginação
  const currentPageMovimentos = useMemo(() => {
    const sortedMovimentos = [...(currentProcess.movimentos || [])].sort((a, b) => {
      return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
    });
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMovimentos.slice(start, start + itemsPerPage);
  }, [currentProcess.movimentos, currentPage, itemsPerPage]);

  const totalEventos = currentProcess.movimentos?.length || 0;
  const totalPages = Math.ceil(totalEventos / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Formatar para exibição
  const formatProcessNumber = (number: string) => {
    if (!number) return "";
    const numericOnly = number.replace(/\D/g, '');
    if (numericOnly.length !== 20) return number;
    return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
  };

  // Componente para exibir as partes do processo
  const PartiesList = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Partes do Processo</h3>
      {currentProcess.partes && currentProcess.partes.length > 0 ? (
        <div className="space-y-4">
          {currentProcess.partes.map((parte, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{parte.nome}</h4>
                  <p className="text-sm text-gray-600">Papel: {parte.papel}</p>
                  <p className="text-sm text-gray-600">Tipo: {parte.tipoPessoa}</p>
                  {parte.documento && (
                    <p className="text-sm text-gray-600">Documento: {parte.documento}</p>
                  )}
                </div>
              </div>
              
              {parte.advogados && parte.advogados.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-600">Advogados:</p>
                  <ul className="text-sm pl-5 list-disc space-y-1 mt-1">
                    {parte.advogados.map((advogado, i) => (
                      <li key={i}>{advogado.nome} (OAB: {advogado.inscricao})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma parte encontrada</p>
      )}
    </div>
  );

  return (
    <div>
      <Card className="p-4">
        {/* Cabeçalho do processo */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{currentProcess.classe?.nome || "Processo"}</h2>
            <p className="text-lg">{formatProcessNumber(currentProcess.numeroProcesso)}</p>
            <div className="text-sm text-gray-600 mt-2">
              <div>Tribunal: {currentProcess.tribunal}</div>
              <div>Órgão Julgador: {currentProcess.orgaoJulgador?.nome}</div>
              <div>Data de Ajuizamento: {formatDate(currentProcess.dataAjuizamento)}</div>
            </div>
          </div>
          
          {/* Botão de importar processo */}
          {isImport && (
            <Button 
              onClick={onSave} 
              variant="outline"
              disabled={importProgress > 0 && importProgress < 100}
            >
              <Save className="h-4 w-4 mr-2" />
              Importar Processo
            </Button>
          )}
        </div>

        {/* Progress indicator for imports */}
        {isImport && importProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Importando processo...</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <Progress value={importProgress} className="h-2" />
          </div>
        )}
        
        {/* Navegação entre movimentos processuais */}
        {totalMovimentos > 1 && (
          <div className="flex items-center justify-between mt-4 bg-gray-50 p-2 rounded">
            <div className="flex-grow">
              <p className="text-sm text-gray-700">
                Movimento processual {currentMovimentoIndex + 1} de {totalMovimentos}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevMovimento}
                disabled={currentMovimentoIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextMovimento}
                disabled={currentMovimentoIndex === totalMovimentos - 1}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Grid de informações */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          {/* Coluna da esquerda */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Dados do Processo</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Número do Processo:</span>
                  <p>{formatProcessNumber(currentProcess.numeroProcesso)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Classe:</span>
                  <p>{currentProcess.classe?.nome || "Não informado"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data de Ajuizamento:</span>
                  <p>{formatDate(currentProcess.dataAjuizamento)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tribunal:</span>
                  <p>{currentProcess.tribunal || "Não informado"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Grau:</span>
                  <p>{currentProcess.grau || "Não informado"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Assuntos</h3>
              {currentProcess.assuntos && currentProcess.assuntos.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {currentProcess.assuntos.map((assunto, index) => (
                    <li key={index}>
                      {assunto.nome} (Código: {assunto.codigo})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nenhum assunto encontrado</p>
              )}
            </div>
          </div>

          {/* Coluna da direita */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Órgão Julgador</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <p>{currentProcess.orgaoJulgador?.nome || "Não informado"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Código:</span>
                  <p>{currentProcess.orgaoJulgador?.codigo || "Não informado"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sistema</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <p>{currentProcess.sistema?.nome || "Não informado"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Formato:</span>
                  <p>{currentProcess.formato?.nome || "Não informado"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção retrátil com os eventos */}
        <div className="mt-8 border-t pt-4">
          <Button
            variant="ghost"
            onClick={() => setIsTabsExpanded(!isTabsExpanded)}
            className="w-full flex justify-between items-center py-2 hover:bg-gray-100"
          >
            <span className="font-semibold">Informações dos Eventos</span>
            {isTabsExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
          
          {isTabsExpanded && (
            <div className="mt-4">
              <div className="space-y-4">
                {currentPageMovimentos.map((movimento, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">
                          #{totalEventos - startIndex - index} {movimento.nome}
                          {movimento.codigo && 
                            <span className="ml-2 text-sm text-gray-500">
                              (Código: {movimento.codigo})
                            </span>
                          }
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatDate(movimento.dataHora)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Paginação */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
