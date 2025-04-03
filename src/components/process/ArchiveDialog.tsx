
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { archiveProcesses } from "@/services/processArchiveService";

interface ArchiveDialogProps {
  processIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ArchiveDialog({ processIds, open, onOpenChange, onSuccess }: ArchiveDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (processIds.length === 0) return;
    
    setIsSubmitting(true);
    const success = await archiveProcesses(processIds, reason);
    setIsSubmitting(false);
    
    if (success) {
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arquivar {processIds.length > 1 ? `${processIds.length} processos` : "processo"}</DialogTitle>
          <DialogDescription>
            Informe o motivo do arquivamento do{processIds.length > 1 ? "s" : ""} processo{processIds.length > 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="reason" className="mb-2 block">Motivo do arquivamento</Label>
          <Textarea 
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Informe o motivo do arquivamento"
            className="min-h-[100px]"
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Arquivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
