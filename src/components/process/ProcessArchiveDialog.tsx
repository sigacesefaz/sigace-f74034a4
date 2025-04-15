import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Archive, ArchiveRestore } from "lucide-react";

interface ProcessArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string, reason: string) => Promise<void>;
  action: "archive" | "unarchive";
  processNumber: string;
}

export function ProcessArchiveDialog({
  open,
  onOpenChange,
  onConfirm,
  action,
  processNumber
}: ProcessArchiveDialogProps) {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError("A senha é obrigatória");
      return;
    }
    if (!reason.trim()) {
      setError(action === "archive" ? "O motivo do arquivamento é obrigatório" : "O motivo do desarquivamento é obrigatório");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(password, reason);
      setPassword("");
      setReason("");
      setError("");
      onOpenChange(false);
    } catch (err) {
      setError("Erro ao processar operação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === "archive" ? (
              <>
                <Archive className="h-5 w-5" />
                Arquivar Processo
              </>
            ) : (
              <>
                <ArchiveRestore className="h-5 w-5" />
                Desarquivar Processo
              </>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <p>Processo: {processNumber}</p>
              <p className="mt-2">
                Por motivos de segurança, digite sua senha e o motivo {action === "archive" ? "do arquivamento" : "do desarquivamento"}.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className={error && !password ? "border-red-500" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">
              {action === "archive" ? "Motivo do Arquivamento" : "Motivo do Desarquivamento"}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={action === "archive" ? "Digite o motivo do arquivamento" : "Digite o motivo do desarquivamento"}
              className={error && !reason ? "border-red-500" : ""}
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPassword("");
              setReason("");
              setError("");
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            variant={action === "archive" ? "destructive" : "default"}
          >
            {isLoading ? "Processando..." : action === "archive" ? "Arquivar" : "Desarquivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
