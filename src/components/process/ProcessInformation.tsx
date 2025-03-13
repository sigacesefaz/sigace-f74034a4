
import React from "react";
import { DatajudProcess } from "@/types/datajud";
import { formatDate, formatProcessNumber } from "@/lib/utils";

interface ProcessInformationProps {
  currentProcess: DatajudProcess;
}

export function ProcessInformation({ currentProcess }: ProcessInformationProps) {
  return (
    <div className="grid grid-cols-2 gap-8 mt-8">
      {/* Coluna da esquerda */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Dados do Processo</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Número do Processo:</span>
              <p>{formatProcessNumber(currentProcess.numeroProcesso)}</p>
            </div>
            <div>
              <span className="text-gray-600">Classe:</span>
              <p>{currentProcess.classe?.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="text-gray-600">Data de Ajuizamento:</span>
              <p>{formatDate(currentProcess.dataAjuizamento)}</p>
            </div>
            <div>
              <span className="text-gray-600">Tribunal:</span>
              <p>{currentProcess.tribunal || "Não informado"}</p>
            </div>
            <div>
              <span className="text-gray-600">Grau:</span>
              <p>{currentProcess.grau || "Não informado"}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Assuntos</h3>
          {currentProcess.assuntos && currentProcess.assuntos.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {currentProcess.assuntos.map((assunto, index) => (
                <li key={index}>
                  {assunto.nome} (Código: {assunto.codigo})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nenhum assunto encontrado</p>
          )}
        </div>
      </div>

      {/* Coluna da direita */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Órgão Julgador</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Nome:</span>
              <p>{currentProcess.orgaoJulgador?.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="text-gray-600">Código:</span>
              <p>{currentProcess.orgaoJulgador?.codigo || "Não informado"}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Sistema</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Nome:</span>
              <p>{currentProcess.sistema?.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="text-gray-600">Formato:</span>
              <p>{currentProcess.formato?.nome || "Não informado"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
