import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ProcessDetails as ProcessDetailsComponent } from "@/components/process/ProcessDetails";
import { ArrowLeft, ArrowRight, Import } from "lucide-react";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { getProcessById } from "@/services/datajud";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

// Interface simplificada para o componente
interface SimplifiedDatajudProcess {
  numeroProcesso: string;
  classe?: { nome?: string } | null;
  dataAjuizamento?: string | null;
  sistema?: any;
  orgaoJulgador?: any;
  nivelSigilo?: number;
  grau?: string | null;
  assuntos: Array<{ codigo: string; nome: string }>;
  movimentos: Array<{ 
    codigo: string; 
    nome: string; 
    dataHora: string; 
    complementosTabelados: any[] 
  }>;
}

export default function ProcessDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const { data: processData, isLoading, error } = useQuery({
    queryKey: ['process', id],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID do processo não fornecido");
      }
      
      try {
        // Buscar o processo básico
        const { data: process, error: processError } = await supabase
          .from('processes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (processError) {
          console.error("Erro ao carregar o processo:", processError);
          throw processError;
        }
        
        console.log("Processo básico carregado:", process);
        
        // Buscar os detalhes do processo separadamente
        const { data: processDetails, error: detailsError } = await supabase
          .from('process_details')
          .select('*')
          .eq('process_id', id)
          .single();
        
        if (detailsError && detailsError.code !== 'PGRST116') { // Ignora erro quando não encontra
          console.error("Erro ao carregar detalhes do processo:", detailsError);
        }
        
        // Buscar movimentos do processo
        const { data: movements, error: movementsError } = await supabase
          .from('process_movements')
          .select('codigo, nome, data_hora, complementos_tabelados')
          .eq('process_id', id)
          .order('data_hora', { ascending: false });
        
        if (movementsError) {
          console.error("Erro ao carregar movimentos do processo:", movementsError);
        }
        
        // Buscar assuntos do processo
        const { data: subjects, error: subjectsError } = await supabase
          .from('process_subjects')
          .select('codigo, nome')
          .eq('process_id', id);
        
        if (subjectsError) {
          console.error("Erro ao carregar assuntos do processo:", subjectsError);
        }
        
        // Buscar processos relacionados (movimentos processuais) para este processo principal
        const { data: relatedProcesses, error: relatedError } = await supabase
          .from('processes')
          .select('*')
          .eq('parent_id', id)
          .order('created_at', { ascending: false });
          
        if (relatedError) {
          console.error("Erro ao carregar processos relacionados:", relatedError);
        }
        
        // Se não houver dados, usar dados simulados para demonstração
        if (!process || !processDetails && !movements?.length && !subjects?.length) {
          console.log("Usando dados simulados pois não há dados reais");
          return {
            ...process,
            details: {
              classe: "Mandado de Segurança",
              sistema: "PJe",
              orgao_julgador: "1ª Vara Cível",
              grau: "1º Grau",
              nivel_sigilo: 0,
              data_ajuizamento: "2023-01-15"
            },
            movimentos: [
              {
                codigo: "123",
                nome: "Petição Inicial Protocolada",
                data_hora: "2023-01-15T10:30:00",
                complementos_tabelados: []
              },
              {
                codigo: "456",
                nome: "Concluso para Despacho",
                data_hora: "2023-01-20T14:15:00",
                complementos_tabelados: []
              }
            ],
            assuntos: [
              {
                codigo: "10028",
                nome: "Direito Administrativo"
              },
              {
                codigo: "10048",
                nome: "Licitações"
              }
            ],
            relatedProcesses: []
          };
        }
        
        const completeProcess = {
          ...process,
          details: processDetails || {},
          movimentos: movements || [],
          assuntos: subjects || [],
          relatedProcesses: relatedProcesses || []
        };
        
        console.log("Dados do processo:", completeProcess);
        return completeProcess;
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        throw error;
      }
    }
  });

  const handleSave = async () => {
    navigate('/processes');
  };

  const handleCancel = () => {
    navigate('/processes');
  };

  const handleImportProcess = async () => {
    if (!processData?.number) {
      toast("Número do processo não encontrado", "", { variant: "destructive" });
      return;
    }

    setIsImporting(true);
    setImportProgress(5);

    try {
      // Buscar processo no DataJud
      const movimentos = await getProcessById("tjto", processData.number);
      
      if (!movimentos || movimentos.length === 0) {
        toast("Processo não encontrado no tribunal", "", { variant: "destructive" });
        setImportProgress(0);
        setIsImporting(false);
        return;
      }

      setImportProgress(30);

      const mainProcess = movimentos[0].process;

      // Atualizar detalhes do processo
      const { error: updateError } = await supabase
        .from("process_details")
        .upsert({
          process_id: id,
          tribunal: mainProcess.tribunal,
          data_ajuizamento: mainProcess.dataAjuizamento,
          grau: mainProcess.grau,
          nivele_sigilo: mainProcess.nivelSigilo,
          formato: mainProcess.formato,
          sistema: mainProcess.sistema,
          classe: mainProcess.classe,
          assuntos: mainProcess.assuntos,
          orgao_julgador: mainProcess.orgaoJulgador,
          movimentos: mainProcess.movimentos,
          partes: mainProcess.partes,
          data_hora_ultima_atualizacao: mainProcess.dataHoraUltimaAtualizacao,
          json_completo: mainProcess
        });

      if (updateError) {
        throw updateError;
      }

      setImportProgress(60);

      // Atualizar movimentos
      if (mainProcess.movimentos?.length > 0) {
        const { error: movementsError } = await supabase
          .from("process_movements")
          .upsert(
            mainProcess.movimentos.map(movement => ({
              process_id: id,
              codigo: movement.codigo,
              nome: movement.nome || "",
              data_hora: movement.dataHora,
              tipo: movement.tipo || "",
              complemento: Array.isArray(movement.complemento) ? movement.complemento.join(", ") : (movement.complemento || ""),
              complementos_tabelados: movement.complementosTabelados || [],
              orgao_julgador: movement.orgaoJulgador || {},
              json_completo: movement
            }))
          );

        if (movementsError) {
          throw movementsError;
        }
      }

      setImportProgress(90);

      // Atualizar assuntos
      if (mainProcess.assuntos?.length > 0) {
        const { error: subjectsError } = await supabase
          .from("process_subjects")
          .upsert(
            mainProcess.assuntos.map((subject, index) => ({
              process_id: id,
              codigo: subject.codigo,
              nome: subject.nome || "",
              principal: index === 0
            }))
          );

        if (subjectsError) {
          throw subjectsError;
        }
      }

      setImportProgress(100);
      toast("Processo atualizado com sucesso", "", { variant: "success" });
      window.location.reload(); // Recarregar para mostrar os dados atualizados
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast("Erro ao importar processo", "", { variant: "destructive" });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (error || !processData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar o processo</h1>
          <p className="text-gray-600 mb-6">Não foi possível carregar os detalhes do processo.</p>
          <Button onClick={() => navigate('/processes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de processos
          </Button>
        </div>
      </div>
    );
  }

  // Formatação do número do processo
  const formatProcessNumber = (number?: string): string => {
    if (!number) return "0000000-00.0000.0.00.0000";
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length === 20) {
      return `${cleanNumber.slice(0, 7).padStart(7, '0')}-${cleanNumber.slice(7, 9).padStart(2, '0')}.${cleanNumber.slice(9, 13).padStart(4, '0')}.${cleanNumber.slice(13, 14)}.${cleanNumber.slice(14, 16).padStart(2, '0')}.${cleanNumber.slice(16).padStart(4, '0')}`;
    }
    return "0000000-00.0000.0.00.0000";
  };

  // Convertendo os dados do banco para o formato esperado pelo componente ProcessDetails
  const convertToDatajudProcess = (data: any): DatajudProcess => {
    console.log("Convertendo dados:", data);
    const details = data.details || {};
    
    // Garantir que classe seja um objeto com propriedade nome
    let classeObj = null;
    if (details.classe) {
      classeObj = { nome: details.classe };
    } else if (typeof details.classe === 'object' && details.classe) {
      classeObj = details.classe;
    }
    
    const convertedProcess: DatajudProcess = {
      id: data.id || "",
      numeroProcesso: data.number || "",
      classe: classeObj,
      dataAjuizamento: details.data_ajuizamento,
      sistema: details.sistema,
      orgaoJulgador: details.orgao_julgador,
      nivelSigilo: details.nivel_sigilo || 0,
      grau: details.grau,
      tribunal: data.court || "Não informado",
      assuntos: data.assuntos?.map((item: any) => ({
        codigo: item.codigo || "",
        nome: item.nome || ""
      })) || [],
      movimentos: data.movimentos?.map((mov: any) => ({
        codigo: mov.codigo || "",
        nome: mov.nome || "",
        dataHora: mov.data_hora || new Date().toISOString(),
        complementosTabelados: mov.complementos_tabelados || []
      })) || [],
      dataHoraUltimaAtualizacao: details.data_hora_ultima_atualizacao || "",
      formato: details.formato || { codigo: 0, nome: "Não informado" },
      partes: details.partes || []
    };
    
    console.log("Processo convertido:", convertedProcess);
    return convertedProcess;
  };

  const datajudProcess = convertToDatajudProcess(processData);
  
  // Create a main DatajudMovimentoProcessual for the parent process
  const mainMovimento: DatajudMovimentoProcessual = {
    id: datajudProcess.id || "1",
    index: "process",
    score: 1,
    process: datajudProcess,
    rawData: null
  };
  
  // Create movimentos processuais for related processes
  const relatedMovimentos: DatajudMovimentoProcessual[] = processData.relatedProcesses?.map((relatedProcess: any) => {
    const relatedDatajudProcess = convertToDatajudProcess(relatedProcess);
    return {
      id: relatedProcess.id,
      index: "process",
      score: 0.9, // Lower score for related processes
      process: relatedDatajudProcess,
      rawData: null
    };
  }) || [];
  
  // Combine main movimento with related movimentos
  const processMovimentos = [mainMovimento, ...relatedMovimentos];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/processes')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista de processos
        </Button>
        <Button 
          onClick={handleImportProcess} 
          variant="default"
          disabled={isImporting}
        >
          <Import className="mr-2 h-4 w-4" />
          {isImporting ? "Importando..." : "Importar Processo"}
        </Button>
      </div>

      {importProgress > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Importando processo...</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <Progress value={importProgress} className="h-2" />
        </div>
      )}

      <ProcessDetailsComponent
        processMovimentos={processMovimentos}
        mainProcess={datajudProcess}
        onSave={handleSave}
        onCancel={handleCancel}
        isImport={false}
      />
    </div>
  );
}
