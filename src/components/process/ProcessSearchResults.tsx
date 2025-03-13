
import { DatajudProcess } from "@/types/datajud";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
            onClick={() => {
              console.log("Card clicked, calling onSelectProcess");
              onSelectProcess(process);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectProcess(process);
              }
            }}
            onTouchStart={(e) => {
              // Prevent default behavior and force click
              e.preventDefault();
              console.log("Touch detected on process card");
              onSelectProcess(process);
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="font-medium">{process.classe?.nome || "Sem classe"}</div>
              <div className="text-sm text-muted-foreground font-mono">{process.numeroProcesso}</div>
              <div className="text-xs text-gray-500">{process.tribunal}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
