
import React, { useState } from "react";
import { DatajudProcess } from "@/types/datajud";
import { formatDate, formatProcessNumber } from "@/lib/utils";
import { ProcessMovements } from "./ProcessMovements";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProcessInformationProps {
  currentProcess: DatajudProcess;
}

export function ProcessInformation({ currentProcess }: ProcessInformationProps) {
  const [showMovements, setShowMovements] = useState(false);
  const [activeTab, setActiveTab] = useState("informacoes");

  return (
    <div className="space-y-4 mt-8">
      {/* Dados básicos do processo */}
      <Collapsible defaultOpen className="border rounded-lg bg-white shadow-sm">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
          <h3 className="text-lg font-semibold">Informações do Processo</h3>
          {({ open }: { open: boolean }) => (
            open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Abas para visualização de detalhes e movimentos */}
      <div className="border rounded-lg bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger 
                value="informacoes" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent"
              >
                Informações
              </TabsTrigger>
              <TabsTrigger 
                value="movimentos" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent"
              >
                Movimentos Processuais
              </TabsTrigger>
              <TabsTrigger 
                value="documentos" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger 
                value="partes" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent"
              >
                Partes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="informacoes" className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Detalhes Adicionais</h3>
              {currentProcess.nivelSigilo && (
                <div className="text-sm">
                  <span className="font-medium">Nível de Sigilo:</span> {currentProcess.nivelSigilo}
                </div>
              )}
              {currentProcess.valorCausa && (
                <div className="text-sm">
                  <span className="font-medium">Valor da Causa:</span> {currentProcess.valorCausa}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="movimentos" className="p-4">
            {currentProcess.movimentos && currentProcess.movimentos.length > 0 ? (
              <ProcessMovements movimentos={currentProcess.movimentos} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum movimento processual encontrado para este processo.
              </div>
            )}
          </TabsContent>

          <TabsContent value="documentos" className="p-4">
            <div className="text-center py-8 text-gray-500">
              Documentos relacionados ao processo serão exibidos aqui.
            </div>
          </TabsContent>

          <TabsContent value="partes" className="p-4">
            <div className="text-center py-8 text-gray-500">
              Partes envolvidas no processo serão exibidas aqui.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
