import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessPrintViewProps {
  process: any;
}

export function ProcessPrintView({ process }: ProcessPrintViewProps) {
  const metadata = process?.metadata || {};
  const movements = metadata.movements || [];
  const subjects = metadata.subjects || [];
  const parties = metadata.parties || [];

  // Safe date formatting function to handle invalid dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não informado";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Data não disponível";
      }
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Data não disponível";
    }
  };

  return (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white p-8 print:p-4 print:shadow-none">
      {/* Cabeçalho */}
      <header className="border-b-2 border-gray-200 pb-4 mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sistema de Gestão de Ações Contra o Estado</h1>
          <h2 className="text-xl mt-2">Relatório do Processo</h2>
          <p className="text-sm text-gray-500 mt-1">Data de Impressão: {formatDate(new Date().toISOString())}</p>
        </div>
      </header>

      {/* Informações Principais */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Informações do Processo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Número:</strong> {process?.number || "Não informado"}</p>
            <p><strong>Status:</strong> {process?.status || "Não informado"}</p>
            <p><strong>Data de Criação:</strong> {formatDate(process?.created_at)}</p>
          </div>
          <div>
            <p><strong>Tipo:</strong> {process?.type || "Não informado"}</p>
            <p><strong>Prioridade:</strong> {process?.priority || "Não informado"}</p>
            <p><strong>Última Atualização:</strong> {formatDate(process?.updated_at)}</p>
          </div>
        </div>
      </section>

      {/* Assuntos */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Assuntos</h3>
        <ul className="list-disc pl-6">
          {subjects && subjects.length > 0 ? subjects.map((subject: any, index: number) => (
            <li key={index}>{subject.name || "Não informado"}</li>
          )) : <li>Nenhum assunto cadastrado</li>}
        </ul>
      </section>

      {/* Partes */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Partes do Processo</h3>
        <div className="grid grid-cols-1 gap-4">
          {parties && parties.length > 0 ? parties.map((party: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <p><strong>Nome:</strong> {party.name || "Não informado"}</p>
              <p><strong>Tipo:</strong> {party.type || "Não informado"}</p>
              <p><strong>Representação:</strong> {party.representation || "Não informado"}</p>
            </div>
          )) : <p>Nenhuma parte cadastrada</p>}
        </div>
      </section>

      {/* Movimentações */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Movimentações</h3>
        <div className="grid grid-cols-1 gap-4">
          {movements && movements.length > 0 ? movements.map((movement: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <div className="flex justify-between">
                <p className="font-semibold">{movement.type || "Não informado"}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(movement.date)}
                </p>
              </div>
              <p className="mt-1">{movement.description || "Sem descrição"}</p>
            </div>
          )) : <p>Nenhuma movimentação cadastrada</p>}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t-2 border-gray-200 pt-4 mt-auto">
        <div className="text-center text-sm text-gray-500">
          <p>SIGACE - Sistema de Gestão de Ações Contra o Estado</p>
          <p>Página 1</p>
        </div>
      </footer>
    </div>
  );
}
