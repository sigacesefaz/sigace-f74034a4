
import React from "react";
import { DatajudParty } from "@/types/datajud";

interface ProcessPartiesListProps {
  parties: DatajudParty[] | undefined;
}

export function ProcessPartiesList({ parties }: ProcessPartiesListProps) {
  if (!parties || parties.length === 0) {
    return <p className="text-gray-500">Nenhuma parte encontrada</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Partes do Processo</h3>
      <div className="space-y-4">
        {parties.map((parte, index) => (
          <div key={index} className="border rounded-md p-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{parte.nome}</h4>
                <p className="text-sm text-gray-600">Papel: {parte.papel}</p>
                <p className="text-sm text-gray-600">Tipo: {parte.tipoPessoa}</p>
                {parte.documento && (
                  <p className="text-sm text-gray-600">Documento: {parte.documento}</p>
                )}
              </div>
            </div>
            
            {parte.advogados && parte.advogados.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Advogados:</p>
                <ul className="text-sm pl-5 list-disc space-y-1 mt-1">
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
