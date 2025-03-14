import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ProcessForm } from "@/components/process/ProcessForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { ArrowLeft } from "lucide-react";
import { ProcessModeSelector } from "@/components/process/ProcessModeSelector";
import { useProcessImport } from "@/hooks/useProcessImport";

type FormMode = "search" | "details" | "manual";

export default function NewProcess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
  
  const {
    processMovimentos,
    selectedCourt,
    showManualEntry,
    importProgress,
    importComplete,
    setImportProgress,
    setImportComplete,
    setShowManualEntry,
    handleProcessSelect,
    resetImportState
  } = useProcessImport();
  
  const handleManualEntry = () => {
    if (currentMode === "search") {
      setCurrentMode("manual");
    }
  };

  const handleSaveProcess = async () => {
    if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
      toast("Dados do processo incompletos", "", { variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    setImportProgress(5); // Start progress bar
    
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      
      if (!user) {
        toast("Usuário não autenticado", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      const mainMovimento = processMovimentos[0];
      const mainProcess = mainMovimento.process;
      
      setImportProgress(10);

      const { data: existingProcess } = await supabase
        .from("processes")
        .select("id")
        .eq("number", mainProcess.numeroProcesso)
        .maybeSingle();

      if (existingProcess) {
        toast("Este processo já foi cadastrado anteriormente", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }
      
      setImportProgress(20);

      console.log("Process data to be inserted:", {
        number: mainProcess.numeroProcesso,
        title: `${mainProcess.classe?.nome || 'Processo'} - ${mainProcess.numeroProcesso}`,
        description: mainProcess.assuntos?.map(a => a.nome).join(", ") || "",
        status: mainProcess.situacao?.nome || "Em andamento",
        court: mainProcess.tribunal,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
        plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || "",
        is_parent: true,
        parent_id: null,
        metadata: JSON.stringify(mainProcess)
      });

      const { data: newProcess, error: insertError } = await supabase
        .from("processes")
        .insert({
          number: mainProcess.numeroProcesso,
          title: `${mainProcess.classe?.nome || 'Processo'} - ${mainProcess.numeroProcesso}`,
          description: mainProcess.assuntos?.map(a => a.nome).join(", ") || "",
          status: mainProcess.situacao?.nome || "Em andamento",
          court: mainProcess.tribunal,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
          plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || "",
          is_parent: true,
          parent_id: null,
          metadata: JSON.stringify(mainProcess)
        })
        .select('id')
        .single();
        
      setImportProgress(40);

      if (insertError) {
        console.error("Error inserting main process:", insertError);
        console.error("Error details:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        toast("Erro ao importar processo", { 
          description: insertError.message,
          variant: "destructive" 
        });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      if (!newProcess?.id) {
        toast("Erro ao obter ID do processo principal criado", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      const mainProcessId = newProcess.id;
      
      setImportProgress(50);

      try {
        const { error: detailsError } = await supabase
          .from("process_details")
          .insert({
            process_id: mainProcessId,
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
          
        setImportProgress(60);

        if (detailsError) {
          console.error("Error inserting main process details:", detailsError);
        }
      } catch (error) {
        console.error("Error inserting main process details:", error);
      }

      setImportProgress(65);
      
      const savePromises = [];
      
      if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
        savePromises.push(saveProcessMovements(mainProcessId, mainProcess.movimentos));
      }
      
      if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
        savePromises.push(saveProcessSubjects(mainProcessId, mainProcess.assuntos));
      }
      
      if (mainProcess.partes && mainProcess.partes.length > 0) {
        savePromises.push(saveProcessParties(mainProcessId, mainProcess.partes));
      }
      
      await Promise.all(savePromises);
      setImportProgress(90);
      
      if (processMovimentos.length > 1) {
        for (let i = 1; i < processMovimentos.length; i++) {
          const additionalMovimento = processMovimentos[i];
          const additionalProcess = additionalMovimento.process;
          
          if (additionalProcess.movimentos && additionalProcess.movimentos.length > 0) {
            await saveProcessMovements(mainProcessId, additionalProcess.movimentos);
          }
        }
      }
      
      setImportProgress(100);
      
      setImportComplete(true);
      toast("Processo importado com sucesso", "", { variant: "success" });
      
      navigate("/processes");
    } catch (error) {
      console.error("Error importing process:", error);
      
      if (error instanceof Error) {
        toast("Erro ao importar processo", error.message, { variant: "destructive" });
      } else {
        toast("Erro ao importar processo", "", { variant: "destructive" });
      }
      
      setImportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProcessMovements = async (processId: string | number, movements: DatajudProcess["movimentos"]) => {
    if (!movements || movements.length === 0) return;
    
    try {
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < movements.length; i += batchSize) {
        const batch = movements.slice(i, i + batchSize).map(movement => ({
          process_id: processId,
          codigo: movement.codigo, 
          nome: movement.nome || "",
          data_hora: movement.dataHora,
          tipo: movement.tipo || "",
          complemento: Array.isArray(movement.complemento) ? movement.complemento.join(", ") : (movement.complemento || ""),
          complementos_tabelados: movement.complementosTabelados || [],
          orgao_julgador: movement.orgaoJulgador || {},
          movimento_principal_id: null,
          json_completo: movement
        }));
        
        batches.push(batch);
      }
      
      await Promise.all(batches.map(async batch => {
        const { error } = await supabase
          .from("process_movements")
          .insert(batch);
          
        if (error) {
          console.error("Erro ao inserir lote de movimentos:", error);
        }
      }));
      
      for (const movement of movements) {
        if (movement.complementosTabelados && Array.isArray(movement.complementosTabelados) && movement.complementosTabelados.length > 0) {
          const { data: insertedMovement } = await supabase
            .from("process_movements")
            .select("id")
            .eq("process_id", processId)
            .eq("codigo", movement.codigo)
            .eq("data_hora", movement.dataHora)
            .order("id", { ascending: false })
            .limit(1)
            .single();
            
          if (insertedMovement) {
            const complementoBatches = [];
            
            for (let i = 0; i < movement.complementosTabelados.length; i += batchSize) {
              const complementoBatch = movement.complementosTabelados.slice(i, i + batchSize).map(complemento => ({
                process_id: processId,
                codigo: complemento.codigo || movement.codigo,
                nome: complemento.nome || complemento.descricao || "Complemento",
                data_hora: movement.dataHora,
                tipo: "COMPLEMENTO_TABELADO",
                complemento: complemento.descricao || "",
                complementos_tabelados: [],
                orgao_julgador: movement.orgaoJulgador || {},
                movimento_principal_id: insertedMovement.id,
                json_completo: complemento
              }));
              
              complementoBatches.push(complementoBatch);
            }
            
            await Promise.all(complementoBatches.map(async batch => {
              const { error } = await supabase
                .from("process_movements")
                .insert(batch);
                
              if (error) {
                console.error("Erro ao inserir lote de complementos:", error);
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao inserir movimentos do processo:", error);
    }
  };

  const saveProcessSubjects = async (processId: string | number, subjects: DatajudProcess["assuntos"]) => {
    if (!subjects || subjects.length === 0) return;
    
    try {
      const subjectsData = subjects.map((subject, index) => ({
        process_id: processId,
        codigo: subject.codigo,
        nome: subject.nome || "",
        principal: index === 0
      }));
      
      const { error } = await supabase
        .from("process_subjects")
        .insert(subjectsData);
        
      if (error) {
        console.error("Erro ao inserir assuntos:", error);
      }
    } catch (error) {
      console.error("Erro ao inserir assuntos do processo:", error);
    }
  };

  const saveProcessParties = async (processId: string | number, parties: any[]) => {
    if (!parties || parties.length === 0) return;
    
    try {
      const partiesData = parties.map(party => ({
        process_id: processId,
        nome: party.nome || "",
        papel: party.papel || "",
        tipo_pessoa: party.tipoPessoa || "",
        documento: party.documento || "",
        advogados: party.advogados || [],
        json_completo: party
      }));
      
      const { error } = await supabase
        .from("process_parties")
        .insert(partiesData);
        
      if (error) {
        console.error("Erro ao inserir partes:", error);
      }
    } catch (error) {
      console.error("Erro ao inserir partes do processo:", error);
    }
  };

  const handleCreateManualProcess = async (processData: any) => {
    setIsLoading(true);
    setImportProgress(5);
    
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast("Usuário não autenticado", "", { variant: "destructive" });
        return;
      }
      
      setImportProgress(30);

      const { data: existingProcess } = await supabase
        .from("processes")
        .select("id")
        .eq("number", processData.number)
        .maybeSingle();

      if (existingProcess) {
        toast("Este processo já foi cadastrado anteriormente", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }
      
      setImportProgress(60);
      
      const {
        error
      } = await supabase.from("processes").insert({
        ...processData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        is_parent: true,
        parent_id: null
      });
      
      setImportProgress(90);
      
      if (error) throw error;
      
      setImportProgress(100);
      
      toast("Processo cadastrado com sucesso", "", { variant: "success" });
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      toast("Erro ao cadastrar processo", "", { variant: "destructive" });
      setImportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    resetImportState();
  };

  const handleImportAnother = () => {
    resetImportState();
    setCurrentMode("search");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProcessModeSelector
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          processMovimentos={processMovimentos}
          showManualEntry={showManualEntry}
          importProgress={importProgress}
          importComplete={importComplete}
          isLoading={isLoading}
          handleProcessSelect={handleProcessSelect}
          handleManualEntry={handleManualEntry}
          handleSaveProcess={handleSaveProcess}
          handleCreateManualProcess={handleCreateManualProcess}
          handleCancel={handleCancel}
          handleImportAnother={handleImportAnother}
        />
      </div>
    </div>
  );
}
