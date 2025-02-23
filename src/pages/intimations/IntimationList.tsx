
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProcessIntimation } from "@/types/process";
import { supabase } from "@/lib/supabase";
import { Bell, Calendar, FileText, User, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-500";
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Intimações</h1>
          <p className="text-gray-600">Gerencie suas intimações judiciais</p>
        </div>
        <Button asChild>
          <Link to="/intimations/new">Nova Intimação</Link>
        </Button>
      </div>

      {intimations && intimations.length > 0 ? (
        <div className="grid gap-4">
          {intimations.map((intimation) => (
            <Card key={intimation.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{intimation.title}</h3>
                      <Badge className={getStatusColor(intimation.status)}>
                        {intimation.status === "pending"
                          ? "Pendente"
                          : intimation.status === "completed"
                          ? "Cumprida"
                          : "Expirada"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{intimation.content}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Processo: {intimation.process_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Prazo: {new Date(intimation.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {intimation.court} - {intimation.court_division}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {intimation.parties.map(p => p.name).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
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
