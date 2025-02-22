
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card className="p-6 glass-card animate-in">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
