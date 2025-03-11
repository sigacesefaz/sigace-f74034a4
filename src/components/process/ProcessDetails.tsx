
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProcessDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  mainProcess: DatajudProcess;
  onSave: () => void;
  onCancel: () => void;
  isImport?: boolean;
}

export function ProcessDetails({ 
  processMovimentos, 
  mainProcess, 
  onSave, 
  onCancel, 
  isImport = true 
}: ProcessDetailsProps) {
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // Formatar para exibição
  const formatProcessNumber = (number: string) => {
    if (!number) return "";
    const numericOnly = number.replace(/\D/g, '');
    if (numericOnly.length !== 20) return number;
    return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
  };

  // Informações gerais do processo
  const ProcessOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Dados do Processo</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-600">Número do Processo:</span>
              <p>{formatProcessNumber(currentProcess.numeroProcesso)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Classe:</span>
              <p>{currentProcess.classe?.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Data de Ajuizamento:</span>
              <p>{formatDate(currentProcess.dataAjuizamento)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Tribunal:</span>
              <p>{currentProcess.tribunal || "Não informado"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Grau:</span>
              <p>{currentProcess.grau || "Não informado"}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Órgão Julgador</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-600">Nome:</span>
              <p>{currentProcess.orgaoJulgador?.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Código:</span>
              <p>{currentProcess.orgaoJulgador?.codigo || "Não informado"}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Sistema</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-600">Nome:</span>
              <p>{currentProcess.sistema?.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Formato:</span>
              <p>{currentProcess.formato?.nome || "Não informado"}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Assuntos</h3>
        {currentProcess.assuntos && currentProcess.assuntos.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {currentProcess.assuntos.map((assunto, index) => (
              <li key={index}>
                {assunto.nome} (Código: {assunto.codigo})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum assunto encontrado</p>
        )}
      </div>
    </div>
  );
  
  // Renderizar últimos movimentos
  const MovementsList = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Movimentos Processuais</h3>
      {currentProcess.movimentos && currentProcess.movimentos.length > 0 ? (
        <div className="space-y-4">
          {currentProcess.movimentos.slice(0, 20).map((movimento, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-medium">{movimento.nome}</h4>
                  <p className="text-sm text-gray-600">
                    Código: {movimento.codigo}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(movimento.dataHora)}
                </div>
              </div>
              
              {movimento.complementosTabelados && movimento.complementosTabelados.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600">Complementos:</p>
                  <ul className="text-sm pl-5 list-disc space-y-1 mt-1">
                    {movimento.complementosTabelados.map((complemento, i) => (
                      <li key={i}>{complemento.descricao || complemento.nome}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          {currentProcess.movimentos.length > 20 && (
            <p className="text-center text-sm text-gray-500 italic">
              Exibindo os 20 movimentos mais recentes de {currentProcess.movimentos.length} no total.
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum movimento processual encontrado</p>
      )}
    </div>
  );

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
    <div className="space-y-6">
      {/* Visão geral do processo (sempre visível) */}
      <Card className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">{currentProcess.classe?.nome || "Processo"}</h2>
          <p className="text-lg font-semibold">{formatProcessNumber(currentProcess.numeroProcesso)}</p>
          <div className="text-sm text-gray-600 mt-1">
            <div>Tribunal: {currentProcess.tribunal}</div>
            <div>Órgão Julgador: {currentProcess.orgaoJulgador?.nome || "Não informado"}</div>
            <div>Data de Ajuizamento: {formatDate(currentProcess.dataAjuizamento)}</div>
          </div>
        </div>
        
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
        
        {/* Overview sections sempre visível */}
        <div className="mt-4">
          <ProcessOverview />
        </div>
      </Card>

      {/* Abas para navegar entre diferentes seções de informações */}
      <Card className="p-6">
        <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="parties">Partes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <MovementsList />
          </TabsContent>
          
          <TabsContent value="parties">
            <PartiesList />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Barra de ações */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        {isImport && (
          <Button onClick={onSave} className="bg-primary text-white">
            <Save className="h-4 w-4 mr-2" />
            Importar Processo
          </Button>
        )}
      </div>
    </div>
  );
}
