
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProcessDocuments } from "@/services/document";
import { ProcessDocument } from "@/types/process";
import { FileIcon, Download, Trash2, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DocumentUpload } from "@/components/document/DocumentUpload";
import { DocumentPreview } from "@/components/document/DocumentPreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProcessDocumentsListProps {
  processId: string;
}

export function ProcessDocumentsList({ processId }: ProcessDocumentsListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<ProcessDocument[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ProcessDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [processId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getProcessDocuments(processId);
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Erro ao carregar documentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false);
    fetchDocuments();
    toast.success("Documento enviado com sucesso!");
  };

  const handleDocumentClick = (document: ProcessDocument) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const downloadDocument = (document: ProcessDocument) => {
    window.open(document.fileUrl, "_blank");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileIcon className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileIcon className="h-10 w-10 text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileIcon className="h-10 w-10 text-sky-500" />;
    } else {
      return <FileIcon className="h-10 w-10 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Documentos do Processo</h3>
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documentos do Processo</h3>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
            </DialogHeader>
            <DocumentUpload processId={processId} onSuccess={handleUploadSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum documento encontrado para este processo.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div 
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => handleDocumentClick(document)}
                >
                  {getFileIcon(document.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleDocumentClick(document)}
                  >
                    {document.title}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {document.description || "Sem descrição"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Adicionado em {formatDate(document.createdAt)}
                  </p>
                </div>
                <div className="flex-shrink-0 flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => downloadDocument(document)}
                    title="Baixar documento"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedDocument && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
            </DialogHeader>
            <DocumentPreview document={selectedDocument} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
