import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { Process } from "@/types/process";
import { ProcessReport } from "./ProcessReport";

interface ProcessReportDialogProps {
  process: Process;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcessReportDialog({
  process,
  open,
  onOpenChange,
}: ProcessReportDialogProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('process-report');
    if (printContent) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'visible';
      window.print();
      document.body.style.overflow = originalOverflow;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b print:hidden flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">Relatório do Processo</DialogTitle>
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              size="sm"
              className="text-gray-700 hover:text-gray-900"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>
        <div id="process-report" className="flex-1 overflow-y-auto px-6 py-4">
          <ProcessReport process={process} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
