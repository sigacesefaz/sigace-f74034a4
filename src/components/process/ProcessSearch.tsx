
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courts } from "@/services/datajud";
import { toast } from "sonner";

interface ProcessSearchProps {
  onProcessSelect: (processNumber: string, courtEndpoint: string) => void;
}

export function ProcessSearch({ onProcessSelect }: ProcessSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const courtGroups = {
    "Tribunais Superiores": courts.SUPERIOR || [],
    "Justiça Federal": courts.FEDERAL || [],
    "Justiça Estadual": courts.ESTADUAL || [],
    "Justiça do Trabalho": courts.TRABALHISTA || [],
    "Justiça Eleitoral": courts.ELEITORAL || [],
    "Justiça Militar": courts.MILITAR || [],
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourt || !searchTerm) {
      toast.error("Selecione um tribunal e digite um número de processo");
      return;
    }

    setIsLoading(true);
    try {
      onProcessSelect(searchTerm, selectedCourt);
    } catch (error) {
      toast.error("Erro ao buscar processo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tribunal
          </label>
          <Select
            value={selectedCourt}
            onValueChange={(value) => setSelectedCourt(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tribunal" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(courtGroups).map(([groupName, courts]) => (
                <SelectGroup key={groupName}>
                  <SelectLabel>{groupName}</SelectLabel>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.endpoint}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Processo
          </label>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o número do processo"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Buscando..." : "Buscar Processo"}
        </Button>
      </form>
    </Card>
  );
}
