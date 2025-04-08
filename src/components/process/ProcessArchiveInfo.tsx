
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessArchiveInfoProps {
  archiveInfo: {
    action: 'archive' | 'unarchive';
    reason: string;
    date: string;
  }[];
}

export function ProcessArchiveInfo({ archiveInfo }: ProcessArchiveInfoProps) {
  if (!archiveInfo || archiveInfo.length === 0) return null;

  const latestInfo = archiveInfo[archiveInfo.length - 1];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoCircledIcon className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700" />
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <div className="text-sm">
          <p className="font-medium">{latestInfo.action === 'archive' ? 'Motivo do arquivamento:' : 'Motivo do desarquivamento:'}</p>
          <p className="mt-1">{latestInfo.reason}</p>
          <p className="mt-2 text-xs text-gray-500">
            {format(new Date(latestInfo.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
