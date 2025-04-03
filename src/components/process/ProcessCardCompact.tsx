
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
import { cn } from "@/lib/utils";
import { useBreakpoint } from "@/hooks/use-mobile";
import { ProcessBadge, EventBadge, MovementBadge, SubjectBadge, StatusBadge, DateInfoBadge } from "@/components/process/ProcessBadge";

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
  const breakpoint = useBreakpoint();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';
  const isXSmall = breakpoint === 'xsmall';

  const handleDelete = async () => {
    if (disabled || !onDelete) return;
    
    setLoading(true);
    try {
      await onDelete(process.id);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string, includeTime = false) => {
    if (!dateString) return "Não informada";
    try {
      const formatString = includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
      return format(new Date(dateString), formatString, { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getStatusBadgeProps = (status?: string) => {
    if (!status) return { variant: "secondary" as const };
    
    if (status === "Baixado") {
      return { 
        variant: "destructive" as const,
        className: "bg-red-600 text-white"
      };
    } 
    return { variant: "secondary" as const };
  };

  const assunto = process.metadata?.assuntos?.[0];
  const movimentacoes = process.movimentacoes || [];
  const movimentacoesCount = movimentacoes.length;
  const eventosCount = process.metadata?.eventos?.length || 0;

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader className={cn("bg-gray-50", isXSmall ? "p-2" : isSmallScreen ? "p-2.5" : "p-3")}>
        <div className="flex flex-wrap items-start gap-2 justify-between">
          <div className="flex items-start gap-2">
            {onToggleSelect && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => onToggleSelect(process.id)}
                className="mt-1"
              />
            )}
            <div className="flex-1 min-w-0"> {/* min-w-0 é crucial para permitir que os filhos com texto façam wrap */}
              <div className="flex items-center flex-wrap gap-1">
                <span className={cn(
                  "font-medium text-gray-700 break-all", 
                  isXSmall ? "text-xs" : isSmallScreen ? "text-sm" : ""
                )}>
                  {formatProcessNumber(process.number)}
                </span>
                {!isSmallScreen && (
                  <StatusBadge 
                    label={process.status || "Em andamento"} 
                    className={cn(
                      "ml-2",
                      process.status === "Baixado" && "bg-red-600"
                    )}
                  />
                )}
              </div>
              
              <div className="flex flex-wrap mt-1 gap-1">
                {eventosCount > 0 && (
                  <EventBadge 
                    count={eventosCount} 
                    label="eventos" 
                    className={isSmallScreen ? "max-w-[95px]" : ""}
                  />
                )}
                {movimentacoesCount > 0 && (
                  <MovementBadge 
                    count={movimentacoesCount} 
                    label={isSmallScreen ? "mov." : "movimentação processual"}
                    className={isSmallScreen ? "max-w-[95px]" : ""} 
                  />
                )}
              </div>

              <div className="flex flex-wrap mt-1 gap-1">
                <StatusBadge 
                  label={process.title || `Mandado de Segurança Cível`}
                  className={isSmallScreen ? "max-w-[95px]" : ""}
                />
                
                {assunto && (
                  <SubjectBadge 
                    label={assunto.nome} 
                    code={assunto.codigo}
                    className={isSmallScreen ? "max-w-[95px]" : ""}
                  />
                )}
              </div>

              <div className="flex flex-wrap mt-2 gap-1">
                <DateInfoBadge 
                  label="Data Ajuizamento" 
                  value={formatDate(process.metadata?.dataAjuizamento || "")} 
                />
                
                <DateInfoBadge 
                  label="Tribunal" 
                  value={process.court || "Não informado"} 
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <DateInfoBadge 
                  label="Grau" 
                  value={process.metadata?.grau || "G1"} 
                />
              </div>

              <div className="flex flex-wrap text-xs text-gray-500 mt-1">
                <div className={cn("mr-4", isXSmall ? "text-[0.6rem]" : "")}>
                  Criado em: {formatDate(process.created_at || "", true)}
                </div>
                <div className={isXSmall ? "text-[0.6rem]" : ""}>
                  Última Atualização: {formatDate(process.updated_at || "", true)}
                </div>
              </div>
            </div>
          </div>
          
          {isSmallScreen ? (
            <div className="flex items-center flex-wrap justify-end gap-1 w-full mt-2">
              {renderActionButtons()}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {renderActionButtons()}
            </div>
          )}
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
  
  function renderActionButtons() {
    return (
      <>
        {onRefresh && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRefresh(process.id)}
            disabled={loading || disabled}
            className={cn("text-blue-500 hover:text-blue-700 hover:bg-blue-50", 
              isXSmall ? "h-6 w-6 p-0" : isSmallScreen ? "h-7 w-7 p-0" : "h-7 px-2")}
            title="Atualizar processo"
          >
            <RefreshCw className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
        
        {onPrint && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPrint(process)}
            className={cn("text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              isXSmall ? "h-6 w-6 p-0" : isSmallScreen ? "h-7 w-7 p-0" : "h-7 px-2")}
            title="Imprimir processo"
          >
            <Printer className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
        
        {onView && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(process)}
            className={cn("text-green-500 hover:text-green-700 hover:bg-green-50",
              isXSmall ? "h-6 w-6 p-0" : isSmallScreen ? "h-7 w-7 p-0" : "h-7 px-2")}
            title="Visualizar processo"
          >
            <Eye className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
        
        {onShare && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onShare(process)}
            className={cn("text-orange-500 hover:text-orange-700 hover:bg-orange-50",
              isXSmall ? "h-6 w-6 p-0" : isSmallScreen ? "h-7 w-7 p-0" : "h-7 px-2")}
            title="Compartilhar processo"
          >
            <Share2 className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
        
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading || disabled}
            className={cn("text-red-500 hover:text-red-700 hover:bg-red-50",
              isXSmall ? "h-6 w-6 p-0" : isSmallScreen ? "h-7 w-7 p-0" : "h-7 px-2")}
            title="Excluir processo"
          >
            <Trash className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
        
        {onToggleDetails && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleDetails(process.id)}
            className={cn("text-gray-700",
              isXSmall ? "h-6 w-6 p-0" : isSmallScreen ? "h-7 w-7 p-0" : "h-7 px-2")}
            title={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}
          >
            {showDetails ? (
              <ChevronUp className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
            ) : (
              <ChevronDown className={cn(isXSmall ? "h-3 w-3" : "h-4 w-4")} />
            )}
          </Button>
        )}
      </>
    );
  }
}
