import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Court } from "@/types/datajud";
import { courts } from "@/services/datajud";
import { searchProcesses } from "@/services/datajud";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { InputMask } from "@react-input/mask";
interface ProcessSearchProps {
  onProcessSelect: (process: string, courtEndpoint: string) => Promise<boolean>;
  onManualEntry: () => void;
}
export function ProcessSearch({
  onProcessSelect,
  onManualEntry
}: ProcessSearchProps) {
  const [processNumber, setProcessNumber] = useState("");
  const [searchTerm] = useDebounce(processNumber, 500);
  const [isLoading, setIsLoading] = useState(false);
  const [court, setCourt] = useState<Court | null>(courts.ESTADUAL[0]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Formatação do número do processo (remove caracteres não numéricos)
  const cleanProcessNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 5) {
      handleSearch();
    }
  }, [searchTerm, court]);
  const handleSearch = async () => {
    if (!processNumber.trim() || !court) {
      return;
    }
    setIsLoading(true);
    try {
      const cleanNumber = cleanProcessNumber(processNumber);
      const results = await searchProcesses(court.endpoint, cleanNumber);
      setSearchResults(results);
      setHasSearched(true);
      if (results.length === 0) {
        toast.info("Nenhum processo encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar processos");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelectProcess = async (process: any) => {
    if (!court) return;
    setIsLoading(true);
    try {
      const success = await onProcessSelect(process.numeroProcesso, court.endpoint);
      if (!success) {
        toast.error("Erro ao selecionar processo");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Buscar Processo</h3>
          <p className="text-sm text-gray-500">
            Informe o número do processo que deseja importar
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="court">Tribunal</Label>
            <Select value={court?.id || ""} onValueChange={value => {
            const selectedCourt = Object.values(courts).flat().find(c => c.id === value);
            setCourt(selectedCourt || null);
          }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tribunal" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(courts).filter(([key]) =>
              // Filtrar apenas os tribunais ESTADUAL e FEDERAL
              key === "ESTADUAL" || key === "FEDERAL" || key === "SUPERIOR").map(([courtType, courtsList]) => <div key={courtType}>
                      <div className="px-2 py-1.5 text-sm font-semibold">
                        {courtType === "ESTADUAL" ? "Justiça Estadual" : courtType === "FEDERAL" ? "Justiça Federal" : "Tribunais Superiores"}
                      </div>
                      {courtsList.map(court => <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>)}
                      <Separator className="my-1" />
                    </div>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="number">Número do Processo</Label>
            <InputMask component={Input} mask="0000000-00.0000.0.00.0000" placeholder="Exemplo: 0000000-00.0000.0.00.0000" replacement={{
            _: /\d/
          }} value={processNumber} onChange={e => setProcessNumber(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={isLoading} />
          </div>

          <Button type="button" onClick={handleSearch} disabled={!processNumber || isLoading} className="text-white">
            Buscar Processo
          </Button>
        </div>
      </div>

      {isLoading && <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>}

      {!isLoading && hasSearched && <div className="space-y-4">
          <div className="text-sm font-medium">
            {searchResults.length === 0 ? "Nenhum processo encontrado" : `${searchResults.length} processos encontrados`}
          </div>

          <div className="space-y-3">
            {searchResults.slice(0, 5).map((process, index) => <Card key={index} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectProcess(process)}>
                <div className="flex flex-col gap-2">
                  <div className="font-medium">{process.classe?.nome || "Sem classe"}</div>
                  <div className="text-sm text-muted-foreground font-mono">{process.numeroProcesso}</div>
                  <div className="text-xs text-gray-500">{process.tribunal}</div>
                </div>
              </Card>)}
          </div>

          {searchResults.length === 0 && <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                Não foi possível encontrar o processo. Deseja cadastrar manualmente?
              </p>
              <Button variant="outline" onClick={onManualEntry} className="text-white">
                Cadastro Manual
              </Button>
            </div>}
        </div>}

      {!isLoading && !hasSearched && <div className="flex items-center justify-center border rounded-lg p-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Busque um processo pelo número ou cadastre manualmente
            </p>
            <Button variant="outline" onClick={onManualEntry} className="text-blue-950">
              Cadastro Manual
            </Button>
          </div>
        </div>}
    </div>;
}