
import { useState } from "react";
import { Process } from "@/types/process";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, ChevronUp, Eye, Printer, RefreshCw, Share2, Trash } from "lucide-react";
import { formatProcessNumber } from "@/utils/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

interface ProcessCardCompactProps {
  process: Process;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (process: Process) => void;
  onPrint?: (process: Process) => void;
  onShare?: (process: Process) => void;
  onRefresh?: (id: string) => void;
  showDetails?: boolean;
  onToggleDetails?: (id: string) => void;
  disabled?: boolean;
}

export function ProcessCardCompact({
  process,
  isSelected,
  onToggleSelect,
  onDelete,
  onView,
  onPrint,
  onShare,
  onRefresh,
  showDetails = false,
  onToggleDetails,
  disabled = false
}: ProcessCardCompactProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (disabled || !onDelete) return;
    
    setLoading(true);
    try {
      await onDelete(process.id);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não informada";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-500";
    
    switch (status.toLowerCase()) {
      case "active":
      case "ativo":
      case "em andamento":
        return "bg-green-500";
      case "pending":
      case "pendente":
        return "bg-yellow-500";
      case "closed":
      case "fechado":
      case "arquivado":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const assunto = process.metadata?.assuntos?.[0];

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="bg-gray-50 p-3">
        <div className="flex flex-wrap items-start gap-2 justify-between">
          <div className="flex items-start gap-2">
            {onToggleSelect && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => onToggleSelect(process.id)}
                className="mt-1"
              />
            )}
            <div>
              <CardTitle className="text-lg font-medium text-gray-900">
                {process.title || `Processo ${formatProcessNumber(process.number)}`}
              </CardTitle>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={process.status === "Em andamento" ? "secondary" : "outline"}>
                    {process.status || "Não informado"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatProcessNumber(process.number)}
                  </span>
                </div>
                
                {assunto && (
                  <Badge 
                    variant="default" 
                    className="bg-indigo-500 hover:bg-indigo-600 font-medium whitespace-normal text-xs text-white max-w-fit"
                    title={`${assunto.nome}${assunto.codigo ? ` (${assunto.codigo})` : ''}`}
                  >
                    {assunto.nome}
                    {assunto.codigo && <span className="ml-1 opacity-90">({assunto.codigo})</span>}
                  </Badge>
                )}
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                  <Badge variant="outline">
                    Data Ajuizamento: {formatDate(process.metadata?.dataAjuizamento)}
                  </Badge>
                  <Badge variant="outline">
                    Tribunal: {process.court || "Não informado"}
                  </Badge>
                  <Badge variant="outline">
                    Grau: {process.metadata?.grau || "G1"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRefresh(process.id)}
                disabled={loading || disabled}
                className="h-7 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                title="Atualizar processo"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {onPrint && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPrint(process)}
                className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                title="Imprimir processo"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            
            {onView && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onView(process)}
                className="h-7 px-2 text-green-500 hover:text-green-700 hover:bg-green-50"
                title="Visualizar processo"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {onShare && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onShare(process)}
                className="h-7 px-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                title="Compartilhar processo"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading || disabled}
                className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                title="Excluir processo"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
            
            {onToggleDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleDetails(process.id)}
                className="h-7 px-2 text-gray-700"
                title={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}
              >
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="bg-gray-50 p-3 border-t border-gray-200">
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 space-y-2 shadow-sm">
              <h3 className="font-medium text-sm text-gray-900">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p>
                  <span className="font-medium text-gray-500">Número:</span>{" "}
                  {formatProcessNumber(process.number)}
                </p>
                <p>
                  <span className="font-medium text-gray-500">Classe:</span>{" "}
                  {process.metadata?.classe?.nome || "Não informado"}{" "}
                  {process.metadata?.classe?.codigo ? `(${process.metadata.classe.codigo})` : ""}
                </p>
                <p>
                  <span className="font-medium text-gray-500">Data de Ajuizamento:</span>{" "}
                  {formatDate(process.metadata?.dataAjuizamento)}
                </p>
                <p>
                  <span className="font-medium text-gray-500">Sistema:</span>{" "}
                  {process.metadata?.sistema?.nome || "Não informado"}
                </p>
                <p>
                  <span className="font-medium text-gray-500">Tribunal:</span>{" "}
                  {process.court || "Não informado"}
                </p>
                <p>
                  <span className="font-medium text-gray-500">Órgão Julgador:</span>{" "}
                  {process.metadata?.orgaoJulgador?.nome || "Não informado"}
                </p>
              </div>
            </div>
            
            {process.metadata?.partes && process.metadata.partes.length > 0 && (
              <div className="bg-white rounded-lg p-3 space-y-2 shadow-sm">
                <h3 className="font-medium text-sm text-gray-900">Partes do Processo</h3>
                <div className="space-y-3">
                  {process.metadata.partes.map((parte, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-2">
                      <p className="font-medium">{parte.papel}: {parte.nome}</p>
                      <p className="text-xs text-gray-500">
                        {parte.tipoPessoa} {parte.documento ? `- ${parte.documento}` : ""}
                      </p>
                      {parte.advogados && parte.advogados.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-medium">Advogados:</p>
                          {parte.advogados.map((adv, i) => (
                            <p key={i} className="text-xs text-gray-600">
                              {adv.nome} ({adv.inscricao})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {process.movimentacoes && process.movimentacoes.length > 0 && (
              <div className="bg-white rounded-lg p-3 space-y-2 shadow-sm">
                <h3 className="font-medium text-sm text-gray-900">Últimas Movimentações</h3>
                <div className="space-y-2">
                  {process.movimentacoes.slice(0, 3).map((mov, index) => (
                    <div key={index} className="border-l-2 border-gray-300 pl-2">
                      <p className="text-sm">{mov.descricao || mov.nome}</p>
                      <p className="text-xs text-gray-500">{formatDate(mov.data || mov.data_hora)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
