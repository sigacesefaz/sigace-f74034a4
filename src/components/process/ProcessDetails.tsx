
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatajudProcess } from "@/types/datajud";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, UserCircle, GavelIcon, FileText, Bookmark, AlertCircle } from "lucide-react";

interface ProcessDetailsProps {
  process: DatajudProcess;
  onSave: () => void;
  onCancel: () => void;
}

export function ProcessDetails({ process, onSave, onCancel }: ProcessDetailsProps) {
  // Formatação de data brasileira
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <Card className="p-6 bg-white border-t-4 border-t-primary">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{process.classe?.nome || "Sem classe"}</h2>
            <p className="text-primary font-mono">{process.numeroProcesso}</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-0 h-7 px-3">
            {process.tribunal}
          </Badge>
        </div>

        {/* Detalhes principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data de Ajuizamento
              </h3>
              <p className="mt-1">{formatDate(process.dataAjuizamento)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Órgão Julgador
              </h3>
              <p className="mt-1">{process.orgaoJulgador?.nome || "Não informado"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <GavelIcon className="h-4 w-4" /> Grau
              </h3>
              <p className="mt-1">{process.grau || "Não informado"}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Sistema
              </h3>
              <p className="mt-1">{process.sistema?.nome || "Não informado"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Bookmark className="h-4 w-4" /> Assuntos
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {process.assuntos && process.assuntos.length > 0 ? (
                  process.assuntos.map((assunto, index) => (
                    <Badge key={index} variant="secondary" className="bg-secondary/10 text-secondary-dark border-0">
                      {assunto.nome}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">Nenhum assunto informado</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Nível de Sigilo
              </h3>
              <p className="mt-1">{process.nivelSigilo || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Última atualização */}
        {process.dataHoraUltimaAtualizacao && (
          <div className="text-xs text-gray-500">
            Última atualização: {formatDate(process.dataHoraUltimaAtualizacao)}
          </div>
        )}

        {/* Movimentações */}
        {process.movimentos && process.movimentos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Movimentações</h3>
            <div className="space-y-3">
              {process.movimentos.slice(0, 5).map((movimento, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{movimento.nome}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(movimento.dataHora), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                    {movimento.complementosTabelados && movimento.complementosTabelados.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {movimento.complementosTabelados
                          .map(comp => `${comp.nome}: ${comp.valor || comp.descricao}`)
                          .join(" | ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {process.movimentos.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  + {process.movimentos.length - 5} movimentações não exibidas
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            Importar Processo
          </Button>
        </div>
      </div>
    </Card>
  );
}
