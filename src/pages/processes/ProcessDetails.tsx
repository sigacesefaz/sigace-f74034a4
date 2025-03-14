
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ProcessDetails as ProcessDetailsComponent } from "@/components/process/ProcessDetails";
import { ArrowLeft } from "lucide-react";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";

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
  const formatProcessNumber = (number: string): string => {
    if (!number) return "";
    const numericOnly = number.replace(/\D/g, '');
    if (numericOnly.length !== 20) return number;
    return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
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
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/processes')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Processo</h1>
      </div>

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
