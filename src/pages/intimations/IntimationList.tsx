
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ProcessIntimation } from "@/types/process";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";

export default function Intimations() {
  const { data: intimations, isLoading } = useQuery({
    queryKey: ["intimations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intimations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProcessIntimation[];
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Intimações</h1>
        <p className="text-gray-600">Gerencie suas intimações judiciais</p>
      </div>

      {intimations && intimations.length > 0 ? (
        <div className="grid gap-4">
          {intimations.map((intimation) => (
            <Card key={intimation.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{intimation.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{intimation.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Prazo: {new Date(intimation.deadline).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={
                    intimation.status === "pending"
                      ? "bg-yellow-500"
                      : intimation.status === "responded"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                >
                  {intimation.status === "pending"
                    ? "Pendente"
                    : intimation.status === "responded"
                    ? "Respondido"
                    : "Expirado"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma intimação</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não possui intimações pendentes no momento.
          </p>
        </div>
      )}
    </div>
  );
}
