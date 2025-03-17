
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";
import { useEffect } from "react";
import { toast } from "./components/ui/use-toast";

const queryClient = new QueryClient();

// Comentando temporariamente a verificação de tabelas que está causando erros
/*
setupRequiredTables()
  .then((success) => {
    if (success) {
      console.log("Configuração das tabelas concluída com sucesso");
    } else {
      console.error("Houve um problema na configuração das tabelas");
      toast({
        title: "Aviso de sistema",
        description: "Algumas funcionalidades podem não estar disponíveis. Por favor, contate o suporte técnico.",
        variant: "destructive"
      });
    }
  })
  .catch((error) => {
    console.error("Erro ao inicializar tabelas:", error);
  });
*/

console.log("Sistema SIGACE iniciando...");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
