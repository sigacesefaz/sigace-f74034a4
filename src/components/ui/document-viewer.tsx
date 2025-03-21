
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, FileText } from "lucide-react";

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  mimeType: string;
  title?: string;
  fileName?: string;
}

export function DocumentViewer({ open, onOpenChange, url, mimeType, title, fileName }: DocumentViewerProps) {
  const isImage = mimeType.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';
  const displayTitle = title || fileName || "Documento";

  // Ensure the URL is properly encoded for Google Docs Viewer
  const encodedUrl = encodeURIComponent(url);
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {displayTitle}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="w-full h-[calc(100%-60px)]">
          {isImage && (
            <img 
              src={url} 
              alt={displayTitle} 
              className="w-full h-full object-contain p-4"
            />
          )}
          {isPDF && (
            <iframe
              src={url}
              className="w-full h-full"
              frameBorder="0"
              title={displayTitle}
              loading="lazy"
            />
          )}
          {!isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Visualização não disponível para este tipo de arquivo.
                <br />
                Por favor, faça o download para visualizar.
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
