import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Subject {
  codigo: number;
  nome: string;
  principal: boolean;
}

interface ProcessSubjectsProps {
  subjects: Subject[];
}

export function ProcessSubjects({ subjects }: ProcessSubjectsProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhum assunto cadastrado
      </div>
    );
  }

  const mainSubject = subjects.find(subject => subject.principal);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          Total de assuntos: {subjects.length}
        </span>
        {mainSubject && (
          <Badge variant="outline" className="bg-primary/10">
            Principal: {mainSubject.nome}
          </Badge>
        )}
      </div>
      
      <ScrollArea className="h-[100px] w-full rounded-md border p-2">
        <div className="space-y-1">
          {subjects.map((subject, index) => (
            <div
              key={`${subject.codigo}-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <span className="font-medium">•</span>
              <span>{subject.nome}</span>
              {subject.principal && (
                <Badge variant="secondary" className="ml-auto">
                  Principal
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 