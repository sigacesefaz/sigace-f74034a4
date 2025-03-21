import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X, ChevronDown, ChevronUp, Upload, FileText, Trash2, Eye } from "lucide-react";
import { Filters } from "@/components/ui/filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/ui/document-viewer";
import debounce from 'lodash/debounce';

interface MovementFilter {
  startDate?: Date;
  endDate?: Date;
  codes?: number[];
  text?: string;
  ascending?: boolean;
}

interface ProcessMovement {
  id: string;
  process_id: number;
  nome: string;
  data_hora: string;
  codigo?: number;
  tipo?: string;
  complemento?: string;
}

interface MovementWithDocuments extends ProcessMovement {
  documents_count?: number;
}

interface MovementDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  publicUrl?: string;
}

interface ProcessMovementsProps {
  processId: string;
  hitId?: string;
  filter?: MovementFilter;
  defaultShowFilter?: boolean;
  defaultAscending?: boolean;
}

export function ProcessMovements({
  processId,
  hitId,
  filter,
  defaultShowFilter = false,
  defaultAscending = false
}: ProcessMovementsProps) {
  const [movements, setMovements] = useState<MovementWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(defaultShowFilter);
  const [selectedMovement, setSelectedMovement] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MovementDocument | null>(null);
  const [documents, setDocuments] = useState<MovementDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 5;

  // Filtros locais
  const [startDate, setStartDate] = useState<Date | undefined>(filter?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(filter?.endDate);
  const [textFilter, setTextFilter] = useState<string>(filter?.text || "");
  const [appliedFilter, setAppliedFilter] = useState<MovementFilter | undefined>(filter);

  useEffect(() => {
    setAppliedFilter(filter);
  }, [filter]);

  useEffect(() => {
    fetchMovements();
  }, [processId, hitId, appliedFilter, currentPage]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      // Primeiro, vamos buscar apenas a contagem total
      const countQuery = supabase.from('process_movements')
        .select('*', { count: 'exact', head: true })
        .eq('process_id', processId);

      if (hitId) {
        countQuery.eq('hit_id', hitId);
      }

      // Aplicar os mesmos filtros na query de contagem
      if (appliedFilter) {
        if (appliedFilter.startDate) {
          countQuery.gte('data_hora', appliedFilter.startDate.toISOString());
        }
        if (appliedFilter.endDate) {
          countQuery.lte('data_hora', appliedFilter.endDate.toISOString());
        }
        if (appliedFilter.text) {
          countQuery.textSearch('nome', appliedFilter.text);
        }
        if (appliedFilter.codes && appliedFilter.codes.length > 0) {
          countQuery.in('codigo', appliedFilter.codes);
        }
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Calcular o número total de páginas
      const totalItems = count || 0;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedTotalPages);

      // Ajustar a página atual se necessário
      const adjustedCurrentPage = Math.min(currentPage, calculatedTotalPages || 1);
      if (adjustedCurrentPage !== currentPage) {
        setCurrentPage(adjustedCurrentPage);
      }

      // Se não houver itens, não precisamos fazer a segunda query
      if (totalItems === 0) {
        setMovements([]);
        return;
      }

      // Calcular o offset correto
      const from = (adjustedCurrentPage - 1) * itemsPerPage;
      const to = Math.min(from + itemsPerPage - 1, totalItems - 1);

      // Fazer a query principal com o offset ajustado
      let query = supabase.from('process_movements')
        .select(`
          id,
          process_id,
          nome,
          data_hora,
          codigo,
          tipo,
          complemento,
          process_movement_documents (id)
        `)
        .eq('process_id', processId)
        .order('data_hora', {
          ascending: appliedFilter?.ascending ?? defaultAscending
        })
        .range(from, to);

      if (hitId) {
        query = query.eq('hit_id', hitId);
      }

      // Aplicar os mesmos filtros na query principal
      if (appliedFilter) {
        if (appliedFilter.startDate) {
          query = query.gte('data_hora', appliedFilter.startDate.toISOString());
        }
        if (appliedFilter.endDate) {
          query = query.lte('data_hora', appliedFilter.endDate.toISOString());
        }
        if (appliedFilter.text) {
          query.textSearch('nome', appliedFilter.text);
        }
        if (appliedFilter.codes && appliedFilter.codes.length > 0) {
          query = query.in('codigo', appliedFilter.codes);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to include documents_count
      const movementsWithCounts = (data || []).map(movement => ({
        id: movement.id,
        process_id: movement.process_id,
        nome: movement.nome,
        data_hora: movement.data_hora,
        codigo: movement.codigo,
        tipo: movement.tipo,
        complemento: movement.complemento,
        documents_count: Array.isArray(movement.process_movement_documents) 
          ? movement.process_movement_documents.length 
          : 0
      })) as MovementWithDocuments[];
      
      setMovements(movementsWithCounts);
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
      toast.error("Não foi possível carregar os movimentos do processo");
      setMovements([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const newFilter = { ...appliedFilter };
    
    if (textFilter) {
      newFilter.text = textFilter;
    } else {
      delete newFilter.text;
    }
    
    if (startDate) {
      newFilter.startDate = startDate;
    } else {
      delete newFilter.startDate;
    }
    
    if (endDate) {
      newFilter.endDate = endDate;
    } else {
      delete newFilter.endDate;
    }

    setAppliedFilter(Object.keys(newFilter).length > 0 ? newFilter : undefined);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };

  const handleUploadClick = (movementId: string) => {
    setSelectedMovement(movementId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedMovement) {
      return;
    }

    const file = event.target.files[0];
    setUploading(true);

    try {
      console.log('Iniciando upload do arquivo:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processId,
        movementId: selectedMovement
      });

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize filename
      const filePath = `${processId}/${selectedMovement}/${sanitizedFileName}_${Date.now()}.${fileExt}`;
      
      console.log('Tentando fazer upload para o storage:', {
        bucket: 'process-documents',
        filePath
      });

      // Configurar os headers corretos para o upload
      const options = {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      };

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('process-documents')
        .upload(filePath, file, options);

      if (uploadError) {
        console.error('Erro detalhado do upload:', uploadError);
        throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
      }

      console.log('Upload concluído com sucesso:', uploadData);

      // Save document reference in database with content type
      console.log('Tentando salvar referência no banco:', {
        process_id: processId,
        movement_id: selectedMovement,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type
      });

      const { error: dbError, data: dbData } = await supabase
        .from('process_movement_documents')
        .insert({
          process_id: processId,
          movement_id: selectedMovement,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single();

      if (dbError) {
        console.error('Erro detalhado do banco:', dbError);

        // Se houve erro no banco, tenta remover o arquivo que foi enviado
        await supabase.storage
          .from('process-documents')
          .remove([filePath]);
        throw new Error(`Erro ao salvar informações do documento: ${dbError.message}`);
      }

      console.log('Documento salvo com sucesso:', dbData);
      toast.success('Documento adicionado com sucesso');
      fetchDocuments(selectedMovement);
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const fetchDocuments = async (movementId: string) => {
    try {
      const { data, error } = await supabase
        .from('process_movement_documents')
        .select('id, file_name, file_path, file_size, mime_type, created_at')
        .eq('movement_id', movementId)
        .order('created_at', { ascending: false })
        .returns<MovementDocument[]>();

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast.error('Erro ao carregar documentos');
    }
  };

  const handleViewDocuments = async (movementId: string) => {
    setSelectedMovement(movementId);
    await fetchDocuments(movementId);
    setShowDocuments(true);
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('process-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('process_movement_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Documento excluído com sucesso');
      if (selectedMovement) {
        fetchDocuments(selectedMovement);
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      // Criar uma URL assinada com flag de download
      const { data, error } = await supabase.storage
        .from('process-documents')
        .createSignedUrl(filePath, 60, {
          download: true,
          transform: {
            quality: 100
          }
        });

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error('Arquivo não encontrado');
      }

      // Usar a URL assinada para download
      window.location.href = data.signedUrl;
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao baixar documento');
    }
  };

  const handleViewDocument = async (document: MovementDocument) => {
    try {
      // Primeiro tentamos obter uma URL assinada com headers corretos
      const { data: signedData, error: signedError } = await supabase.storage
        .from('process-documents')
        .createSignedUrl(document.file_path, 3600, {
          download: false,
          transform: {
            quality: 100
          }
        });

      if (signedError) throw signedError;

      if (signedData?.signedUrl) {
        // Verificar se o documento é um PDF
        if (document.mime_type === 'application/pdf') {
          // Para PDFs, usamos a URL assinada diretamente
          setSelectedDocument({
            ...document,
            publicUrl: signedData.signedUrl
          });
        } else {
          // Para outros tipos de arquivo, obtemos a URL pública
          const { data } = await supabase.storage
            .from('process-documents')
            .getPublicUrl(document.file_path);

          setSelectedDocument({
            ...document,
            publicUrl: data.publicUrl
          });
        }
        setShowDocumentViewer(true);
      }
    } catch (error) {
      console.error('Erro ao obter URL do documento:', error);
      toast.error('Erro ao abrir o documento');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-auto">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
      />

      {selectedDocument && selectedDocument.publicUrl && (
        <DocumentViewer
          open={showDocumentViewer}
          onOpenChange={setShowDocumentViewer}
          url={selectedDocument.publicUrl}
          mimeType={selectedDocument.mime_type}
        />
      )}

      <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documentos do Movimento</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Gerencie os documentos anexados a este movimento processual.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">Nenhum documento encontrado</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{doc.file_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)}
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter section */}
      {showFilter && (
        <Filters 
          onFilter={handleFilterChange} 
          onResetFilter={handleResetFilter}
          showCodeFilter={false}
          showDateFilter={false}
          initialValues={{
            text: textFilter
          }}
        />
      )}

      {/* Movements list */}
      {movements.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Nenhum movimento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((movement) => (
            <Collapsible key={movement.id}>
              <div className="flex items-center justify-between border rounded-md p-2 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{movement.nome}</p>
                      <p className="text-xs text-gray-500">
                        {movement.data_hora ? formatDate(movement.data_hora) : 'Data não disponível'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {movement.documents_count && movement.documents_count > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" /> {movement.documents_count}
                        </Badge>
                      ) : null}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleUploadClick(movement.id)}
                        title="Adicionar documento"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleViewDocuments(movement.id)}
                        title="Ver documentos"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </div>
              </div>

              <CollapsibleContent>
                <div className="p-3 border border-t-0 rounded-b-md bg-gray-50">
                  {movement.complemento && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{movement.complemento}</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
