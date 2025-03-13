
import { DatajudProcess } from "@/types/datajud";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
    );
  }

  const handleCardClick = (process: DatajudProcess) => {
    console.log("Process card clicked:", process.numeroProcesso);
    // Call onSelectProcess with the selected process
    onSelectProcess(process);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        {`${results.length} processo${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`}
      </div>

      <div className="space-y-3">
        {results.map((process, index) => (
          <Card 
            key={index} 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => handleCardClick(process)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(process);
              }
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="font-medium">{process.classe?.nome || "Sem classe"}</div>
              <div className="text-sm text-muted-foreground font-mono">{process.numeroProcesso}</div>
              <div className="text-xs text-gray-500">{process.tribunal}</div>
              
              {/* Botão para seleção em dispositivos móveis */}
              {isMobile && (
                <div className="mt-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click event from firing
                      handleCardClick(process);
                    }}
                    className="w-full"
                    size="sm"
                  >
                    Selecionar Processo
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
