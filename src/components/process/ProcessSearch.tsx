
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { courts } from "@/services/datajud";

interface ProcessSearchProps {
  onProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  onManual?: () => void;
  isPublic?: boolean;
  showCourtSelector?: boolean;
  isLoading?: boolean;
}

export function ProcessSearch({ 
  onProcessSelect, 
  onManual, 
  isPublic = false, 
  showCourtSelector = false,
  isLoading = false 
}: ProcessSearchProps) {
  const [processNumber, setProcessNumber] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(courts[0]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      if (processNumber && selectedCourt) {
        await onProcessSelect(processNumber, selectedCourt.endpoint);
      } else {
        alert("Por favor, insira o número do processo e selecione o tribunal.");
      }
    } finally {
      setIsSearching(false);
    }
  }, [processNumber, selectedCourt, onProcessSelect]);

  return (
    <Card className="w-full">
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="process-number">Número do Processo</Label>
          <Input
            id="process-number"
            placeholder="Ex: 0000000-00.0000.0.00.0000"
            value={processNumber}
            onChange={(e) => setProcessNumber(e.target.value)}
          />
        </div>

        {showCourtSelector && (
          <div className="grid gap-2">
            <Label htmlFor="court">Tribunal</Label>
            <select 
              id="court"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={selectedCourt.name}
              onChange={(e) => {
                const selected = courts.find(court => court.name === e.target.value);
                if (selected) setSelectedCourt(selected);
              }}
            >
              {courts.map((court) => (
                <option key={court.endpoint} value={court.name}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          className="bg-primary text-white"
          onClick={handleSearch}
          disabled={isLoading || isSearching || !processNumber}
        >
          {isLoading || isSearching ? (
            <>
              <SearchIcon className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <SearchIcon className="mr-2 h-4 w-4" />
              {isPublic ? "Consultar Processo" : "Importar Processo"}
            </>
          )}
        </Button>

        {onManual && !isPublic && (
          <Button 
            variant="outline" 
            onClick={onManual}
            className="mt-2"
          >
            Cadastrar Manualmente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
