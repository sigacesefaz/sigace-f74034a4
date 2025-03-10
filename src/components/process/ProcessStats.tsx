import { Card } from "@/components/ui/card";

interface ProcessStatsProps {
  totalProcesses: number;
  activeProcesses: number;
  pendingIntimations: number;
  lastUpdate: string;
}

export function ProcessStats({ totalProcesses, activeProcesses, pendingIntimations, lastUpdate }: ProcessStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="text-sm text-gray-600">Total de Processos</div>
        <div className="text-2xl font-bold">{totalProcesses}</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-gray-600">Processos Ativos</div>
        <div className="text-2xl font-bold">{activeProcesses}</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-gray-600">Intimações Pendentes</div>
        <div className="text-2xl font-bold">{pendingIntimations}</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-gray-600">Última Atualização</div>
        <div className="text-sm font-medium">{lastUpdate}</div>
      </Card>
    </div>
  );
}
