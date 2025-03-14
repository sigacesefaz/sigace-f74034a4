
import React from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function PublicSearch() {
  const navigate = useNavigate();

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    // Store the selected process info in sessionStorage for the verification step
    sessionStorage.setItem('publicProcessNumber', processNumber);
    sessionStorage.setItem('publicCourtEndpoint', courtEndpoint);
    
    // Navigate to email verification (next step in wizard)
    navigate('/public/verify');
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Busca de Processo</h2>
        <p className="text-sm text-gray-600">
          Informe o número do processo que deseja consultar
        </p>
      </div>
      
      <ProcessSearch 
        onProcessSelect={handleProcessSelect} 
        isPublic={true}
      />
      
      <div className="text-xs text-gray-500 mt-8 bg-gray-50 p-4 rounded-md">
        <p className="mb-2 font-medium">Informações importantes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Utilize o número completo do processo no padrão CNJ</li>
          <li>A consulta é realizada utilizando a API pública do DATAJUD</li>
          <li>As informações têm caráter meramente informativo</li>
        </ul>
      </div>
    </div>
  );
}
