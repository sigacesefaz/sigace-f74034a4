
import React from "react";
import { DatajudProcess } from "@/types/datajud";
import { formatDate } from "@/lib/utils";
import { formatProcessNumber } from "@/utils/format";

interface ProcessInformationProps {
  currentProcess: DatajudProcess;
}

export function ProcessInformation({ currentProcess }: ProcessInformationProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      {/* Coluna da esquerda */}
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-sm mb-1">Dados do Processo</h3>
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Número do Processo:</span>
              <span>{formatProcessNumber(currentProcess.numeroProcesso)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Classe:</span>
              <span>{currentProcess.classe?.nome || "Não informado"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Data de Ajuizamento:</span>
              <span>{formatDate(currentProcess.dataAjuizamento)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Tribunal:</span>
              <span>{currentProcess.tribunal || "Não informado"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Grau:</span>
              <span>{currentProcess.grau || "Não informado"}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-1">Assuntos</h3>
          {currentProcess.assuntos && currentProcess.assuntos.length > 0 ? (
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              {currentProcess.assuntos.map((assunto, index) => (
                <li key={index}>
                  {assunto.nome} (Código: {assunto.codigo})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">Nenhum assunto encontrado</p>
          )}
        </div>
      </div>

      {/* Coluna da direita */}
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-sm mb-1">Órgão Julgador</h3>
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Nome:</span>
              <span>{currentProcess.orgaoJulgador?.nome || "Não informado"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Código:</span>
              <span>{currentProcess.orgaoJulgador?.codigo || "Não informado"}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-1">Sistema</h3>
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Nome:</span>
              <span>{currentProcess.sistema?.nome || "Não informado"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">Formato:</span>
              <span>{currentProcess.formato?.nome || "Não informado"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
