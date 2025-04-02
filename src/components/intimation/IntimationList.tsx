import { useState } from 'react';
import { Intimation, deleteIntimation } from '@/services/intimations';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  File,
  FileText,
  Trash2,
  User
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { DocumentViewer } from '@/components/ui/document-viewer';

interface IntimationListProps {
  intimations: Intimation[];
  onDelete: (id: string) => void;
}

export function IntimationList({ intimations, onDelete }: IntimationListProps) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [intimationToDelete, setIntimationToDelete] = useState<string | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{
    data?: Uint8Array | null;
    mimeType: string;
    fileName?: string;
  }>({ mimeType: 'application/pdf' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (intimationToDelete) {
      try {
        setIsDeleting(true);
        console.log("[IntimationList.handleDelete] Tentando excluir intimação ID:", intimationToDelete);
        
        const result = await deleteIntimation(intimationToDelete);
        console.log("[IntimationList.handleDelete] Exclusão bem-sucedida:", result);
        
        // Call the onDelete callback to update the UI
        onDelete(intimationToDelete);
        
        toast.success('Intimação excluída com sucesso!');
      } catch (error) {
        console.error('[IntimationList.handleDelete] Erro ao excluir intimação:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao excluir intimação');
      } finally {
        setIsDeleting(false);
        setShowConfirmDialog(false);
        setIntimationToDelete(null);
      }
    }
  };

  const confirmDelete = (id: string) => {
    setIntimationToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleViewReceipt = (intimation: Intimation) => {
    if (intimation.receipt_data) {
      setCurrentDocument({
        data: intimation.receipt_data,
        mimeType: intimation.receipt_mime_type || getMimeType(intimation.receipt_file),
        fileName: intimation.receipt_file
      });
      setShowDocumentViewer(true);
    } else {
      toast.error("Não foi possível encontrar o comprovante de recebimento");
    }
  };

  const getMimeType = (fileName?: string): string => {
    if (!fileName) return 'application/octet-stream';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  };

  const formatType = (type?: string) => {
    switch (type) {
      case 'citation': return 'Citação';
      case 'subpoena': return 'Intimação';
      case 'sentence': return 'Sentença';
      case 'decision': return 'Decisão';
      case 'defense': return 'Defesa';
      case 'other': return 'Outro';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Data não definida';
    
    try {
      return format(new Date(dateString), 'PPP', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getDaysLeft = (deadlineString?: string | null) => {
    if (!deadlineString) return null;
    
    try {
      const deadline = new Date(deadlineString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return <span className="text-red-500">Vencida há {Math.abs(diffDays)} dias</span>;
      } else if (diffDays === 0) {
        return <span className="text-orange-500">Vence hoje</span>;
      } else if (diffDays <= 3) {
        return <span className="text-orange-500">Vence em {diffDays} dias</span>;
      } else {
        return <span className="text-blue-500">{diffDays} dias restantes</span>;
      }
    } catch (error) {
      return 'Prazo inválido';
    }
  };

  if (intimations.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma intimação encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">Comece a adicionar intimações para visualizá-las aqui.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {intimations.map((intimation) => (
          <Card key={intimation.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{intimation.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    {intimation.process_number}
                  </CardDescription>
                </div>
                <Badge 
                  variant="outline"
                  className={`${getStatusColor(intimation.status)} text-white`}
                >
                  {intimation.status === 'pending' ? 'Pendente' : 
                   intimation.status === 'completed' ? 'Concluída' : 'Cancelada'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatType(intimation.type)}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    {intimation.intimated_name || 'Não informado'}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(intimation.intimation_date)}
                  </div>
                  
                  {intimation.deadline && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {getDaysLeft(intimation.deadline)}
                    </div>
                  )}
                </div>
                
                {intimation.content && (
                  <div className="mt-2 text-sm text-gray-700">
                    {intimation.content.length > 100 
                      ? `${intimation.content.substring(0, 100)}...` 
                      : intimation.content
                    }
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 flex justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex items-center">
                  {intimation.court && (
                    <span className="mr-2">{intimation.court}</span>
                  )}
                  {intimation.court_division && (
                    <span>{intimation.court_division}</span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1">
                {(intimation.receipt_data || intimation.receipt_file) && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewReceipt(intimation)}
                    title="Ver comprovante"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Comprovante
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/intimations/${intimation.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/intimations/${intimation.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => confirmDelete(intimation.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir intimação</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Esta intimação será excluída
              permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DocumentViewer
        open={showDocumentViewer}
        onOpenChange={setShowDocumentViewer}
        binaryData={currentDocument.data}
        mimeType={currentDocument.mimeType}
        fileName={currentDocument.fileName}
      />
    </>
  );
}
