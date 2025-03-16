
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Edit, Plus, FileText, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProcessDocumentsProps {
  processId: string;
  hitId?: string;
}

interface Document {
  id: string;
  process_id: string;
  hit_id?: string;
  title: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export function ProcessDocuments({ processId, hitId }: ProcessDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [processId, hitId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Verificar se a tabela existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('process_documents')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        // Tabela não existe, criar a tabela
        await createDocumentsTable();
        setDocuments([]);
        return;
      }
      
      let query = supabase
        .from('process_documents')
        .select('*')
        .eq('process_id', processId)
        .order('created_at', { ascending: false });
      
      if (hitId) {
        query = query.eq('hit_id', hitId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setDocuments(data || []);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      toast.error("Não foi possível carregar os documentos do processo");
    } finally {
      setLoading(false);
    }
  };

  const createDocumentsTable = async () => {
    try {
      // Esta operação deve ser feita pelo administrador do banco de dados
      console.log("Tabela de documentos não existe, seria necessário criá-la");
      toast.error("Tabela de documentos não configurada. Entre em contato com o administrador.");
      return false;
    } catch (error) {
      console.error("Erro ao criar tabela de documentos:", error);
      return false;
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar se o arquivo é PDF, DOC ou DOCX
      const fileType = file.type;
      if (
        fileType !== 'application/pdf' && 
        fileType !== 'application/msword' && 
        fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        toast.error("Apenas arquivos PDF, DOC ou DOCX são permitidos");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleViewDocument = async (document: Document) => {
    try {
      setCurrentDocument(document);
      
      // Obter URL pública do documento
      const { data, error } = await supabase
        .storage
        .from('process-documents')
        .createSignedUrl(document.file_path, 60); // URL válida por 60 segundos
      
      if (error) {
        throw error;
      }
      
      setDocumentUrl(data.signedUrl);
      setIsViewerOpen(true);
    } catch (error) {
      console.error("Erro ao visualizar documento:", error);
      toast.error("Não foi possível visualizar o documento");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const documentToDelete = documents.find(doc => doc.id === id);
      
      if (!documentToDelete) {
        throw new Error("Documento não encontrado");
      }
      
      // Excluir o arquivo do armazenamento
      const { error: storageError } = await supabase
        .storage
        .from('process-documents')
        .remove([documentToDelete.file_path]);
      
      if (storageError) {
        throw storageError;
      }
      
      // Excluir o registro do banco de dados
      const { error: dbError } = await supabase
        .from('process_documents')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        throw dbError;
      }
      
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== id));
      toast.success("Documento excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      toast.error("Não foi possível excluir o documento");
    } finally {
      setDocumentToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Selecione um arquivo para upload");
      return;
    }
    
    try {
      // Verificar se o bucket existe e criar se necessário
      const { error: bucketError } = await supabase
        .storage
        .getBucket('process-documents');
      
      if (bucketError) {
        // Criar o bucket se não existir
        await supabase
          .storage
          .createBucket('process-documents', {
            public: false,
            fileSizeLimit: 50000000 // 50MB
          });
      }
      
      // Fazer upload do arquivo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${processId}/${Date.now()}.${fileExt}`;
      
      const { data: fileData, error: uploadError } = await supabase
        .storage
        .from('process-documents')
        .upload(fileName, selectedFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Salvar os metadados no banco de dados
      const documentData = {
        process_id: processId,
        hit_id: hitId,
        title,
        file_path: fileName,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
      };
      
      const { data, error } = await supabase
        .from('process_documents')
        .insert(documentData)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success("Documento adicionado com sucesso");
      
      // Atualizar a lista de documentos
      fetchDocuments();
      
      // Resetar formulário e fechar diálogo
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      toast.error("Não foi possível salvar o documento");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Inteiro Teor</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-1" /> Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
              <DialogDescription>
                Faça upload do documento de inteiro teor do processo
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo (PDF, DOC, DOCX)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!selectedFile}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>Nenhuma informação encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg p-3 space-y-2 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    <div className="flex flex-wrap gap-2 items-center mt-1 text-sm text-gray-600">
                      <span>{doc.file_name}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {doc.file_type.includes('pdf') ? 'PDF' : doc.file_type.includes('word') ? 'DOCX' : 'DOC'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Adicionado em: {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      setDocumentToDelete(doc.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{currentDocument?.title}</DialogTitle>
            <DialogDescription>
              {currentDocument?.file_name} ({formatFileSize(currentDocument?.file_size || 0)})
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 h-full min-h-[400px] overflow-hidden">
            {documentUrl && (
              currentDocument?.file_type.includes('pdf') ? (
                <iframe
                  src={`${documentUrl}#toolbar=1`}
                  className="w-full h-full border-0"
                  title={currentDocument?.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <FileText className="h-16 w-16 text-blue-500" />
                  <p className="text-center">
                    Este tipo de documento não pode ser visualizado diretamente no navegador.
                  </p>
                  <Button
                    onClick={() => window.open(documentUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" /> Baixar Documento
                  </Button>
                </div>
              )
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewerOpen(false)}>
              Fechar
            </Button>
            {documentUrl && (
              <Button
                onClick={() => window.open(documentUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-1" /> Baixar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => documentToDelete && handleDelete(documentToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
