
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ProcessNotification } from "@/types/process";
import { supabase } from "@/lib/supabase";
import { BellRing } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

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
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2e3092]">Notificações</h1>
        <p className="text-gray-600">Acompanhe suas notificações</p>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BellRing className="h-4 w-4 text-[#2e3092]" />
                    <h3 className="font-medium">{notification.title}</h3>
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
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>
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
    </MainLayout>
  );
}
