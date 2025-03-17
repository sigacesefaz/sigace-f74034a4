import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ProcessDocument } from "@/types/process";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, File, Trash, Download, Eye, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { Filters } from "@/components/ui/filters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
interface ProcessDocumentsProps {
  processId: string;
  hitId?: string;
}
export function ProcessDocuments({
  processId,
  hitId
}: ProcessDocumentsProps) {
  const [documents, setDocuments] = useState<ProcessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<ProcessDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<ProcessDocument[]>([]);
  const itemsPerPage = 5;
  useEffect(() => {
    fetchDocuments();
  }, [processId, hitId]);
  useEffect(() => {
    if (showPreviewDialog && previewDocument) {
      getDocumentUrl(previewDocument);
    }
  }, [showPreviewDialog, previewDocument]);
  useEffect(() => {
    if (documents.length > 0) {
      applyFilters();
    }
  }, [documents, searchText, currentPage]);
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let query = supabase.from('process_documents').select('*').eq('process_id', processId);
      if (hitId) {
        query = query.eq('hit_id', hitId);
      }
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error("Erro detalhado ao buscar documentos:", error);
        throw error;
      }
      setDocuments(data || []);
      setFilteredDocuments(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      toast.error("Não foi possível carregar os documentos do processo");
    } finally {
      setLoading(false);
    }
  };
  const applyFilters = () => {
    let filtered = [...documents];
    if (searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(doc => doc.title.toLowerCase().includes(searchLower) || doc.file_name.toLowerCase().includes(searchLower));
    }
    setFilteredDocuments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };
  const handleFilterChange = (filters: {
    text?: string;
  }) => {
    setSearchText(filters.text || "");
    setCurrentPage(1);
  };
  const handleResetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
  };
  const getDocumentUrl = async (document: ProcessDocument) => {
    try {
      const {
        data,
        error
      } = await supabase.storage.from('process-documents').createSignedUrl(document.file_path, 3600);
      if (error) {
        console.error("Erro ao criar URL assinada:", error);
        throw error;
      }
      setPreviewUrl(data?.signedUrl || null);
    } catch (error) {
      console.error("Erro ao obter URL do documento:", error);
      toast.error("Não foi possível obter a URL do documento");
      setPreviewUrl(null);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Tipo de arquivo não permitido. Por favor, selecione um arquivo PDF ou Word.");
        e.target.value = '';
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("O arquivo é muito grande. O tamanho máximo permitido é 50MB.");
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${processId}_${Date.now()}.${fileExt}`;
      const filePath = `${processId}/${fileName}`;
      console.log(`Enviando arquivo para o bucket 'process-documents', caminho: ${filePath}`);
      const {
        error: uploadError,
        data: uploadData
      } = await supabase.storage.from('process-documents').upload(filePath, file);
      if (uploadError) {
        console.error("Erro detalhado ao fazer upload:", uploadError);
        throw uploadError;
      }
      console.log("Upload realizado com sucesso:", uploadData);
      const newDocument = {
        process_id: processId,
        hit_id: hitId || null,
        title: title.trim(),
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      };
      console.log("Inserindo registro na tabela process_documents:", newDocument);
      const {
        error: dbError,
        data: insertedData
      } = await supabase.from('process_documents').insert(newDocument).select('*').single();
      if (dbError) {
        console.error("Erro detalhado ao inserir no banco:", dbError);

        // Se houve erro no banco, tenta remover o arquivo que foi enviado
        await supabase.storage.from('process-documents').remove([filePath]);
        throw dbError;
      }
      console.log("Documento inserido com sucesso:", insertedData);
      await fetchDocuments();
      setTitle("");
      setFile(null);
      setShowUploadDialog(false);
      toast.success("Documento enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao enviar documento:", error);
      toast.error(`Erro ao enviar documento: ${error.message || 'Tente novamente'}`);
    } finally {
      setUploading(false);
    }
  };
  const handleDelete = async () => {
    if (!documentToDelete) return;
    try {
      const {
        data,
        error: fetchError
      } = await supabase.from('process_documents').select('file_path').eq('id', documentToDelete).single();
      if (fetchError) {
        throw fetchError;
      }
      if (data?.file_path) {
        const {
          error: storageError
        } = await supabase.storage.from('process-documents').remove([data.file_path]);
        if (storageError) {
          console.error("Erro ao excluir arquivo do storage:", storageError);
        }
      }
      const {
        error: dbError
      } = await supabase.from('process_documents').delete().eq('id', documentToDelete);
      if (dbError) {
        throw dbError;
      }
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentToDelete));
      setFilteredDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentToDelete));
      toast.success("Documento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      toast.error("Não foi possível excluir o documento. Por favor, tente novamente.");
    } finally {
      setDocumentToDelete(null);
      setShowDeleteDialog(false);
    }
  };
  const handleDownload = async (document: ProcessDocument) => {
    try {
      const {
        data,
        error
      } = await supabase.storage.from('process-documents').createSignedUrl(document.file_path, 60);
      if (error) {
        throw error;
      }
      if (data?.signedUrl) {
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.file_name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
      toast.error("Não foi possível baixar o documento. Por favor, tente novamente.");
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <File className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('msword')) {
      return <File className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  if (loading) {
    return <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Documentos do Processo</h3>
        <div className="flex gap-2 items-center">
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-1" /> Adicionar Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Documento</DialogTitle>
                <DialogDescription>
                  Faça upload de um documento para o processo. Formatos permitidos: PDF, DOC e DOCX.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Documento *</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Petição inicial, Decisão, etc." required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo *</Label>
                  <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
                  <p className="text-xs text-gray-500">
                    Formatos permitidos: PDF, DOC, DOCX. Tamanho máximo: 50MB.
                  </p>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading || !file || !title.trim()}>
                    {uploading ? "Enviando..." : "Enviar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {showFilter && <Filters onFilter={handleFilterChange} onResetFilter={handleResetFilter} showCodeFilter={false} showDateFilter={false} initialValues={{
      text: searchText
    }} />}

      {filteredDocuments.length === 0 ? <div className="text-center py-4 border rounded-md">
          <File className="h-8 w-8 mx-auto text-gray-300" />
          <p className="mt-1 text-gray-500 text-xs">
            Nenhum documento encontrado.
          </p>
        </div> : <>
          <div className="space-y-2">
            {paginatedDocuments.map(document => <Card key={document.id} className="p-2 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  {getFileIcon(document.file_type)}
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-xs">{document.title}</h4>
                    <p className="text-xs text-gray-500">{document.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{format(new Date(document.created_at), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" onClick={() => {
                setPreviewDocument(document);
                setShowPreviewDialog(true);
              }} title="Visualizar" className="h-6 w-6">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(document)} title="Baixar" className="h-6 w-6">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-6 w-6" onClick={() => {
                setDocumentToDelete(document.id);
                setShowDeleteDialog(true);
              }} title="Excluir">
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>)}
          </div>
          
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>}
      
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewDocument?.title}
            </DialogTitle>
            <DialogDescription>
              {previewDocument?.file_name}
            </DialogDescription>
          </DialogHeader>
          
          {previewUrl ? <div className="w-full h-[70vh] border rounded">
              {previewDocument?.file_type.includes('pdf') ? <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full" title={previewDocument?.title}></iframe> : <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <File className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                    <p className="mb-4">Este documento não pode ser visualizado diretamente no navegador.</p>
                    <Button onClick={() => previewDocument && handleDownload(previewDocument)}>
                      <Download className="h-4 w-4 mr-2" /> Baixar Documento
                    </Button>
                  </div>
                </div>}
            </div> : <div className="flex justify-center items-center h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}