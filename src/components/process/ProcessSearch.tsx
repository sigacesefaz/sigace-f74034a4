import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Listbox } from "@/components/ui/listbox";
import { courts } from "@/services/datajud";
import { SearchIcon } from "lucide-react";

interface ProcessSearchProps {
  onProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  isPublic?: boolean;
  showCourtSelector?: boolean;
}

export function ProcessSearch({ onProcessSelect, isPublic = false, showCourtSelector = false }: ProcessSearchProps) {
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
            <Listbox items={courts} selectedItem={selectedCourt} setSelectedItem={setSelectedCourt} />
          </div>
        )}

        <Button
          className="bg-primary text-white"
          onClick={handleSearch}
          disabled={isSearching || !processNumber}
        >
          {isSearching ? (
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
      </CardContent>
    </Card>
  );
}
