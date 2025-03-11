
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
  Plus
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
  const [currentTab, setCurrentTab] = useState("Movimentação");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Extrair informações do processo com tratamento de segurança
  const metadata = process.metadata || {};
  
  // Extrair valores básicos com tratamento de segurança
  const processNumber = formatProcessNumber(safeStringValue(process.number || getSafeNestedValue(metadata, 'numeroProcesso', '')));
  const lastUpdate = process.updated_at 
    ? formatDate(process.updated_at) 
    : "Não informado";
  
  // Informações básicas com tratamento seguro
  const title = safeStringValue(process.title || getSafeNestedValue(metadata, 'classe.nome'), "Mandado de Segurança Cível");
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
  
  return (
    <Card className="mb-4 w-full shadow-sm">
      <div className="px-4 pt-4 pb-2">
        {/* Cabeçalho com tipo e última atualização */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none">TIPO</Badge>
          <span className="text-gray-500 text-xs">Última atualização: {lastUpdate}</span>
        </div>
        
        {/* Título e número do processo */}
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-blue-600 font-medium">{processNumber}</div>
        
        {/* Formato */}
        <div className="flex items-center mt-1 mb-2">
          <span className="text-sm mr-2">Formato:</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">
            Eletrônico
          </Badge>
        </div>
        
        {/* Botões de ação na linha de baixo */}
        <div className="flex justify-between items-center mt-2 border-t pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand}
            className="text-sm font-normal"
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
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={handleView} title="Visualizar">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Imprimir">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Compartilhar">
              <Share2 className="h-4 w-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600" title="Excluir">
                  <Trash2 className="h-4 w-4" />
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
        </div>
      </div>
      
      {/* Conteúdo expandido */}
      {isExpanded && (
        <CardContent className="border-t pt-4">
          {/* Visão geral do processo principal */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Visão geral do processo</h3>
            
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
                      <Badge variant="outline" className="text-xs py-1 bg-yellow-50">
                        {assuntoPrincipal}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hits Relacionados */}
          {relatedHits.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-3">Hits Relacionados</h3>
              <div className="space-y-3">
                {relatedHits.map((hit) => {
                  const hitMetadata = hit.metadata || {};
                  const hitTitle = safeStringValue(hit.title || getSafeNestedValue(hitMetadata, 'classe.nome'), "Processo Relacionado");
                  const hitNumber = formatProcessNumber(safeStringValue(hit.number || getSafeNestedValue(hitMetadata, 'numeroProcesso', '')));
                  const hitDate = hit.created_at ? formatDate(hit.created_at) : "Data não informada";
                  
                  return (
                    <div key={hit.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{hitTitle}</h4>
                          <div className="text-blue-600 text-sm">{hitNumber}</div>
                          <div className="text-xs text-gray-500 mt-1">{hitDate}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-green-600"
                        >
                          <Link to={`/processes/${hit.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> Ver
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Tabs de navegação */}
          <Tabs defaultValue="Movimentação" onValueChange={setCurrentTab} className="mt-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="Movimentação">
                Movimentação 
                <Badge variant="secondary" className="ml-2">{totalMovimentos}</Badge>
              </TabsTrigger>
              <TabsTrigger value="Intimação">
                Intimação
                <Badge variant="secondary" className="ml-2">0</Badge>
              </TabsTrigger>
              <TabsTrigger value="Documentos">
                Documentos
                <Badge variant="secondary" className="ml-2">0</Badge>
              </TabsTrigger>
              <TabsTrigger value="Decisão">Decisão</TabsTrigger>
              <TabsTrigger value="Partes">Partes</TabsTrigger>
            </TabsList>
            
            {/* Tab de Movimentação */}
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
                
                {/* Exemplos de movimentações para visualização */}
                {movimentos.length === 0 && (
                  <>
                    <div className="border rounded-md p-3">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Badge variant="outline" className="mr-2 text-xs">11383</Badge>
                        <span className="text-xs">09 de maio de 2023 às 16:24</span>
                      </div>
                      <div className="font-medium">Ato ordinatório</div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Badge variant="outline" className="mr-2 text-xs">123</Badge>
                        <span className="text-xs">05 de maio de 2023 às 16:14</span>
                      </div>
                      <div className="font-medium">Remessa</div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Badge variant="outline" className="mr-2 text-xs">11010</Badge>
                        <span className="text-xs">05 de maio de 2023 às 14:43</span>
                      </div>
                      <div className="font-medium">Mero expediente</div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            {/* Tab de Intimação */}
            <TabsContent value="Intimação">
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">Intimações</h3>
                  <Button size="sm" variant="outline" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Intimação
                  </Button>
                </div>
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhuma intimação registrada para este processo</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Documentos */}
            <TabsContent value="Documentos">
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">Documentos</h3>
                  <Button size="sm" variant="outline" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>
                </div>
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum documento disponível para este processo</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Decisão */}
            <TabsContent value="Decisão">
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">Decisões</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <PenSquare className="h-4 w-4 mr-2" />
                        Nova Decisão
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Nova Decisão</DialogTitle>
                        <DialogDescription>
                          Preencha os dados da decisão relativa ao processo.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Título da Decisão</label>
                            <Input id="title" placeholder="Ex: Sentença, Decisão Liminar..." />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium">Tipo de Decisão</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sentenca">Sentença</SelectItem>
                                <SelectItem value="liminar">Liminar</SelectItem>
                                <SelectItem value="despacho">Despacho</SelectItem>
                                <SelectItem value="acordao">Acórdão</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="judge" className="text-sm font-medium">Juiz/Relator</label>
                            <Input id="judge" placeholder="Nome do juiz ou relator" />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Descrição/Conteúdo</label>
                            <Input 
                              id="description" 
                              placeholder="Descrição resumida da decisão" 
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={() => toast("Decisão cadastrada com sucesso")}>Salvar Decisão</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhuma decisão registrada para este processo</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Partes */}
            <TabsContent value="Partes">
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">Partes do Processo</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Nova Parte
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Nova Parte</DialogTitle>
                        <DialogDescription>
                          Adicione informações sobre uma parte envolvida no processo.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome/Razão Social</label>
                            <Input id="name" placeholder="Nome da parte" />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="party_type" className="text-sm font-medium">Tipo de Parte</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="autor">Autor</SelectItem>
                                <SelectItem value="reu">Réu</SelectItem>
                                <SelectItem value="testemunha">Testemunha</SelectItem>
                                <SelectItem value="perito">Perito</SelectItem>
                                <SelectItem value="terceiro_interessado">Terceiro Interessado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="document" className="text-sm font-medium">CPF/CNPJ</label>
                            <Input id="document" placeholder="Documento de identificação" />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="representative" className="text-sm font-medium">Representante Legal</label>
                            <Input id="representative" placeholder="Nome do representante" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={() => toast("Parte cadastrada com sucesso")}>Salvar Parte</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {partes && partes.length > 0 ? (
                  <div className="space-y-3">
                    {partes.map((parte: any, index: number) => {
                      const tipoParte = safeStringValue(parte.tipo);
                      const nomeParte = safeStringValue(parte.pessoa?.nome);
                      
                      return (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between">
                            <div>
                              <Badge variant="outline" className="mb-1 bg-blue-50 text-blue-700">
                                {tipoParte}
                              </Badge>
                              <h4 className="font-medium">{nomeParte}</h4>
                              {parte.pessoa?.numeroDocumentoPrincipal && (
                                <p className="text-sm text-gray-500">
                                  Documento: {parte.pessoa.numeroDocumentoPrincipal}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> Detalhes
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Nenhuma parte registrada para este processo</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
