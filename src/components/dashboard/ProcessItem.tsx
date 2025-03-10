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
  Edit,
  Calendar,
  Info,
  Building2,
  ShieldAlert,
  FileText
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
import { safeStringValue, isEmpty, getSafeNestedValue } from "@/lib/utils";

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

// Função para formatar datas curtas
const formatShortDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data curta:", error);
    return "";
  }
};

interface ProcessItemProps {
  process: any;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPrint?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function ProcessItem({ 
  process, 
  onDelete, 
  onView, 
  onEdit, 
  onPrint, 
  onShare 
}: ProcessItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState("Movimentação");

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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(process.id);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(process.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(process.id);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Extrair informações do processo com tratamento de segurança
  const metadata = process.metadata || {};
  
  // Extrair valores básicos com tratamento de segurança
  const processNumber = formatProcessNumber(safeStringValue(process.number || getSafeNestedValue(metadata, 'numeroProcesso', '')));
  
  const lastUpdate = process.updated_at 
    ? format(new Date(process.updated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : "Não informado";
  
  // Informações básicas com tratamento seguro
  const title = safeStringValue(process.title || getSafeNestedValue(metadata, 'classe.nome'), "Não informado");
  const dataAjuizamento = safeStringValue(getSafeNestedValue(metadata, 'dataAjuizamento', ''));
  const sistema = safeStringValue(getSafeNestedValue(metadata, 'sistema.nome', 'Inválido'));
  const grau = safeStringValue(getSafeNestedValue(metadata, 'grau', 'G1'));
  const orgaoJulgador = safeStringValue(getSafeNestedValue(metadata, 'orgaoJulgador.nome', 'Não informado'));
  const nivelSigilo = safeStringValue(getSafeNestedValue(metadata, 'nivelSigilo', 'Público'));
  
  // Assuntos com tratamento seguro
  const assuntos = Array.isArray(metadata.assuntos) ? metadata.assuntos : [];
  const assuntoPrincipal = assuntos.length > 0 ? safeStringValue(assuntos[0]?.nome, "Não informado") : "";

  // Movimentações com tratamento seguro
  const movimentos = Array.isArray(metadata.movimentos) ? metadata.movimentos : [];
  const totalMovimentos = movimentos.length;
  const totalIntimacoes = 0; // Placeholder para futura implementação
  const totalDocumentos = 0; // Placeholder para futura implementação
  
  return (
    <Card className="mb-4 w-full shadow-sm">
      <div className="px-4 pt-4 pb-2">
        {/* Cabeçalho com tipo e última atualização */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-none">TIPO</Badge>
          <span className="text-gray-500 text-xs">Última atualização: {lastUpdate}</span>
        </div>
        
        {/* Título e número do processo */}
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-blue-600 font-medium">{processNumber}</div>
        
        {/* Formato */}
        <div className="flex items-center mt-1 mb-2">
          <span className="text-sm mr-2">Formato:</span>
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-600 border-blue-200">
            Eletrônico
          </Badge>
        </div>
        
        {/* Botão para expandir/retrair */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand}
          className="mt-2 text-sm font-normal"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> Ver mais
            </>
          )}
        </Button>
      </div>
      
      {/* Conteúdo expandido */}
      {isExpanded && (
        <CardContent className="border-t pt-4">
          {/* Grid de informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Data de Ajuizamento</div>
                  <div className="text-sm">{formatDate(dataAjuizamento)}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Sistema</div>
                  <div className="text-sm">{sistema}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Grau</div>
                  <div className="text-sm">{grau}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Órgão Julgador</div>
                  <div className="text-sm">{orgaoJulgador}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <ShieldAlert className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Nível de Sigilo</div>
                  <div className="text-sm">{nivelSigilo}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Assuntos</div>
                  <div>
                    {assuntoPrincipal && (
                      <Badge variant="outline" className="text-xs py-1 bg-yellow-50">
                        {assuntoPrincipal}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs de navegação */}
          <Tabs defaultValue="Movimentação" onValueChange={setCurrentTab} className="mt-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="Movimentação">
                Movimentação 
                <Badge variant="secondary" className="ml-2">{totalMovimentos}</Badge>
              </TabsTrigger>
              <TabsTrigger value="Intimação">
                Intimação
                <Badge variant="secondary" className="ml-2">{totalIntimacoes}</Badge>
              </TabsTrigger>
              <TabsTrigger value="Documentos">
                Documentos
                <Badge variant="secondary" className="ml-2">{totalDocumentos}</Badge>
              </TabsTrigger>
              <TabsTrigger value="Decisão">Decisão</TabsTrigger>
              <TabsTrigger value="Partes">Partes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="Movimentação" className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <Select defaultValue="Mais recentes primeiro">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mais recentes primeiro">Mais recentes primeiro</SelectItem>
                    <SelectItem value="Mais antigos primeiro">Mais antigos primeiro</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex space-x-2">
                  <Input placeholder="dd/mm/aaaa" className="w-32" />
                  <Input placeholder="Nome do movimento" className="w-48" />
                  <Input placeholder="Código" className="w-24" />
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Página 1 de {Math.max(1, Math.ceil(totalMovimentos / 5))}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Lista de movimentações */}
              <div className="space-y-2">
                {movimentos.length > 0 ? (
                  movimentos.slice(0, 5).map((movimento, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {safeStringValue(movimento.codigo, "-")}
                        </Badge>
                        <span className="text-xs">
                          {formatDate(safeStringValue(movimento.dataHora || movimento.data_hora))}
                        </span>
                      </div>
                      <div className="font-medium">{safeStringValue(movimento.nome)}</div>
                      {/* Complementos tabelados se existirem */}
                      {Array.isArray(movimento.complementosTabelados) && movimento.complementosTabelados.length > 0 && (
                        <div className="mt-1 text-sm text-gray-600">
                          {movimento.complementosTabelados.map((comp: any, idx: number) => (
                            <div key={idx} className="text-sm">{safeStringValue(comp)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Nenhuma movimentação encontrada</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="Intimação">
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma intimação disponível</p>
              </div>
            </TabsContent>
            
            <TabsContent value="Documentos">
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum documento disponível</p>
              </div>
            </TabsContent>
            
            <TabsContent value="Decisão">
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma decisão disponível</p>
              </div>
            </TabsContent>
            
            <TabsContent value="Partes">
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma parte disponível</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Botões de ação */}
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleView} title="Visualizar">
              <Eye className="h-4 w-4 mr-2" /> Visualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit} title="Editar">
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} title="Imprimir">
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} title="Compartilhar">
              <Share2 className="h-4 w-4 mr-2" /> Compartilhar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600" title="Excluir">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar exclusão</DialogTitle>
                  <DialogDescription>
                    Você tem certeza que deseja excluir este processo?<br />
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete}>
                    Excluir
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
