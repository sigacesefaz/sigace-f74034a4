import React from "react";
import { DatajudParty } from "@/types/datajud";
import { formatCPF, formatCNPJ } from "@/utils/masks";

interface ProcessPartiesListProps {
  parties: DatajudParty[] | undefined;
}

export function ProcessPartiesList({ parties }: ProcessPartiesListProps) {
  if (!parties || parties.length === 0) {
    return <p className="text-gray-500">Nenhuma parte encontrada</p>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">Partes do Processo</h3>
      <div className="space-y-3 sm:space-y-4">
        {parties.map((parte, index) => (
          <div key={index} className="border rounded-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <h4 className="font-medium text-sm sm:text-base">{parte.nome}</h4>
                <p className="text-xs sm:text-sm text-gray-600">Papel: {parte.papel}</p>
                <p className="text-xs sm:text-sm text-gray-600">Tipo: {parte.tipoPessoa}</p>
                {parte.documento && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    Documento: {parte.tipoPessoa === "FISICA" ? formatCPF(parte.documento) : formatCNPJ(parte.documento)}
                  </p>
                )}
              </div>
            </div>
            
            {parte.advogados && parte.advogados.length > 0 && (
              <div className="mt-2 sm:mt-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Advogados:</p>
                <ul className="text-xs sm:text-sm pl-4 sm:pl-5 list-disc space-y-1 mt-1">
                  {parte.advogados.map((advogado, i) => (
                    <li key={i}>{advogado.nome} (OAB: {advogado.inscricao})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
