import { useState } from "react";
import { getProcessById } from "@/services/datajud";
import { saveProcess } from "@/services/processService";
import { toast } from "sonner";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { supabase, checkProcessStatus } from '@/lib/supabase';

export function useProcessImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string): Promise<boolean> => {
    setIsLoading(true);
    setImportComplete(false);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast.error("Processo não encontrado");
        setShowManualEntry(true);
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Armazenamos todos os movimentos - não filtramos mais por número de processo
      // Isso é importante para capturar todos os hits relacionados
      setProcessMovimentos(movimentos);
      setSelectedCourt(courtEndpoint);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
      setShowManualEntry(true); // Mostrar opção de cadastro manual também em caso de erro
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProcess = async () => {
    try {
      if (!processMovimentos || processMovimentos.length === 0) {
        toast.error('Nenhum processo selecionado para importação');
        return false;
      }

      const mainProcess = processMovimentos[0].process;
      
      // Verificar se o processo já existe usando apenas o número do processo limpo
      const numeroProcessoLimpo = mainProcess.numeroProcesso.replace(/\D/g, '');
      const { data: existingProcess } = await supabase
        .from('processes')
        .select('id')
        .eq('number', numeroProcessoLimpo)
        .single();

      if (existingProcess) {
        return 'PROCESS_EXISTS';
      }

      // Criar o processo principal com o número limpo
      const { data: process, error: processError } = await supabase
        .from('processes')
        .insert({
          number: numeroProcessoLimpo,
          title: mainProcess.classe?.nome || 'Processo',
          description: '',
          court: selectedCourt,
          status: 'Em andamento', // Status inicial padrão
          type: mainProcess.classe?.nome || 'Não especificado',
          value: 0,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (processError) throw processError;

      // Criar o hit inicial
      const { data: hit, error: hitError } = await supabase
        .from('process_hits')
        .insert({
          process_id: process.id,
          hit_index: 'process',
          hit_id: mainProcess.id,
          hit_score: 1,
          tribunal: selectedCourt,
          numero_processo: mainProcess.numeroProcesso,
          data_ajuizamento: mainProcess.dataAjuizamento,
          grau: mainProcess.grau,
          nivel_sigilo: mainProcess.nivelSigilo,
          formato: mainProcess.formato,
          sistema: mainProcess.sistema,
          classe: mainProcess.classe,
          orgao_julgador: mainProcess.orgaoJulgador,
          data_hora_ultima_atualizacao: mainProcess.dataHoraUltimaAtualizacao,
          valor_causa: mainProcess.valorCausa || 0,
          situacao: mainProcess.situacao,
          user_id: process.user_id
        })
        .select()
        .single();

      if (hitError) throw hitError;

      // Salvar os detalhes do processo
      const { error: detailsError } = await supabase
        .from('process_details')
        .insert({
          process_id: process.id,
          tribunal: selectedCourt,
          data_ajuizamento: mainProcess.dataAjuizamento,
          grau: mainProcess.grau,
          nivel_sigilo: mainProcess.nivelSigilo,
          formato: mainProcess.formato,
          sistema: mainProcess.sistema,
          classe: mainProcess.classe,
          assuntos: mainProcess.assuntos,
          orgao_julgador: mainProcess.orgaoJulgador,
          movimentos: mainProcess.movimentos,
          partes: mainProcess.partes,
          data_hora_ultima_atualizacao: mainProcess.dataHoraUltimaAtualizacao,
          json_completo: mainProcess,
          user_id: process.user_id
        });

      if (detailsError) throw detailsError;

      // Salvar os movimentos do processo
      if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
        const movements = mainProcess.movimentos.map(mov => ({
          process_id: process.id,
          hit_id: hit.id,
          codigo: mov.codigo,
          nome: mov.nome,
          data_hora: mov.dataHora,
          tipo: mov.tipo || null,
          complemento: mov.complemento ? (Array.isArray(mov.complemento) ? mov.complemento.join(', ') : mov.complemento) : null,
          complementos_tabelados: mov.complementosTabelados || [],
          orgao_julgador: mov.orgaoJulgador || null,
          user_id: process.user_id
        }));

        const { error: movementsError } = await supabase
          .from('process_movements')
          .insert(movements);

        if (movementsError) throw movementsError;

        // Após salvar os movimentos, verificar se tem os códigos 22 e 848
        const hasCodigo22 = movements.some(mov => mov.codigo === 22);
        const hasCodigo848 = movements.some(mov => mov.codigo === 848);

        // Atualizar o status do processo se necessário
        if (hasCodigo22 && hasCodigo848) {
          const { error: updateError } = await supabase
            .from('processes')
            .update({ status: 'Baixado' })
            .eq('id', process.id);

          if (updateError) throw updateError;
        }
      }

      // Salvar os assuntos do processo
      if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
        const subjects = mainProcess.assuntos.map(subject => ({
          process_id: process.id,
          hit_id: hit.id,
          codigo: parseInt(subject.codigo) || 0,
          nome: subject.nome,
          principal: subject.principal || false,
          user_id: process.user_id
        }));

        const { error: subjectsError } = await supabase
          .from('process_subjects')
          .insert(subjects);

        if (subjectsError) throw subjectsError;
      }

      setImportComplete(true);
      toast.success('Processo importado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      toast.error('Erro ao salvar processo');
      return false;
    }
  };

  const resetImportState = () => {
    setImportProgress(0);
    setImportComplete(false);
    setProcessMovimentos(null);
    setSelectedCourt(undefined);
    setShowManualEntry(false);
  };

  return {
    isLoading,
    processMovimentos,
    selectedCourt,
    showManualEntry,
    importProgress,
    importComplete,
    setImportProgress,
    setImportComplete,
    setShowManualEntry,
    setProcessMovimentos,
    handleProcessSelect,
    handleSaveProcess,
    resetImportState
  };
}
