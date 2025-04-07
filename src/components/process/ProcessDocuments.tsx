import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StorageService } from "@/services/storageService";
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
  processId: string | null;
  hitId?: string | null;
}

export function ProcessDocuments({ processId, hitId }: ProcessDocumentsProps) {
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

  const validateAndConvertData = (data: any): ProcessDocument => {
    const safeConvert = {
      string: (val: any): string => {
        if (val && typeof val === 'object') {
          if (Object.keys(val).length === 0) return '';
          try {
            return JSON.stringify(val);
          } catch {
            return '';
          }
        }
        return val !== null && val !== undefined ? String(val) : '';
      },
      nullableString: (val: any): string | null => {
        if (typeof val === 'object' && val !== null) {
          return Object.keys(val).length > 0 ? JSON.stringify(val) : null;
        }
        return val !== null && val !== undefined ? String(val) : null;
      },
      number: (val: any): number => {
        if (typeof val === 'number') return val;
        const parsed = Number(val);
        return !isNaN(parsed) ? parsed : 0;
      },
      date: (val: any): string => {
        try {
          return val ? new Date(val).toISOString() : new Date().toISOString();
        } catch {
          return new Date().toISOString();
        }
      }
    };

    return {
      id: safeConvert.string(data.id),
      process_id: safeConvert.string(data.process_id),
      hit_id: safeConvert.nullableString(data.hit_id),
      title: safeConvert.string(data.title),
      file_path: safeConvert.string(data.file_path),
      file_name: safeConvert.string(data.file_name),
      file_type: safeConvert.string(data.file_type),
      file_size: safeConvert.number(data.file_size),
      created_at: safeConvert.date(data.created_at),
      updated_at: data.updated_at ? safeConvert.date(data.updated_at) : undefined
    };
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      if (!processId) {
        setDocuments([]);
        setFilteredDocuments([]);
        return;
      }

      let query = supabase
        .from('process_documents')
        .select('id, process_id, hit_id, title, file_path, file_name, file_type, file_size, created_at, updated_at')
        .eq('process_id', processId);

      if (hitId) {
        query = query.eq('hit_id', hitId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processDocuments = (data || []).map(doc => validateAndConvertData(doc));
      setDocuments(processDocuments);
      setFilteredDocuments(processDocuments);
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      toast.error("Não foi possível carregar os documentos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) || 
        doc.file_name.toLowerCase().includes(searchLower)
      );
    }
    setFilteredDocuments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const getDocumentUrl = async (document: ProcessDocument) => {
    try {
      const url = await StorageService.getFileUrl(
        'process-documents',
        document.file_path,
        3600
      );
      setPreviewUrl(url);
    } catch (error) {
      console.error("Erro ao obter URL:", error);
      toast.error("Não foi possível carregar o documento");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !processId) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${processId}_${Date.now()}.${fileExt}`;
      const filePath = `${processId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('process-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('process_documents')
        .insert({
          process_id: processId,
          hit_id: hitId,
          title: title.trim(),
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments(prev => [...prev, validateAndConvertData(data)]);
      setTitle("");
      setFile(null);
      setShowUploadDialog(false);
      toast.success("Documento enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    try {
      const { data, error } = await supabase
        .from('process_documents')
        .select('file_path')
        .eq('id', documentToDelete)
        .single();

      if (error) throw error;

      if (data?.file_path) {
        await supabase.storage.from('process-documents').remove([data.file_path]);
      }

      await supabase.from('process_documents').delete().eq('id', documentToDelete);
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete));
      toast.success("Documento excluído!");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir documento");
    } finally {
      setDocumentToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDownload = async (doc: ProcessDocument) => {
    try {
      const url = await StorageService.getFileUrl(
        'process-documents',
        doc.file_path,
        60,
        true
      );
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast.error("Erro ao baixar documento");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes.toString()} bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1).toString()} KB`;
    return `${(bytes / 1048576).toFixed(1).toString()} MB`;
  };

  const getFileIcon = (fileType: string): JSX.Element => {
    if (fileType.includes('pdf')) return <File className="h-6 w-6 text-red-500" />;
    if (fileType.includes('word')) return <File className="h-6 w-6 text-blue-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

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

  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo *</Label>
                  <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Enviando..." : "Enviar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-4 border rounded-md">
          <File className="h-8 w-8 mx-auto text-gray-300" />
          <p className="mt-1 text-gray-500 text-xs">Nenhum documento encontrado.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedDocuments.map(document => (
              <Card key={document.id} className="p-2 hover:shadow-sm transition-shadow">
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
                    }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(document)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => {
                      setDocumentToDelete(document.id);
                      setShowDeleteDialog(true);
                    }}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title}</DialogTitle>
            <DialogDescription>{previewDocument?.file_name}</DialogDescription>
          </DialogHeader>
          {previewUrl ? (
            previewDocument?.file_type.includes('pdf') ? (
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-[70vh]" title={previewDocument?.title} />
            ) : (
              <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center">
                  <File className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                  <p className="mb-4">Este documento não pode ser visualizado diretamente no navegador.</p>
                  <Button onClick={() => previewDocument && handleDownload(previewDocument)}>
                    <Download className="h-4 w-4 mr-2" /> Baixar Documento
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="flex justify-center items-center h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
