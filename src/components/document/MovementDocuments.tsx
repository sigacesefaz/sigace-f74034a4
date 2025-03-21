
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { getProcessDocuments } from "@/services/document";
import { MovementDocumentItem } from "./MovementDocumentItem";
import { MovementDocumentUpload } from "./MovementDocumentUpload";
import { Skeleton } from "@/components/ui/skeleton";

interface MovementDocumentsProps {
  processId: string;
  movementId: string;
}

export function MovementDocuments({ processId, movementId }: MovementDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getProcessDocuments(processId, movementId);
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching movement documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (processId && movementId) {
      fetchDocuments();
    }
  }, [processId, movementId]);

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          Documentos do Evento
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 p-0 px-2 text-xs"
          onClick={() => setUploadDialogOpen(true)}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : documents.length > 0 ? (
        <div className="border rounded-md divide-y">
          {documents.map((doc) => (
            <MovementDocumentItem
              key={doc.id}
              document={doc}
              onDelete={fetchDocuments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-md">
          Nenhum documento para este evento
        </div>
      )}

      <MovementDocumentUpload
        processId={processId}
        movementId={movementId}
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={fetchDocuments}
      />
    </div>
  );
}
