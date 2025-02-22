
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProcessList } from "@/components/dashboard/ProcessList";

const mockProcesses = [
  {
    id: "1",
    number: "0001/2024",
    title: "Processo de Restituição de ICMS",
    status: "active" as const,
    date: "15 Mar 2024",
  },
  {
    id: "2",
    number: "0002/2024",
    title: "Processo de Anulação de Auto de Infração",
    status: "pending" as const,
    date: "14 Mar 2024",
  },
  {
    id: "3",
    number: "0003/2024",
    title: "Liminar para Suspensão de Cobrança",
    status: "closed" as const,
    date: "13 Mar 2024",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gestão de Processos</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sistema de Gestão de Processos Judiciais - SEFAZ TO
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatsCard
            title="Processos Ativos"
            value="42"
            description="Processos em andamento"
          />
          <StatsCard
            title="Intimações Pendentes"
            value="7"
            description="Aguardando resposta"
          />
          <StatsCard
            title="Prazos Próximos"
            value="3"
            description="Vencem nos próximos 7 dias"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Processos Recentes</h2>
          <ProcessList processes={mockProcesses} />
        </div>
      </div>
    </div>
  );
};

export default Index;
