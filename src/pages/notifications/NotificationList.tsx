
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ProcessNotification } from "@/types/process";
import { supabase } from "@/lib/supabase";
import { BellRing } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProcessNotification[];
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="text-gray-600">Acompanhe suas notificações</p>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={notification.type === "deadline" ? "destructive" : "default"}
                >
                  {notification.type === "deadline"
                    ? "Prazo"
                    : notification.type === "update"
                    ? "Atualização"
                    : notification.type === "document"
                    ? "Documento"
                    : "Audiência"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellRing className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma notificação</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não possui notificações no momento.
          </p>
        </div>
      )}
    </div>
  );
}
