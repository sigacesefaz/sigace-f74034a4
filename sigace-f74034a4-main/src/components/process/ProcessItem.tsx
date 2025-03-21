
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ProcessItemProps {
  process: any;
  loadProcessDetails: (processId: string | null) => Promise<void>;
  expandedProcess: string | null;
  expandedDetails: any;
  isLoadingDetails: boolean;
}

export function ProcessItem({
  process,
  loadProcessDetails,
  expandedProcess,
  expandedDetails,
  isLoadingDetails
}: ProcessItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const isExpanded = expandedProcess === process.id;
  
  // Helper function to determine badge styling based on status
  const getStatusBadgeProps = (status?: string) => {
    if (!status) return { variant: "secondary" as const };
    
    if (status === "Baixado") {
      return { 
        variant: "destructive" as const,
        className: "bg-red-600 text-white"
      };
    } 
    return { variant: "secondary" as const };
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold">{process.title}</div>
            <div className="text-sm text-gray-500">{process.number}</div>
            <div className="text-sm text-gray-500">
              {process.description}
            </div>
            <Badge
              {...getStatusBadgeProps(process.status)}
              className={cn("mt-2", getStatusBadgeProps(process.status).className)}
            >
              {process.status}
            </Badge>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex space-x-2">
              <Link to={`/processes/${process.id}`}>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadProcessDetails(process.id)}
              className="mt-2"
            >
              <ChevronsUpDown className="h-4 w-4 mr-2" />
              {isExpanded ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4">
            {isLoadingDetails ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : expandedDetails ? (
              <Table>
                <TableCaption>Informações detalhadas do processo.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Campo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Número</TableCell>
                    <TableCell>{process.number}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Classe</TableCell>
                    <TableCell>{process.metadata?.classe?.nome}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data de Ajuizamento</TableCell>
                    <TableCell>{process.metadata?.dataAjuizamento}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sistema</TableCell>
                    <TableCell>{process.metadata?.sistema?.nome}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Órgão Julgador</TableCell>
                    <TableCell>{process.metadata?.orgaoJulgador?.nome}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Grau</TableCell>
                    <TableCell>{process.metadata?.grau}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Nível de Sigilo</TableCell>
                    <TableCell>{process.metadata?.nivelSigilo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Assuntos</TableCell>
                    <TableCell>
                      {process.metadata?.assuntos?.map((assunto: any) => (
                        <div key={assunto.codigo}>
                          {assunto.nome} ({assunto.codigo})
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Movimentos</TableCell>
                    <TableCell>
                      {process.metadata?.movimentos?.map((movimento: any) => (
                        <div key={movimento.codigo}>
                          {movimento.nome} - {movimento.dataHora}
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div>Nenhum detalhe disponível.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
