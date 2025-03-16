import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Process } from "@/types/process";
import { Badge } from "@/components/ui/badge";

interface ProcessCardProps {
  process: Process;
  onClick?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void; // Add this line
}

export function ProcessCard({ process, onClick, onDelete, onUpdate }: ProcessCardProps) {
  const statusColor =
    process.status === "active"
      ? "text-green-500"
      : process.status === "pending"
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-semibold line-clamp-1">
            {process.number}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 line-clamp-1">
            {process.title}
          </CardDescription>
        </div>
        <div className="flex space-x-1">
          {onUpdate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate();
              }}
              title="Atualizar Processo"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Excluir Processo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm text-gray-600 line-clamp-2">
        {process.description}
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        <Badge variant="secondary">
          <span className={statusColor}>{process.status}</span>
        </Badge>
        <Button size="sm" onClick={onClick}>
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
