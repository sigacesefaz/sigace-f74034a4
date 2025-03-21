import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DatajudProcess, DatajudMovimentoProcessual, DatajudParty, DatajudSubject } from '@/types/datajud';

interface ProcessPrintViewProps {
  process: DatajudProcess;
  movimentos?: DatajudMovimentoProcessual[];
}

export function ProcessPrintView({ process, movimentos }: ProcessPrintViewProps) {
  const currentDate = format(new Date(), "dd'/'MM'/'yyyy', 'HH:mm", { locale: ptBR });

  // Ordenar movimentos por data (mais recente primeiro)
  const sortedMovimentos = [...(process.movimentos || [])].sort((a, b) => {
    const dateA = a.dataHora ? new Date(a.dataHora).getTime() : 0;
    const dateB = b.dataHora ? new Date(b.dataHora).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="p-4 max-w-[210mm] mx-auto bg-white">
      {/* Cabeçalho com Logo */}
      <div className="flex items-center gap-3 mb-2 pb-3 border-b print:break-inside-avoid">
        <img 
          src="/images/logo_sefaz.png" 
          alt="Logo Tocantins" 
          className="h-10 object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-[#1e3a8a] text-sm font-bold whitespace-nowrap">SIGACE - Sistema de Gestão de Ações Contra o Estado</h1>
          <h2 className="text-[#1e3a8a] text-sm whitespace-nowrap">Superintendência de Assuntos Jurídicos</h2>
        </div>
      </div>

      {/* Data de Impressão */}
      <div className="flex justify-end mb-4">
        <p className="text-xs text-gray-600">Data de Impressão: {currentDate}</p>
      </div>

      {/* Título do Relatório */}
      <div className="text-center mb-4 print:break-inside-avoid">
        <h2 className="text-lg font-bold">Relatório do Processo</h2>
      </div>

      {/* Informações do Processo */}
      <div className="mb-4 print:break-inside-avoid">
        <h3 className="text-base font-semibold mb-2">Informações do Processo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm"><strong>Número:</strong> {process.numeroProcesso || 'Não informado'}</p>
            <p className="text-sm"><strong>Data de Ajuizamento:</strong> {process.dataAjuizamento ? format(new Date(process.dataAjuizamento), 'dd/MM/yyyy HH:mm') : 'Não informado'}</p>
            <p className="text-sm"><strong>Última Atualização:</strong> {process.dataHoraUltimaAtualizacao ? format(new Date(process.dataHoraUltimaAtualizacao), 'dd/MM/yyyy HH:mm') : 'Não informado'}</p>
            <p className="text-sm"><strong>Nível de Sigilo:</strong> {process.nivelSigilo === 0 ? 'Público' : process.nivelSigilo || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm"><strong>Tribunal:</strong> {process.tribunal || 'Não informado'}</p>
            <p className="text-sm"><strong>Grau:</strong> {process.grau || 'Não informado'}</p>
            <p className="text-sm"><strong>Órgão Julgador:</strong> {process.orgaoJulgador?.nome || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Contagem de Movimentações */}
      <div className="mb-4 print:break-inside-avoid">
        <h3 className="text-base font-semibold mb-2">Contagem de Movimentações</h3>
        <p className="text-sm">Total de movimentações: {sortedMovimentos.length}</p>
      </div>

      {/* Assuntos */}
      <div className="mb-4 print:break-inside-avoid">
        <h3 className="text-base font-semibold mb-2">Assuntos</h3>
        {process.assuntos && process.assuntos.length > 0 ? (
          <ul className="list-disc list-inside">
            {process.assuntos.map((assunto: DatajudSubject, index: number) => (
              <li key={index} className="text-sm">{assunto.nome} {assunto.principal && '(Principal)'}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum assunto cadastrado</p>
        )}
      </div>

      {/* Movimentações */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 print:break-inside-avoid">Movimentações</h3>
        {sortedMovimentos.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {sortedMovimentos.map((movimento, index: number) => (
              <div key={index} className="text-sm p-3 rounded-lg border shadow-sm bg-white print:break-inside-avoid print:shadow-none">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start border-b pb-1">
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="text-xs text-gray-500">Movimentação {sortedMovimentos.length - index}</span>
                      <p className="font-semibold text-primary text-xs">{movimento.nome}</p>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {movimento.dataHora ? format(new Date(movimento.dataHora), 'dd/MM/yyyy HH:mm') : 'Não informado'}
                    </p>
                  </div>
                  
                  {movimento.tipo && (
                    <div className="flex gap-1.5 items-center">
                      <span className="text-xs font-medium text-gray-500">Categoria:</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {movimento.tipo}
                      </span>
                    </div>
                  )}

                  {movimento.complemento && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Complemento:</p>
                      <p className="text-xs text-gray-700">
                        {Array.isArray(movimento.complemento) 
                          ? movimento.complemento.join(', ') 
                          : movimento.complemento}
                      </p>
                    </div>
                  )}

                  {movimento.complementosTabelados && movimento.complementosTabelados.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Complementos:</p>
                      <div>
                        {movimento.complementosTabelados.map((comp, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{comp.nome}:</span> {comp.descricao}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma movimentação cadastrada</p>
        )}
      </div>

      {/* Rodapé */}
      <div className="text-center text-xs font-semibold text-gray-600 border-t py-0.5 mt-auto print:break-inside-avoid">
        <p>SIGACE - Sistema de Gestão de Ações Contra o Estado</p>
      </div>
    </div>
  );
}
