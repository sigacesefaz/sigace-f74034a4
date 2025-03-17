
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Court, DatajudProcess } from "@/types/datajud";
import { searchProcesses } from "@/services/datajud";
import { toast } from "@/hooks/use-toast";
import { courts } from "@/services/courts";

export function useProcessSearch() {
  const [processNumber, setProcessNumber] = useState("");
  const [searchTerm] = useDebounce(processNumber, 500);
  const [isLoading, setIsLoading] = useState(false);
  // Define o Tribunal de Justiça do Tocantins como padrão
  const tjtoDefault = courts.ESTADUAL.find(court => court.id === "tjto") || courts.ESTADUAL[0];
  const [court, setCourt] = useState<Court | null>(tjtoDefault);
  const [searchResults, setSearchResults] = useState<DatajudProcess[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 5) {
      handleSearch();
    }
  }, [searchTerm, court]);

  const validateProcessNumber = (number: string): boolean => {
    // Verifica se segue o padrão 0000000-00.0000.0.00.0000
    const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
    return regex.test(number);
  };

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

  return {
    processNumber,
    setProcessNumber,
    court,
    setCourt,
    searchResults,
    hasSearched,
    isLoading,
    handleSearch
  };
}
