import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { useProcessImport } from "@/hooks/useProcessImport";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatProcessNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { formatProcessNumberForQuery } from "@/services/datajudTransformers";
import { mapHitToDatajudMovimentoProcessual } from "@/services/datajudTransformers";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2 } from "lucide-react";

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProcessImportData {
  numero_processo: string;
}

interface ProcessPreview {
  numero_processo: string;
  classe?: {
    nome?: string;
    codigo?: number;
  };
  orgaoJulgador?: {
    nome?: string;
    codigo?: number;
    codigoMunicipioIBGE?: number;
  };
  dataAjuizamento?: string;
  tribunal?: string;
  grau?: string;
  assuntos?: Array<{
    codigo: string;
    nome: string;
  }>;
  status: 'loading' | 'ready' | 'error' | 'not_found';
  error?: string;
}

interface ProcessDetails {
  id: string;
  numero_processo: string;
  assunto: string;
  data_distribuicao: string;
  orgao_julgador: string;
  status: string;
  created_at: string;
}

type WizardStep = 'upload' | 'validation' | 'confirmation' | 'import' | 'complete';

export function BatchImportDialog({ open, onOpenChange }: BatchImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processesPreview, setProcessesPreview] = useState<ProcessPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleProcessSelect, handleSaveProcess } = useProcessImport();
  const [alreadyImportedProcesses, setAlreadyImportedProcesses] = useState<string[]>([]);
  const [showAlreadyImportedDialog, setShowAlreadyImportedDialog] = useState(false);
  const navigate = useNavigate();
  const [editingProcess, setEditingProcess] = useState<string | null>(null);
  const [editedNumber, setEditedNumber] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [validationTab, setValidationTab] = useState<'success' | 'error'>('success');
  const [importResults, setImportResults] = useState<{ imported: number; alreadyImported: number }>({ imported: 0, alreadyImported: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'csv',
      'xlsx',
      'xls',
      'txt'
    ];

    if (!validTypes.includes(fileType || '')) {
      setError("Por favor, selecione um arquivo CSV, Excel (.xlsx/.xls) ou texto (.txt).");
      return;
    }

    await processFile(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const extractProcessNumbers = async (file: File): Promise<string[]> => {
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase();

    // Para arquivos CSV
    if (fileType === 'text/csv' || fileType === 'csv') {
      const result = await new Promise<ProcessImportData[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as ProcessImportData[]),
          error: (error) => reject(error),
        });
      });
      return result.map(row => row.numero_processo).filter(Boolean);
    }

    // Para arquivos Excel
    if (fileType === 'application/vnd.ms-excel' || 
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'xlsx' ||
        fileType === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<{ numero_processo: string }>(firstSheet);
      return data.map(row => row.numero_processo).filter(Boolean);
    }

    // Para arquivos de texto
    if (fileType === 'text/plain' || fileType === 'txt') {
      const text = await file.text();
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.toLowerCase().includes('numero_processo')); // Remove cabeçalho se existir
    }

    throw new Error('Formato de arquivo não suportado');
  };

  const processFile = async (file: File) => {
    setError(null);
    setProcessesPreview([]);
    setUploadedFileName(file.name);

    try {
      const processNumbers = await extractProcessNumbers(file);

      if (processNumbers.length === 0) {
        setError("Nenhum número de processo encontrado no arquivo.");
        return;
      }

      const updatedPreviews: ProcessPreview[] = [];

      for (const numero_processo of processNumbers) {
        try {
          const formattedNumber = formatProcessNumber(numero_processo);
          
          if (!formattedNumber) {
            updatedPreviews.push({
              numero_processo,
              status: 'error',
              error: 'Número de processo inválido'
            });
            continue;
          }

          // Remove caracteres não numéricos para a busca
          const cleanNumber = formatProcessNumberForQuery(formattedNumber);

          try {
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datajud-proxy`;
            
            const response = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                endpoint: "tjto",
                query: {
                  match: {
                    numeroProcesso: cleanNumber
                  }
                },
                size: 10
              })
            });

            if (!response.ok) {
              updatedPreviews.push({
                numero_processo: formattedNumber,
                status: 'not_found',
                error: 'Processo não encontrado na API'
              });
              continue;
            }

            const processData = await response.json();

            if (!processData.hits || !processData.hits.hits || processData.hits.hits.length === 0) {
              updatedPreviews.push({
                numero_processo: formattedNumber,
                status: 'not_found',
                error: 'Processo não encontrado'
              });
              continue;
            }

            const hit = mapHitToDatajudMovimentoProcessual(processData.hits.hits[0]);
            updatedPreviews.push({
              numero_processo: formattedNumber,
              classe: hit.process.classe,
              orgaoJulgador: hit.process.orgaoJulgador,
              dataAjuizamento: hit.process.dataAjuizamento,
              tribunal: hit.process.tribunal,
              grau: hit.process.grau,
              assuntos: hit.process.assuntos,
              status: 'ready'
            });

          } catch (apiError) {
            updatedPreviews.push({
              numero_processo: formattedNumber,
              status: 'not_found',
              error: 'Erro ao buscar na API'
            });
          }

        } catch (error) {
          updatedPreviews.push({
            numero_processo,
            status: 'error',
            error: 'Erro ao processar o número'
          });
        }
      }

      setProcessesPreview(updatedPreviews);

      const notFoundCount = updatedPreviews.filter(p => p.status === 'not_found').length;
      if (notFoundCount > 0) {
        toast.warning(`${notFoundCount} processo(s) não encontrado(s) na API`);
      }

    } catch (error) {
      setError("Erro ao processar o arquivo. Verifique o formato e tente novamente.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'upload':
        if (processesPreview.length > 0) {
          setCurrentStep('validation');
        }
        break;
      case 'validation':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        handleImportAll();
        setCurrentStep('import');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'validation':
        setCurrentStep('upload');
        break;
      case 'confirmation':
        setCurrentStep('validation');
        break;
      default:
        break;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Selecionar Arquivo';
      case 'validation':
        return 'Validar Processos';
      case 'confirmation':
        return 'Confirmar Importação';
      case 'import':
        return 'Importando Processos';
      case 'complete':
        return 'Importação Concluída';
    }
  };

  const handleImportAll = async () => {
    const processesToImport = processesPreview.filter(p => p.status === 'ready');
    if (processesToImport.length === 0) {
      toast.error("Nenhum processo válido para importar.");
      return;
    }

    // Inicia a importação diretamente
    await startImport(processesToImport);
  };

  const startImport = async (processesToImport: ProcessPreview[]) => {
    console.log("=== INICIANDO IMPORTAÇÃO EM LOTE ===");
    console.log(`Total de processos para importar: ${processesToImport.length}`);
    
    setIsUploading(true);
    setProgress(0);

    let importedCount = 0;
    let alreadyImportedCount = 0;
    const totalProcesses = processesToImport.length;

    for (const process of processesToImport) {
      console.log(`\n=== Processando: ${process.numero_processo} ===`);
      try {
        // Verifica se o processo já existe
        const { data: existingProcess, error: checkError } = await supabase
          .from('processes')
          .select('id')
          .eq('number', process.numero_processo.replace(/\D/g, ''))
          .maybeSingle();

        if (checkError) {
          console.error("Erro ao verificar processo existente:", checkError);
          continue;
        }

        if (existingProcess) {
          console.log("Processo já existe:", existingProcess);
          alreadyImportedCount++;
        } else {
          console.log("Buscando dados do processo...");
          // Primeiro busca os dados do processo
          const movimentos = await handleProcessSelect(process.numero_processo, "tjto");
          
          if (movimentos) {
            console.log("Dados encontrados, tentando salvar...");
            // Se encontrou os dados, tenta salvar o processo
            const saveResult = await handleSaveProcess(movimentos, "tjto");
            console.log("Resultado do salvamento:", saveResult);
            
            if (saveResult === true) {
              console.log("Processo importado com sucesso!");
              importedCount++;
            } else if (saveResult === 'PROCESS_EXISTS') {
              console.log("Processo já existia!");
              alreadyImportedCount++;
            } else {
              console.error("Falha ao salvar processo");
            }
          } else {
            console.error("Falha ao buscar dados do processo");
          }
        }
        
        const currentProgress = Math.round(((importedCount + alreadyImportedCount) / totalProcesses) * 100);
        console.log(`Progresso: ${currentProgress}%`);
        setProgress(currentProgress);
      } catch (error) {
        console.error("Erro ao importar processo:", {
          numero: process.numero_processo,
          error: error instanceof Error ? error.message : error
        });
      }
    }

    console.log("=== IMPORTAÇÃO CONCLUÍDA ===");
    console.log(`Importados: ${importedCount}`);
    console.log(`Já existentes: ${alreadyImportedCount}`);

    setImportResults({ imported: importedCount, alreadyImported: alreadyImportedCount });
    setIsUploading(false);
    setCurrentStep('complete');
  };

  const readyProcesses = processesPreview.filter(p => p.status === 'ready');
  const notFoundProcesses = processesPreview.filter(p => p.status === 'not_found');
  const errorProcesses = processesPreview.filter(p => p.status === 'error');

  const handleRetryProcess = async (originalNumber: string, newNumber: string) => {
    setEditingProcess(null);
    const formattedNumber = formatProcessNumber(newNumber);
    
    if (!formattedNumber) {
      toast.error("Número de processo inválido");
      return;
    }

    try {
      const cleanNumber = formatProcessNumberForQuery(formattedNumber);
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datajud-proxy`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          endpoint: "tjto",
          query: {
            match: {
              numeroProcesso: cleanNumber
            }
          },
          size: 10
        })
      });

      if (!response.ok) {
        toast.error("Processo não encontrado na API");
        return;
      }

      const processData = await response.json();

      if (!processData.hits || !processData.hits.hits || processData.hits.hits.length === 0) {
        toast.error("Processo não encontrado");
        return;
      }

      const hit = mapHitToDatajudMovimentoProcessual(processData.hits.hits[0]);

      // Remove o processo antigo da lista
      setProcessesPreview(prev => prev.filter(p => p.numero_processo !== originalNumber));
      
      // Adiciona o novo processo com os dados atualizados
      setProcessesPreview(prev => [...prev, {
        numero_processo: formattedNumber,
        classe: hit.process.classe,
        orgaoJulgador: hit.process.orgaoJulgador,
        dataAjuizamento: hit.process.dataAjuizamento,
        tribunal: hit.process.tribunal,
        grau: hit.process.grau,
        assuntos: hit.process.assuntos,
        status: 'ready'
      }]);

      toast.success("Processo encontrado e adicionado à lista de importação");
      setValidationTab('success');
    } catch (error) {
      toast.error("Erro ao buscar dados do processo");
    }
  };

  const handleNewImport = () => {
    setCurrentStep('upload');
    setProcessesPreview([]);
    setProgress(0);
    setError(null);
    setUploadedFileName('');
    setImportResults({ imported: 0, alreadyImported: 0 });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {currentStep === 'upload' ? '1' : 
                 currentStep === 'validation' ? '2' :
                 currentStep === 'confirmation' ? '3' :
                 currentStep === 'import' ? '4' : '5'}
              </span>
              {getStepTitle()}
            </DialogTitle>
            {currentStep === 'upload' && (
              <DialogDescription>
                Arraste um arquivo ou clique para selecionar.
                Formatos aceitos: CSV, Excel (.xlsx/.xls) ou texto (.txt).
                O arquivo deve conter uma coluna/linha com os números dos processos.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 'upload' && (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 transition-colors",
                  "flex flex-col items-center justify-center gap-2",
                  isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Arraste um arquivo ou{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-500 hover:text-purple-700 font-medium"
                  >
                    clique para selecionar
                  </button>
                </p>
                <p className="text-xs text-gray-400">
                  Formatos aceitos: CSV, Excel (.xlsx/.xls) ou texto (.txt)
                </p>
              </div>
            )}

            {uploadedFileName && processesPreview.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-green-800">Arquivo carregado com sucesso</h4>
                    <p className="text-sm text-green-600">
                      {uploadedFileName} - {processesPreview.length} processo(s) encontrado(s)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-800">Erro ao carregar arquivo</h4>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'validation' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Resumo da Validação</h3>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>Processos prontos para importar: {readyProcesses.length}</li>
                    <li>Processos com erro: {errorProcesses.length + notFoundProcesses.length}</li>
                  </ul>
                </div>

                <Tabs value={validationTab} onValueChange={(value) => setValidationTab(value as 'success' | 'error')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="success" className="flex gap-2">
                      Prontos para Importar
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                        {readyProcesses.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="error" className="flex gap-2">
                      Com Erro
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                        {errorProcesses.length + notFoundProcesses.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="success" className="mt-4">
                    <ScrollArea className="h-[300px] w-full rounded-md border">
                      <div className="p-4 space-y-2">
                        {readyProcesses.map((process, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-green-50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{process.numero_processo}</p>
                                <div className="text-sm text-gray-500 mt-1 space-y-1">
                                  <p><span className="font-medium">Classe:</span> {process.classe?.nome || 'Não informado'}</p>
                                  <p><span className="font-medium">Órgão Julgador:</span> {process.orgaoJulgador?.nome || 'Não informado'}</p>
                                  <p><span className="font-medium">Tribunal:</span> {process.tribunal || 'Não informado'}</p>
                                </div>
                              </div>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="error" className="mt-4">
                    <ScrollArea className="h-[300px] w-full rounded-md border">
                      <div className="p-4 space-y-2">
                        {[...errorProcesses, ...notFoundProcesses].map((process, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-red-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {editingProcess === process.numero_processo ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editedNumber}
                                      onChange={(e) => setEditedNumber(e.target.value)}
                                      placeholder="Novo número do processo"
                                      className="text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleRetryProcess(process.numero_processo, editedNumber)}
                                    >
                                      Verificar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingProcess(null);
                                        setEditedNumber("");
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="font-medium">{process.numero_processo}</p>
                                    <p className="text-sm text-red-600 mt-1">{process.error}</p>
                                  </>
                                )}
                              </div>
                              {editingProcess !== process.numero_processo && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingProcess(process.numero_processo);
                                    setEditedNumber(process.numero_processo);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {currentStep === 'confirmation' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Confirmação da Importação</h3>
                  <p className="text-sm text-blue-700">
                    Você está prestes a importar {readyProcesses.length} processo(s).
                    Esta ação não pode ser desfeita.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Detalhes da Importação</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Total de processos: {processesPreview.length}</li>
                    <li>Processos válidos: {readyProcesses.length}</li>
                    <li>Processos ignorados: {notFoundProcesses.length + errorProcesses.length}</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 'import' && (
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Importando processos... {progress}%
                </p>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="space-y-4">
                <div className={cn(
                  "border rounded-lg p-4",
                  importResults.imported > 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                )}>
                  <div className="flex items-center gap-2">
                    {importResults.imported > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <h4 className={cn(
                        "font-medium",
                        importResults.imported > 0 ? "text-green-800" : "text-yellow-800"
                      )}>
                        Resultado da Importação
                      </h4>
                      <div className="text-sm space-y-1 mt-2">
                        {importResults.imported > 0 && (
                          <p className="text-green-600">
                            {importResults.imported} processo(s) importado(s) com sucesso
                          </p>
                        )}
                        {importResults.alreadyImported > 0 && (
                          <p className="text-yellow-600">
                            {importResults.alreadyImported} processo(s) já estavam cadastrados
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleNewImport}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Importar Novo Arquivo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full"
                  >
                    Concluir
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {!['upload', 'import', 'complete'].includes(currentStep) && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            
            {!['import', 'complete'].includes(currentStep) && (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 'upload' && processesPreview.length === 0) ||
                  (currentStep === 'validation' && readyProcesses.length === 0)
                }
                className="gap-2"
              >
                {currentStep === 'confirmation' ? 'Iniciar Importação' : 'Próximo'}
                {currentStep !== 'confirmation' && <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={showAlreadyImportedDialog} 
        onOpenChange={setShowAlreadyImportedDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Processos já cadastrados</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              {alreadyImportedProcesses.length === 1
                ? "Este processo já foi cadastrado anteriormente no sistema. Deseja cadastrar outro processo?"
                : `${alreadyImportedProcesses.length} processos já foram cadastrados anteriormente no sistema. Deseja cadastrar outros processos?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="secondary"
              className="bg-[#5C3EBF] text-white hover:bg-[#4C2EA9]"
              onClick={() => {
                setShowAlreadyImportedDialog(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              className="bg-[#5C3EBF] text-white hover:bg-[#4C2EA9]"
              onClick={() => {
                setShowAlreadyImportedDialog(false);
                onOpenChange(false);
                navigate('/processes/new/batch');
              }}
            >
              Sim
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 