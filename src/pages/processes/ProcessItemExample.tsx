import { ProcessItem } from "@/components/dashboard/ProcessItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProcessItemExample() {
  // Dados de processo de exemplo
  const mockProcess = {
    id: "123",
    number: "0123456-78.2023.8.19.0001",
    title: "Recurso Especial",
    updated_at: new Date().toISOString(),
    metadata: {
      dataAjuizamento: new Date("2023-05-14T14:30:00").toISOString(),
      sistema: { nome: "PJe" },
      grau: "2º Grau",
      orgaoJulgador: { nome: "6ª CÂMARA CÍVEL" },
      nivelSigilo: "Público",
      assuntos: [
        { nome: "Direito Civil" }
      ],
      movimentos: [
        {
          codigo: "11022",
          nome: "Sessão de Julgamento - Julgado",
          dataHora: new Date("2023-12-10T10:00:00").toISOString(),
          complementosTabelados: [
            "Aguardando lavratura de acórdão",
            "Votação unânime"
          ]
        },
        {
          codigo: "11015",
          nome: "Disponibilização no Diário da Justiça Eletrônico",
          dataHora: new Date("2023-12-01T11:30:00").toISOString()
        },
        {
          codigo: "11009",
          nome: "Conclusos para julgamento",
          dataHora: new Date("2023-11-15T09:45:00").toISOString()
        },
        {
          codigo: "11008",
          nome: "Processo incluído em pauta",
          dataHora: new Date("2023-11-10T14:20:00").toISOString()
        },
        {
          codigo: "11007",
          nome: "Recebidos os autos",
          dataHora: new Date("2023-10-25T16:40:00").toISOString()
        }
      ]
    }
  };

  // Handlers de exemplo
  const handleView = (id: string) => {
    console.log("Visualizando processo:", id);
    alert("Visualizando processo: " + id);
  };

  const handleEdit = (id: string) => {
    console.log("Editando processo:", id);
    alert("Editando processo: " + id);
  };

  const handlePrint = (id: string) => {
    console.log("Imprimindo processo:", id);
    alert("Imprimindo processo: " + id);
  };

  const handleShare = (id: string) => {
    console.log("Compartilhando processo:", id);
    alert("Compartilhando processo: " + id);
  };

  const handleDelete = (id: string) => {
    console.log("Excluindo processo:", id);
    alert("Processo excluído: " + id);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" className="p-0 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Exemplo de Card de Processo</h1>
      </div>

      <div className="mb-6">
        <div className="flex w-full max-w-lg items-center space-x-2 mb-4">
          <Input placeholder="Pesquisar processo" />
          <Button>Pesquisar</Button>
        </div>
        <p className="text-gray-500">Clique em "Ver mais" para expandir o card e visualizar todos os detalhes.</p>
      </div>

      {/* ProcessItem criado */}
      <ProcessItem
        process={mockProcess}
        onView={handleView}
        onEdit={handleEdit}
        onPrint={handlePrint}
        onShare={handleShare}
        onDelete={handleDelete}
      />
    </div>
  );
}
