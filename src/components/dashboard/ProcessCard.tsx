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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { formatProcessNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { safeStringValue, isEmpty } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
  const [currentTab, setCurrentTab] = useState("movimentacao");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentHitIndex, setCurrentHitIndex] = useState(0);
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

  // Navegação entre hits relacionados
  const nextHit = () => {
    if (relatedHits.length > 0) {
      setCurrentHitIndex((prev) => (prev + 1) % relatedHits.length);
    }
  };

  const prevHit = () => {
    if (relatedHits.length > 0) {
      setCurrentHitIndex((prev) => (prev - 1 + relatedHits.length) % relatedHits.length);
    }
  };

  // Obtém o hit atual ou o processo principal se não houver hits ou o índice atual for 0
  const currentProcess = currentHitIndex === 0 || relatedHits.length === 0 
    ? process 
    : relatedHits[currentHitIndex - 1];

  // Extrair informações do processo com tratamento de segurança
  const metadata = currentProcess.metadata || {};
  
  // Extrair valores básicos com tratamento de segurança
  const processNumber = formatProcessNumber(safeStringValue(currentProcess.number || getSafeNestedValue(metadata, 'numeroProcesso', '')));
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

  // Partes do processo
  const partes = Array.isArray(metadata.partes) ? metadata.partes : [];

  // Intimações com tratamento seguro
  const intimacoes = Array.isArray(metadata.intimacoes) ? metadata.intimacoes : [];
  
  // Documentos com tratamento seguro
  const documentos = Array.isArray(metadata.documentos) ? metadata.documentos : [];

  // Decisões com tratamento seguro
  const decisoes = Array.isArray(metadata.decisoes) ? metadata.decisoes : [];
  
  return (
    <Card className="mb-4 w-full shadow-sm">
      <div className="px-4 pt-4 pb-2">
        {/* Cabeçalho com tipo e última atualização */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none">
            {currentHitIndex === 0 ? "PROCESSO PRINCIPAL" : "PROCESSO RELACIONADO"}
          </Badge>
          <span className="text-gray-500 text-xs">Última atualização: {lastUpdate}</span>
        </div>
        
        {/* Título e número do processo */}
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-blue-600 font-medium">{processNumber}</div>

        {/* Navegação entre hits */}
        {relatedHits.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevHit}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500">
              {currentHitIndex + 1} de {relatedHits.length + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextHit}
              className="px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Botão Expandir/Recolher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpand}
          className="mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Ver mais
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <CardContent>
          {/* Grid de informações do processo */}
          <div className="grid grid-cols-2 gap-4 mb-6">
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
                <div className="text-sm text-gray-500">Sistema</div>
                <div className="text-sm">{sistema}</div>
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
              <Building2 className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <div className="text-sm text-gray-500">Órgão Julgador</div>
                <div className="text-sm">{orgaoJulgador}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <div className="text-sm text-gray-500">Nível de Sigilo</div>
                <div className="text-sm">{nivelSigilo}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <div className="text-sm text-gray-500">Assunto Principal</div>
                <div className="text-sm">{assuntoPrincipal}</div>
              </div>
            </div>
          </div>

          {/* Abas */}
          <Tabs defaultValue="movimentacao" className="w-full">
            <TabsList className="w-full bg-transparent border-b">
              <TabsTrigger value="movimentacao" className="flex-1">
                Movimentação
                {movimentos.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {movimentos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="intimacao" className="flex-1">
                Intimação
                {intimacoes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {intimacoes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="documentos" className="flex-1">
                Documentos
                {documentos.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {documentos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="decisao" className="flex-1">
                Decisão
                {decisoes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {decisoes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="partes" className="flex-1">
                Partes
                {partes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {partes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movimentacao" className="py-4">
              <div className="space-y-4">
                {movimentos.map((movimento: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 border-b pb-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {formatDate(movimento.dataHora)}
                      </div>
                      <div className="font-medium">{movimento.nome}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="intimacao" className="py-4">
              <div className="space-y-4">
                {intimacoes.map((intimacao: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 border-b pb-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {formatDate(intimacao.data)}
                      </div>
                      <div className="font-medium">{intimacao.descricao}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="py-4">
              <div className="space-y-4">
                {documentos.map((documento: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 border-b pb-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {formatDate(documento.data)}
                      </div>
                      <div className="font-medium">{documento.descricao}</div>
                      {documento.tipo && (
                        <div className="text-sm text-gray-500">
                          Tipo: {documento.tipo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="decisao" className="py-4">
              <div className="space-y-4">
                {decisoes.map((decisao: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 border-b pb-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {formatDate(decisao.data)}
                      </div>
                      <div className="font-medium">{decisao.descricao}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="partes" className="py-4">
              <div className="space-y-4">
                {partes.map((parte: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">{parte.nome}</div>
                    <div className="text-sm text-gray-500">Papel: {parte.papel}</div>
                    {parte.documento && (
                      <div className="text-sm text-gray-500">
                        Documento: {parte.documento}
                      </div>
                    )}
                    {Array.isArray(parte.advogados) && parte.advogados.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Advogados:</div>
                        {parte.advogados.map((advogado: any, advIndex: number) => (
                          <div key={advIndex} className="text-sm text-gray-500">
                            {advogado.nome} - OAB: {advogado.inscricao}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-end gap-2 mt-4">
            {onView && (
              <Button variant="outline" size="sm" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            )}
            {onDelete && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar exclusão</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                      Excluir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
