
import { Court } from "@/types/datajud";
import { courts } from "@/services/courts";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ProcessCourtSelectorProps {
  value: Court | null;
  onChange: (court: Court | null) => void;
  disabled?: boolean;
}

export function ProcessCourtSelector({ value, onChange, disabled = false }: ProcessCourtSelectorProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="court">Tribunal</Label>
      <Select 
        value={value?.id || ""} 
        onValueChange={(value) => {
          const selectedCourt = Object.values(courts)
            .flat()
            .find(c => c.id === value);
          onChange(selectedCourt || null);
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um tribunal" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(courts)
            .filter(([key]) => 
              // Filtrar apenas os tribunais ESTADUAL e FEDERAL
              key === "ESTADUAL" || key === "FEDERAL" || key === "SUPERIOR"
            )
            .map(([courtType, courtsList]) => (
              <div key={courtType}>
                <div className="px-2 py-1.5 text-sm font-semibold">
                  {courtType === "ESTADUAL" ? "Justiça Estadual" : 
                   courtType === "FEDERAL" ? "Justiça Federal" : 
                   "Tribunais Superiores"}
                </div>
                {courtsList.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
                <Separator className="my-1" />
              </div>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
