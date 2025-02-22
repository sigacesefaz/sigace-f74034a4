
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartBar, Download, FileText, Printer } from "lucide-react";

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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-gray-600">Gere e visualize relatórios</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <report.icon className="h-8 w-8 text-gray-600" />
                <div>
                  <h3 className="font-medium">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
