import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Process } from "@/types/process";

interface ProcessReportProps {
  process: Process;
}

export function ProcessReport({ process }: ProcessReportProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  return (
    <div className="bg-white print:p-4">
      <div className="space-y-6 print:space-y-4">
        {/* Cabeçalho */}
        <div className="border-b pb-4 print:pb-2">
          <h1 className="text-xl font-bold text-gray-900">
            Dados do Processo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerado em: {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* Informações Básicas */}
        <div className="bg-white rounded-lg p-2 space-y-1">
          <h2 className="font-medium text-sm text-gray-900">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            <p><span className="font-medium text-gray-500">Número do Processo:</span> {process.number || "Não informado"}</p>
            <p><span className="font-medium text-gray-500">Status:</span> {process.status || "Não informado"}</p>
            <p><span className="font-medium text-gray-500">Data de Ajuizamento:</span> {formatDate(process.metadata?.dataAjuizamento)}</p>
            <p><span className="font-medium text-gray-500">Tribunal:</span> {process.court || "Não informado"}</p>
            <p><span className="font-medium text-gray-500">Grau:</span> {process.metadata?.grau || "G1"}</p>
            <p><span className="font-medium text-gray-500">Classe:</span> {process.metadata?.classe?.nome || "Não informado"} {process.metadata?.classe?.codigo ? `(Código: ${process.metadata.classe.codigo})` : ""}</p>
          </div>
        </div>

        {/* Assuntos */}
        <div className="bg-white rounded-lg p-2 space-y-1">
          <h2 className="font-medium text-sm text-gray-900">Assuntos</h2>
          <div className="space-y-1 text-sm">
            {process.metadata?.assuntos?.map((assunto, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded print:bg-transparent print:p-0">
                <p className="text-gray-900">
                  {assunto.nome}
                  {assunto.codigo && ` (Código: ${assunto.codigo})`}
                </p>
              </div>
            )) || <p className="text-gray-500">Nenhum assunto cadastrado</p>}
          </div>
        </div>

        {/* Órgão Julgador */}
        <div className="bg-white rounded-lg p-2 space-y-1">
          <h2 className="font-medium text-sm text-gray-900">Órgão Julgador</h2>
          <div className="text-sm">
            <p><span className="font-medium text-gray-500">Nome:</span> {process.metadata?.orgaoJulgador?.nome || "Não informado"} {process.metadata?.orgaoJulgador?.codigo ? `(Código: ${process.metadata.orgaoJulgador.codigo})` : ""}</p>
          </div>
        </div>

        {/* Movimentações */}
        <div className="bg-white rounded-lg p-2 space-y-1">
          <h2 className="font-medium text-sm text-gray-900">Eventos Processuais</h2>
          <div className="space-y-2 text-sm">
            {process.movimentacoes?.map((movimento, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded print:bg-transparent print:p-0 print:border-b print:pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-900">{movimento.descricao}</p>
                    {movimento.complemento && (
                      <p className="text-gray-600 mt-1">{movimento.complemento}</p>
                    )}
                    {movimento.tipo && (
                      <p className="text-gray-500 text-xs mt-1">Tipo: {movimento.tipo}</p>
                    )}
                  </div>
                  <p className="text-gray-500 whitespace-nowrap">
                    {formatDate(movimento.data)}
                  </p>
                </div>
              </div>
            )) || <p className="text-gray-500">Nenhuma movimentação registrada</p>}
          </div>
        </div>

        {/* Sistema */}
        <div className="bg-white rounded-lg p-2 space-y-1">
          <h2 className="font-medium text-sm text-gray-900">Sistema</h2>
          <div className="grid grid-cols-2 gap-4 print:gap-2 text-sm">
            <p><span className="font-medium text-gray-500">Nome:</span> {process.metadata?.sistema?.nome || "Não informado"}</p>
            <p><span className="font-medium text-gray-500">Formato:</span> {process.metadata?.formato || "Eletrônico"}</p>
          </div>
        </div>

        {/* Datas do Sistema */}
        <div className="bg-white rounded-lg p-2 space-y-1">
          <h2 className="font-medium text-sm text-gray-900">Datas do Sistema</h2>
          <div className="grid grid-cols-2 gap-4 print:gap-2 text-sm">
            <p><span className="font-medium text-gray-500">Criado em:</span> {formatDate(process.created_at)}</p>
            <p><span className="font-medium text-gray-500">Última Atualização:</span> {formatDate(process.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
