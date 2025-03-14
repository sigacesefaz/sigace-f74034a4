
import React, { useState } from "react";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { useNavigate } from "react-router-dom";
import { PublicProcessDialog } from "@/components/process/PublicProcessDialog";

export default function PublicSearch() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(true);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    // Store the selected process info in sessionStorage for the verification step
    sessionStorage.setItem('publicProcessNumber', processNumber);
    sessionStorage.setItem('publicCourtEndpoint', courtEndpoint);
    
    // Navigate to email verification
    navigate('/public/verify');
    return true;
  };

  // If dialog is closed, navigate back to home
  if (!showDialog) {
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Consulta Pública de Processos</h2>
          <p className="text-gray-600">
            Utilize esta ferramenta para consultar informações públicas de processos judiciais.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <ProcessSearch 
            onProcessSelect={handleProcessSelect} 
            isPublic={true}
          />
        </div>
      </div>

      <PublicProcessDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
      />
    </div>
  );
}
