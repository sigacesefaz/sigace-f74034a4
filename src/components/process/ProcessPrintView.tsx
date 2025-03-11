import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessPrintViewProps {
  process: any;
}

export function ProcessPrintView({ process }: ProcessPrintViewProps) {
  const metadata = process.metadata || {};
  const movements = metadata.movements || [];
  const subjects = metadata.subjects || [];
  const parties = metadata.parties || [];

  return (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white p-8 print:p-4 print:shadow-none">
      {/* Cabeçalho */}
      <header className="border-b-2 border-gray-200 pb-4 mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sistema de Gestão e Acompanhamento de Causas e Eventos</h1>
          <h2 className="text-xl mt-2">Relatório do Processo</h2>
          <p className="text-sm text-gray-500 mt-1">Data de Impressão: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </div>
      </header>

      {/* Informações Principais */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Informações do Processo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Número:</strong> {process.number}</p>
            <p><strong>Status:</strong> {process.status}</p>
            <p><strong>Data de Criação:</strong> {format(new Date(process.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
          <div>
            <p><strong>Tipo:</strong> {process.type}</p>
            <p><strong>Prioridade:</strong> {process.priority}</p>
            <p><strong>Última Atualização:</strong> {format(new Date(process.updated_at), "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
        </div>
      </section>

      {/* Assuntos */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Assuntos</h3>
        <ul className="list-disc pl-6">
          {subjects.map((subject: any, index: number) => (
            <li key={index}>{subject.name}</li>
          ))}
        </ul>
      </section>

      {/* Partes */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Partes do Processo</h3>
        <div className="grid grid-cols-1 gap-4">
          {parties.map((party: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <p><strong>Nome:</strong> {party.name}</p>
              <p><strong>Tipo:</strong> {party.type}</p>
              <p><strong>Representação:</strong> {party.representation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Movimentações */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">Movimentações</h3>
        <div className="grid grid-cols-1 gap-4">
          {movements.map((movement: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <div className="flex justify-between">
                <p className="font-semibold">{movement.type}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(movement.date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <p className="mt-1">{movement.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t-2 border-gray-200 pt-4 mt-auto">
        <div className="text-center text-sm text-gray-500">
          <p>SIGACE - Sistema de Gestão e Acompanhamento de Causas e Eventos</p>
          <p>Página 1</p>
        </div>
      </footer>
    </div>
  );
}
