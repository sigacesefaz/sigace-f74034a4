import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Share2, 
  Eye, 
  Trash2, 
  Calendar,
  Info,
  Building2,
  ShieldAlert,
  FileText,
  Users,
  PenSquare,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatProcessNumber } from "@/utils/format";
import { safeStringValue } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ProcessNavigation } from "@/components/process/ProcessNavigation";

// Função para formatar datas de forma segura
const formatDate = (dateString: string) => {
  if (!dateString) return "Não informado";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

// Função para obter valor seguro de um objeto aninhado
const getSafeNestedValue = (obj: any, path: string, defaultValue: any = "Não informado") => {
  try {
    const parts = path.split('.');
    let result = obj;
    
    for (const part of parts) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[part];
    }
    
    return result !== null && result !== undefined ? result : defaultValue;
  } catch (error) {
    console.error(`Erro ao acessar caminho ${path}:`, error);
    return defaultValue;
  }
};

interface ProcessCardProps {
  process: {
    id: string;
    number: string;
    title?: string;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
  };
  relatedHits?: Array<{
    id: string;
    number: string;
    title?: string;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
  }>;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ProcessCard({ process, relatedHits = [], onDelete, onView }: ProcessCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState("dados");
  const [currentHitIndex, setCurrentHitIndex] = useState(0);
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const { toast } = useToast();

  // Validar que o processo é um objeto válido
  if (!process || typeof process !== 'object') {
    console.error("Processo inválido:", process);
    return (
      <Card className="mb-4 w-full shadow-sm p-4">
        <div className="text-red-500">Erro: dados do processo inválidos</div>
      </Card>
    );
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(process.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(process.id);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Navegação entre movimentos processuais
  const handleNextMovimento = () => {
    if (movimentos.length > 0) {
      setCurrentMovimentoIndex((prev) => 
        prev < movimentos.length - 1 ? prev + 1 : prev
      );
    }
  };

  const handlePrevMovimento = () => {
    if (movimentos.length > 0) {
      setCurrentMovimentoIndex((prev) => 
        prev > 0 ? prev - 1 : prev
      );
    }
  };

  // Obtém o hit atual ou o processo principal se não houver hits ou o índice atual for 0
  const currentProcess = currentHitIndex === 0 || relatedHits.length === 0 
    ? process 
    : relatedHits[currentHitIndex - 1];

  // Extrair informações do processo com tratamento de segurança
  const metadata = currentProcess.metadata || {};
  
  // Extrair valores básicos com tratamento de segurança
  const processNumber = formatProcessNumber(currentProcess.number);
  const lastUpdate = currentProcess.updated_at 
    ? formatDate(currentProcess.updated_at) 
    : "Não informado";
  
  // Informações básicas com tratamento seguro
  const title = safeStringValue(currentProcess.title || getSafeNestedValue(metadata, 'classe.nome'), "Mandado de Segurança Cível");
  const dataAjuizamento = safeStringValue(getSafeNestedValue(metadata, 'dataAjuizamento', ''));
  const sistema = safeStringValue(getSafeNestedValue(metadata, 'sistema.nome', 'Inválido'));
  const grau = safeStringValue(getSafeNestedValue(metadata, 'grau', 'G1'));
  const orgaoJulgador = safeStringValue(getSafeNestedValue(metadata, 'orgaoJulgador.nome', 'Não informado'));
  const nivelSigilo = safeStringValue(getSafeNestedValue(metadata, 'nivelSigilo', 'Público'));
  
  // Assuntos com tratamento seguro
  const assuntos = Array.isArray(metadata.assuntos) ? metadata.assuntos : [];
  const assuntoPrincipal = assuntos.length > 0 ? safeStringValue(assuntos[0]?.nome, "Não informado") : "ICMS / Incidência Sobre o Ativo Fixo";

  // Movimentações com tratamento seguro
  const movimentos = Array.isArray(metadata.movimentos) ? metadata.movimentos : [];
  const totalMovimentos = movimentos.length;

  // Obtém o movimento atual
  const currentMovimento = movimentos[currentMovimentoIndex] || null;
  
  return (
    <Card className="mb-4 w-full shadow-sm">
      <div className="p-4">
        {/* Cabeçalho do card */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none">
            {currentHitIndex === 0 ? "PROCESSO PRINCIPAL" : "PROCESSO RELACIONADO"}
          </Badge>
          <span className="text-gray-500 text-xs">Última atualização: {lastUpdate}</span>
        </div>

        {/* Informações principais */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{formatProcessNumber(process.number)}</h2>
          <div className="flex items-center gap-2">
            <div className="text-sm text-blue-600">{processNumber}</div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {sistema}
            </Badge>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="text-xs text-gray-500 hover:text-gray-700"
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
          
          <div className="flex items-center gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={handleView}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Seção expansível */}
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
                      <div className="text-sm">{formatDate(dataAjuizamento)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Órgão Julgador</div>
                      <div className="text-sm">{orgaoJulgador}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Grau</div>
                      <div className="text-sm">{grau}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Nível de Sigilo</div>
                      <div className="text-sm">{nivelSigilo}</div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Assuntos</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assuntos.map((assunto: any, index: number) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-yellow-50 text-yellow-800"
                            >
                              {assunto.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
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
      </div>
    </Card>
  );
}
