
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Process {
  id: string;
  number: string;
  title: string;
  status: "active" | "pending" | "closed";
  date: string;
}

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const getStatusColor = (status: Process["status"]) => {
    switch (status) {
      case "active":
        return "bg-sage-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "closed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {processes.map((process) => (
        <Card key={process.id} className="p-4 glass-card hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{process.number}</p>
              <h3 className="font-medium mt-1">{process.title}</h3>
            </div>
            <Badge className={getStatusColor(process.status)}>
              {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{process.date}</p>
        </Card>
      ))}
    </div>
  );
}
