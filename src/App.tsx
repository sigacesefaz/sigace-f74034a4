import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProcessListPage from "./pages/processes/ProcessListPage";
import NewProcess from "./pages/processes/NewProcess";
import ProcessDetails from "./pages/processes/ProcessDetails";
import ProcessCardExample from "./pages/processes/ProcessCardExample";
import { ProcessReportPage } from "./pages/processes/ProcessReportPage";
import IntimationList from "./pages/intimations/IntimationList";
import NewIntimation from "./pages/intimations/NewIntimation";
import NotificationList from "./pages/notifications/NotificationList";
import ReportList from "./pages/reports/ReportList";
import Dashboard from "./pages/dashboard/index";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./lib/supabase";
import { setupRequiredTables } from "./lib/setupTables";
import { toast } from "./components/ui/use-toast";
import { MainLayout } from "./components/layout/MainLayout";

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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/processes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProcessListPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/processes/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NewProcess />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/processes/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProcessDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/processes/:id/report"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProcessReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/processes/card-example"
            element={<ProcessCardExample />}
          />
          <Route
            path="/intimations"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <IntimationList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/intimations/new"
            element={
              <ProtectedRoute>
                <NewIntimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReportList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
