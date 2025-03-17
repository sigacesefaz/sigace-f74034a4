import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileType, File, Download, X } from "lucide-react";

interface DocumentPreviewProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreview({ document, isOpen, onClose }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (fileName: string | undefined) => {
    if (!fileName) return <FileText className="w-12 h-12 text-gray-500" />;
    
    if (fileName.toLowerCase().includes('.pdf')) {
      return <FileType className="w-12 h-12 text-red-500" />;
    }
    
    if (fileName.toLowerCase().match(/\.(doc|docx)$/)) {
      return <FileText className="w-12 h-12 text-blue-500" />;
    }
    
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const handleDownload = async () => {
    if (!document.url) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(document.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4">
            {getFileIcon(document?.name)}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {document?.title || document?.name || 'Documento'}
          </h3>
          {document?.description && (
            <p className="text-sm text-gray-500 mb-4">
              {document.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4 mr-1" />
              Fechar
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isLoading || !document?.url}
            >
              <Download className="w-4 h-4 mr-1" />
              {isLoading ? 'Baixando...' : 'Download'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
