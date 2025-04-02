
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  binaryData?: Uint8Array | null;
  mimeType: string;
  fileName?: string;
}

export function DocumentViewer({ 
  open, 
  onOpenChange, 
  url, 
  binaryData, 
  mimeType, 
  fileName 
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  
  const isImage = mimeType.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      
      if (binaryData) {
        try {
          // Convert binary data to object URL for display
          const blob = new Blob([binaryData], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);
          setLocalUrl(objectUrl);
          setLoading(false);
        } catch (err) {
          console.error('Error creating object URL from binary data:', err);
          setError('Erro ao processar o arquivo');
          setLoading(false);
        }
      } else if (url && url.trim() !== '') {
        setLocalUrl(url);
        setLoading(false);
      } else {
        setError('Arquivo não disponível');
        setLoading(false);
      }
    } else {
      // Clean up object URL when dialog closes
      if (localUrl && localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localUrl);
        setLocalUrl(null);
      }
    }
    
    return () => {
      // Clean up object URL when component unmounts
      if (localUrl && localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [open, binaryData, url, mimeType]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setError('Não foi possível carregar a imagem');
    setLoading(false);
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <VisuallyHidden>
          <DialogTitle>Visualização de Documento</DialogTitle>
        </VisuallyHidden>
        
        <div className="w-full h-full relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          {isImage && localUrl && !error && (
            <img 
              src={localUrl} 
              alt={fileName || "Visualização do documento"} 
              className="w-full h-full object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {isPDF && localUrl && !error && (
            <iframe
              src={localUrl}
              className="w-full h-full"
              frameBorder="0"
              title={fileName || "Visualização do PDF"}
              loading="lazy"
              onLoad={handleIframeLoad}
            />
          )}
          
          {!isImage && !isPDF && !error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Visualização não disponível para este tipo de arquivo ({mimeType}).
                {localUrl && (
                  <>
                    <br />
                    <a 
                      href={localUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                      download={fileName}
                    >
                      Clique aqui para baixar o arquivo.
                    </a>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
