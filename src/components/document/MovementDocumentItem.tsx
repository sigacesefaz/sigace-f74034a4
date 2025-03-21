
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { File, Eye, Trash2, FileText, FileImage } from "lucide-react";
import { DocumentViewer } from "@/components/ui/document-viewer";
import { deleteDocument } from "@/services/document";
import { toast } from "@/components/ui/use-toast";
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

interface MovementDocumentItemProps {
  document: {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
  };
  onDelete: () => void;
}

export function MovementDocumentItem({ document, onDelete }: MovementDocumentItemProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = () => {
    if (document.fileType.startsWith("image/")) {
      return <FileImage className="h-4 w-4" />;
    } else if (document.fileType === "application/pdf") {
      return <File className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDocument(document.id);
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso."
      });
      onDelete();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md text-sm">
        <div className="flex items-center space-x-2 truncate">
          {getFileIcon()}
          <span className="truncate" title={document.title}>{document.title}</span>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => setViewerOpen(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DocumentViewer 
        open={viewerOpen} 
        onOpenChange={setViewerOpen} 
        url={document.fileUrl}
        mimeType={document.fileType}
        title={document.title}
        fileName={document.fileName}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
