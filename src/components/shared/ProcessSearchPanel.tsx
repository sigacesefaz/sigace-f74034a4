import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { courts, searchProcesses } from '@/services/datajud';
import { formatProcessNumber } from '@/lib/utils';
import { DatajudMovimentoProcessual } from '@/types/datajud';
import { MaskedInput } from '@/components/ui/input-mask';

interface ProcessSearchPanelProps {
  onProcessSelect: (processes: DatajudMovimentoProcessual[], courtEndpoint: string) => void;
  onManualEntry?: () => void;
  buttonLabel?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProcessSearchPanel({ 
  onProcessSelect, 
  onManualEntry, 
  buttonLabel = "Buscar Processo", 
  isLoading = false, 
  size = 'md' 
}: ProcessSearchPanelProps) {
  const [processNumber, setProcessNumber] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [searchingProcess, setSearchingProcess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [foundProcesses, setFoundProcesses] = useState<DatajudMovimentoProcessual[]>([]);

  const clearProcessNumber = (input: string) => {
    // Remove any non-numeric characters
    return input.replace(/\D/g, '');
  };

  const handleProcessSearch = async () => {
    if (!processNumber || !selectedCourt) {
      setError('Preencha o número do processo e selecione um tribunal');
      return;
    }

    setError(null);
    setSearchingProcess(true);
    setSearched(false);

    try {
      const cleanProcessNumber = clearProcessNumber(processNumber);
      const results = await searchProcesses(selectedCourt, cleanProcessNumber);
      
      setFoundProcesses(results);
      setSearched(true);
      
      if (results.length === 0) {
        setError('Nenhum processo encontrado com os critérios informados');
      }
    } catch (err) {
      console.error('Erro ao buscar processo:', err);
      setError('Erro ao buscar processo. Verifique os critérios informados e tente novamente.');
    } finally {
      setSearchingProcess(false);
    }
  };

  const handleProcessSelectClick = (processos: DatajudMovimentoProcessual[]) => {
    onProcessSelect(processos, selectedCourt);
    setFoundProcesses([]);
    setSearched(false);
  };

  const handleProcessNumberChange = (value: string) => {
    setProcessNumber(value);
    setError(null);
  };

  return (
    <div>
      <div className={`grid ${size === 'sm' ? 'grid-cols-1 gap-2' : 'md:grid-cols-3 gap-4'}`}>
        <div className={size === 'sm' ? 'col-span-1' : 'md:col-span-1'}>
          <Select value={selectedCourt} onValueChange={setSelectedCourt}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Tribunal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Selecione o Tribunal</SelectItem>
              {Object.values(courts).flat().map((court) => (
                <SelectItem key={court.id} value={court.endpoint}>
                  {court.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={size === 'sm' ? 'col-span-1' : 'md:col-span-1'}>
          <MaskedInput
            mask="process"
            value={processNumber}
            onChange={handleProcessNumberChange}
            placeholder="Número do Processo"
            className="w-full"
          />
        </div>

        <div className={size === 'sm' ? 'col-span-1' : 'md:col-span-1'}>
          <Button 
            onClick={handleProcessSearch} 
            className="w-full"
            disabled={!processNumber || !selectedCourt || searchingProcess || isLoading}
          >
            {searchingProcess || isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" /> Buscando...
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-2 text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      {searched && foundProcesses.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">Resultados da busca:</h3>
          <div className="space-y-2">
            {foundProcesses.map((movimento, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => handleProcessSelectClick([movimento])}
              >
                <CardContent 
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{formatProcessNumber(movimento.process.numeroProcesso)}</p>
                    <p className="text-sm text-gray-600">{movimento.process.classe?.nome || "Não informado"}</p>
                    <p className="text-xs text-gray-500">Tribunal: {movimento.process.tribunal}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card's onClick from firing
                      handleProcessSelectClick([movimento]);
                    }}
                  >
                    Selecionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {onManualEntry && searched && foundProcesses.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="mb-2">Nenhum processo encontrado.</p>
          <Button variant="outline" onClick={onManualEntry}>
            Cadastro Manual
          </Button>
        </div>
      )}
    </div>
  );
}
