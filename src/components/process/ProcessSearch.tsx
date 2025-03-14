
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courts } from "@/services/datajud";
import { SearchIcon } from "lucide-react";

interface ProcessSearchProps {
  onProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  isPublic?: boolean;
  showCourtSelector?: boolean;
  onManual?: () => void;
  isLoading?: boolean;
}

export function ProcessSearch({ 
  onProcessSelect, 
  isPublic = false, 
  showCourtSelector = false,
  onManual,
  isLoading: externalIsLoading
}: ProcessSearchProps) {
  const [processNumber, setProcessNumber] = useState("");
  
  // Get all courts by flattening the courts object which is organized by categories
  const allCourts = Object.values(courts).flat();
  
  // Set the first court as the default selected court
  const [selectedCourt, setSelectedCourt] = useState(allCourts[0]);
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
            <Select 
              value={selectedCourt?.id} 
              onValueChange={(value) => {
                const court = allCourts.find(c => c.id === value);
                if (court) setSelectedCourt(court);
              }}
            >
              <SelectTrigger id="court">
                <SelectValue placeholder="Selecione o tribunal" />
              </SelectTrigger>
              <SelectContent>
                {allCourts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          className="bg-primary text-white"
          onClick={handleSearch}
          disabled={externalIsLoading || isSearching || !processNumber}
        >
          {externalIsLoading || isSearching ? (
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
