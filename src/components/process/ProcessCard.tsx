import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Calendar, Building2, Scale, Eye } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeStringValue, getSafeNestedValue } from "@/utils/data";

interface ProcessCardProps {
  process: {
    id: string;
    number: string;
    type: string;
    metadata: any;
    created_at: string;
    updated_at: string;
  };
}

export function ProcessCard({ process }: ProcessCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  return (
    <Card className="p-6">
      {/* Título com badge de tipo */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">TÍTULO</span>
          <span className="text-xs text-muted-foreground">
            Última atualização: {formatDate(process.updated_at)}
          </span>
        </div>
        <h2 className="text-xl font-medium">{safeStringValue(process.type)}</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-blue-600">{safeStringValue(process.number)}</div>
          <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            {safeStringValue(process.metadata?.formato, "Eletrônico")}
          </Badge>
        </div>
      </div>

      {/* Botão Ver menos/mais */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-muted-foreground hover:text-foreground mb-4"
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

      {isExpanded && (
        <>
          {/* Grid de informações com ícones */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm text-muted-foreground">Data do Ajuizamento</div>
                <div className="text-sm">
                  {formatDate(getSafeNestedValue(process.metadata, 'dataAjuizamento'))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm text-muted-foreground">Sistema</div>
                <div className="text-sm">{safeStringValue(process.metadata?.sistema, "Inválido")}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Scale className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm text-muted-foreground">Grau</div>
                <div className="text-sm">{safeStringValue(process.metadata?.grau, "G1")}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm text-muted-foreground">Órgão Julgador</div>
                <div className="text-sm">{safeStringValue(process.metadata?.orgaoJulgador)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2 col-span-2">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Assuntos</div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(process.metadata?.assuntos) ? (
                    process.metadata.assuntos.map((assunto: any, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                        {safeStringValue(assunto.nome)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                      {safeStringValue(process.metadata?.assuntos)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm text-muted-foreground">Nível de Sigilo</div>
                <div className="text-sm">{safeStringValue(process.metadata?.nivelSigilo, "Público")}</div>
              </div>
            </div>
          </div>

          {/* Abas com contadores */}
          <Tabs defaultValue="movimentacao" className="w-full">
            <TabsList className="w-full bg-transparent border-b">
              <TabsTrigger 
                value="movimentacao" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Movimentação
                {process.metadata?.movimentos?.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-900">
                    {process.metadata.movimentos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="intimacao" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Intimação
              </TabsTrigger>
              <TabsTrigger 
                value="documentos" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger 
                value="decisao" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Decisão
              </TabsTrigger>
              <TabsTrigger 
                value="partes" 
                className="flex-1 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Partes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </>
      )}
    </Card>
  );
}
