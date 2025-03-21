
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File, FileText, Download, X } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  mimeType: string;
  fileName?: string;
}

export function DocumentViewer({ open, onOpenChange, url, mimeType, fileName }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const isImage = mimeType.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';
  const displayName = fileName || 'Document';

  useEffect(() => {
    async function getSignedUrl() {
      if (!open || !url) return;
      
      setLoading(true);
      try {
        // Extract file path from URL if it's a Supabase storage URL
        let filePath = url;
        const storageUrl = supabase.storage.from('').getPublicUrl('').data.publicUrl.split('/public/')[0];
        if (url.includes(storageUrl)) {
          filePath = url.split('/public/')[1] || url;
        }
        
        // If URL is already a signed URL or external URL, use it directly
        if (url.includes('?token=') || !url.includes(storageUrl)) {
          setSignedUrl(url);
          setLoading(false);
          return;
        }

        // Determine which bucket the file is in based on the URL
        let bucket = 'process-documents';
        if (url.includes('documents/')) {
          bucket = 'documents';
        }

        // For storage URLs, create a signed URL
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600, {
            download: false,
            transform: {
              quality: 100
            }
          });

        if (error) {
          console.error("Error creating signed URL:", error);
          toast.error("Erro ao carregar o documento");
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (error) {
        console.error("Error in getSignedUrl:", error);
        toast.error("Erro ao processar o documento");
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    }

    getSignedUrl();
  }, [open, url]);

  const handleDownload = async () => {
    if (!signedUrl) return;
    
    try {
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Erro ao baixar o documento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{displayName}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" /> Baixar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-full h-full border rounded-md overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {!loading && signedUrl && isImage && (
            <img 
              src={signedUrl} 
              alt="Document preview" 
              className="w-full h-full object-contain"
            />
          )}
          
          {!loading && signedUrl && isPDF && (
            <iframe
              src={signedUrl}
              className="w-full h-full"
              frameBorder="0"
              title="PDF preview"
            />
          )}
          
          {!loading && !signedUrl && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <FileText className="w-16 h-16 text-gray-400" />
              <p className="text-gray-500">
                Não foi possível carregar o documento.
              </p>
            </div>
          )}
          
          {!loading && signedUrl && !isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <File className="w-16 h-16 text-gray-400" />
              <p className="text-gray-500">
                Visualização não disponível para este tipo de arquivo.
                <br />
                Por favor, faça o download para visualizar.
              </p>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" /> Baixar arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
