
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DatajudProcess } from "@/types/datajud";
import { useProcessSearch } from "@/hooks/useProcessSearch";
import { ProcessCourtSelector } from "./ProcessCourtSelector";
import { ProcessSearchInput } from "./ProcessSearchInput";
import { ProcessSearchResults } from "./ProcessSearchResults";

interface ProcessSearchProps {
  onProcessSelect: (process: string, courtEndpoint: string) => Promise<boolean>;
  onManual?: () => void;
  isLoading?: boolean;
  isPublic?: boolean;
}

export function ProcessSearch({ onProcessSelect, onManual, isLoading: externalLoading, isPublic = false }: ProcessSearchProps) {
  const {
    processNumber,
    setProcessNumber,
    court,
    setCourt,
    searchResults,
    hasSearched,
    isLoading: searchLoading,
    handleSearch
  } = useProcessSearch();

  const isLoading = searchLoading || externalLoading;

  const handleSelectProcess = async (process: DatajudProcess) => {
    if (!court) {
      console.error("No court selected");
      return;
    }
    
    try {
      console.log("Process selected:", process.numeroProcesso, court.endpoint);
      
      // Call the parent's onProcessSelect function with the correct parameters
      const result = await onProcessSelect(process.numeroProcesso, court.endpoint);
      console.log("Process selection result:", result);
    } catch (error) {
      console.error("Error selecting process:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Buscar Processo</h3>
          <p className="text-sm text-gray-500">
            Informe o número do processo que deseja {isPublic ? "consultar" : "importar"}
          </p>
        </div>

        <div className="grid gap-4">
          <ProcessCourtSelector 
            value={court} 
            onChange={setCourt}
            disabled={isLoading}
          />

          <ProcessSearchInput 
            value={processNumber} 
            onChange={setProcessNumber}
            disabled={isLoading}
          />

          <Button 
            type="button" 
            onClick={handleSearch} 
            disabled={!processNumber || isLoading}
            className="text-white"
          >
            Buscar Processo
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && (
        <ProcessSearchResults 
          results={searchResults}
          hasSearched={hasSearched}
          isLoading={isLoading}
          onSelectProcess={handleSelectProcess}
          onManual={!isPublic ? onManual : undefined}
        />
      )}
    </div>
  );
}
