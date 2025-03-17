import { DatajudProcess } from "@/types/datajud";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatProcessNumber } from "@/utils/format";

interface ProcessSearchResultsProps {
  results: DatajudProcess[];
  hasSearched: boolean;
  isLoading: boolean;
  onSelectProcess: (process: DatajudProcess) => void;
  onManual?: () => void;
}

export function ProcessSearchResults({ 
  results, 
  hasSearched, 
  isLoading, 
  onSelectProcess, 
  onManual 
}: ProcessSearchResultsProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return null; // Loading state is handled in the parent component
  }

  if (!hasSearched) {
    return (
      <div className="flex items-center justify-center border rounded-lg p-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Busque um processo pelo número
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium">Nenhum processo encontrado</div>
        
        {onManual && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">
              Não foi possível encontrar o processo. Deseja cadastrar manualmente?
            </p>
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#3f3f98] bg-[#3f3f98] text-white hover:bg-[#343480] h-10 px-4 py-2"
              onClick={onManual}
            >
              Cadastro Manual
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleProcessSelect = (process: DatajudProcess) => {
    console.log("Selecionando processo:", process.numeroProcesso);
    onSelectProcess(process);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        {`${results.length} processo${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`}
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <Card 
            key={index}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleProcessSelect(result)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleProcessSelect(result);
              }
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="font-medium">{result.classe?.nome || "Sem classe"}</div>
              <div className="flex flex-col">
                <h3 className="font-medium text-gray-900">
                  {formatProcessNumber(result.numeroProcesso)}
                </h3>
              </div>
              <div className="text-xs text-gray-500">{result.tribunal}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
