import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Court, DatajudProcess, DatajudHit } from "@/types/datajud";
import { courts } from "@/services/datajud";
import { searchProcesses } from "@/services/datajud";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface ProcessSearchProps {
  onProcessSelect: (process: string, courtEndpoint: string) => Promise<boolean>;
  onManual?: () => void;
  isLoading?: boolean;
}

export function ProcessSearch({ onProcessSelect, onManual, isLoading: externalLoading }: ProcessSearchProps) {
  const [processNumber, setProcessNumber] = useState("");
  const [searchTerm] = useDebounce(processNumber, 500);
  const [isLoading, setIsLoading] = useState(false);
  // Definir o Tribunal de Justiça do Tocantins como padrão
  const tjtoDefault = courts.ESTADUAL.find(court => court.id === "tjto") || courts.ESTADUAL[0];
  const [court, setCourt] = useState<Court | null>(tjtoDefault);
  const [searchResults, setSearchResults] = useState<DatajudProcess[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Formatação do número do processo (remove caracteres não numéricos)
  const cleanProcessNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const validateProcessNumber = (number: string): boolean => {
    // Verifica se segue o padrão 0000000-00.0000.0.00.0000
    // Formato esperado: 7 dígitos + hífen + 2 dígitos + ponto + 4 dígitos + ponto + 1 dígito + ponto + 2 dígitos + ponto + 4 dígitos
    const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
    return regex.test(number);
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

    // Para pesquisa, aceitamos o formato tanto com quanto sem formatação
    // Validamos apenas se tiver a formatação completa
    if (processNumber.includes("-") || processNumber.includes(".")) {
      if (!validateProcessNumber(processNumber)) {
        toast("Formato inválido", "Use: 0000000-00.0000.0.00.0000", { variant: "destructive" });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Usar o número do processo completo sem limpar caracteres especiais para a API
      const results = await searchProcesses(court.endpoint, processNumber);
      
      // Agrupar resultados por número de processo para mostrar apenas processos únicos
      const uniqueProcesses = new Map<string, DatajudProcess>();
      
      results.forEach(hit => {
        if (!uniqueProcesses.has(hit.process.numeroProcesso)) {
          uniqueProcesses.set(hit.process.numeroProcesso, hit.process);
        }
      });
      
      // Converter o Map para array
      const uniqueProcessArray = Array.from(uniqueProcesses.values());
      
      setSearchResults(uniqueProcessArray);
      setHasSearched(true);
      
      if (uniqueProcessArray.length === 0) {
        toast("Nenhum processo encontrado", "", { variant: "default" });
      }
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
      toast("Erro ao buscar processos", "", { variant: "destructive" });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProcess = async (process: DatajudProcess) => {
    if (!court) return;
    
    setIsLoading(true);
    try {
      const success = await onProcessSelect(process.numeroProcesso, court.endpoint);
      if (!success) {
        toast("Erro ao selecionar processo", "", { variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 20); // Limitar a 20 caracteres numéricos
    
    // Aplicar máscara
    let maskedValue = '';
    if (numericValue.length > 0) {
      // Aplicar formato: 0000000-00.0000.0.00.0000
      const parts = [];
      if (numericValue.length > 0) parts.push(numericValue.slice(0, Math.min(7, numericValue.length)));
      if (numericValue.length > 7) parts.push('-' + numericValue.slice(7, Math.min(9, numericValue.length)));
      if (numericValue.length > 9) parts.push('.' + numericValue.slice(9, Math.min(13, numericValue.length)));
      if (numericValue.length > 13) parts.push('.' + numericValue.slice(13, Math.min(14, numericValue.length)));
      if (numericValue.length > 14) parts.push('.' + numericValue.slice(14, Math.min(16, numericValue.length)));
      if (numericValue.length > 16) parts.push('.' + numericValue.slice(16, Math.min(20, numericValue.length)));
      
      maskedValue = parts.join('');
    }
    
    setProcessNumber(maskedValue);
  };

  return (
    <div className="space-y-6">
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
            <Select 
              value={court?.id || ""} 
              onValueChange={(value) => {
                const selectedCourt = Object.values(courts)
                  .flat()
                  .find(c => c.id === value);
                setCourt(selectedCourt || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tribunal" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(courts)
                  .filter(([key]) => 
                    // Filtrar apenas os tribunais ESTADUAL e FEDERAL
                    key === "ESTADUAL" || key === "FEDERAL" || key === "SUPERIOR"
                  )
                  .map(([courtType, courtsList]) => (
                    <div key={courtType}>
                      <div className="px-2 py-1.5 text-sm font-semibold">
                        {courtType === "ESTADUAL" ? "Justiça Estadual" : 
                         courtType === "FEDERAL" ? "Justiça Federal" : 
                         "Tribunais Superiores"}
                      </div>
                      {courtsList.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                      <Separator className="my-1" />
                    </div>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="processNumber">Número do Processo</Label>
            <Input
              id="processNumber"
              value={processNumber}
              onChange={handleProcessNumberChange}
              className="flex h-10 w-full"
              placeholder="0000000-00.0000.0.00.0000"
              disabled={isLoading}
            />
          </div>

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

      {!isLoading && hasSearched && (
        <div className="space-y-4">
          <div className="text-sm font-medium">
            {searchResults.length === 0 
              ? "Nenhum processo encontrado" 
              : `${searchResults.length} processo${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`}
          </div>

          <div className="space-y-3">
            {searchResults.map((process, index) => (
              <Card 
                key={index} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => handleSelectProcess(process)}
              >
                <div className="flex flex-col gap-2">
                  <div className="font-medium">{process.classe?.nome || "Sem classe"}</div>
                  <div className="text-sm text-muted-foreground font-mono">{process.numeroProcesso}</div>
                  <div className="text-xs text-gray-500">{process.tribunal}</div>
                </div>
              </Card>
            ))}
          </div>

          {searchResults.length === 0 && onManual && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                Não foi possível encontrar o processo. Deseja cadastrar manualmente?
              </p>
              <Button 
                variant="outline" 
                onClick={onManual}
                className="text-white"
              >
                Cadastro Manual
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && !hasSearched && (
        <div className="flex items-center justify-center border rounded-lg p-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Busque um processo pelo número
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
