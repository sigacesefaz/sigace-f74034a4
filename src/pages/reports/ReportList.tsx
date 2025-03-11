import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartBar, Download, FileText, Printer } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

export default function Reports() {
  const reports = [
    {
      id: 1,
      title: "Processos por Status",
      description: "Relatório com quantidade de processos por status",
      icon: ChartBar,
    },
    {
      id: 2,
      title: "Intimações Pendentes",
      description: "Lista de intimações pendentes e prazos",
      icon: FileText,
    },
    {
      id: 3,
      title: "Estatísticas Mensais",
      description: "Dados estatísticos do último mês",
      icon: ChartBar,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2e3092]">Relatórios</h1>
            <p className="text-gray-600">Gere e visualize relatórios do sistema</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[#2e3092]/10 rounded-lg">
                    <report.icon className="h-6 w-6 text-[#2e3092]" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <div className="mt-4 space-x-2">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
