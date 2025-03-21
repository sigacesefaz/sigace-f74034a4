import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  mimeType: string;
}

export function DocumentViewer({ open, onOpenChange, url, mimeType }: DocumentViewerProps) {
  const isImage = mimeType.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';

  // Ensure the URL is properly encoded
  const encodedUrl = encodeURIComponent(url);
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="w-full h-full">
          {isImage && (
            <img 
              src={url} 
              alt="Document preview" 
              className="w-full h-full object-contain"
            />
          )}
          {isPDF && (
            <iframe
              src={googleDocsUrl}
              className="w-full h-full"
              frameBorder="0"
              title="PDF preview"
              loading="lazy"
            />
          )}
          {!isImage && !isPDF && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Visualização não disponível para este tipo de arquivo.
                <br />
                Por favor, faça o download para visualizar.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 