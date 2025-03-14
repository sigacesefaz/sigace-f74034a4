
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import IntimationsDashboard from "@/pages/intimations/IntimationsDashboard";
import Login from "@/pages/Login";
import { ProcessList } from "@/pages/processes/ProcessList";
import NewProcess from "@/pages/processes/NewProcess";
import ProcessDetails from "@/pages/processes/ProcessDetails";
import { publicRoutes } from "@/routes/PublicRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  // Public routes for process consultation
  ...publicRoutes,
  {
    path: "/processes",
    element: <Navigate to="/dashboard/processes" replace />
  },
  // Rotas do dashboard
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Navigate to="/dashboard/processes" replace />
      },
      {
        path: "/dashboard/processes",
        element: <ProcessList />
      },
      {
        path: "/dashboard/processes/new",
        element: <NewProcess />
      },
      {
        path: "/dashboard/processes/:id",
        element: <ProcessDetails />
      },
      // Nova rota provisória para Intimações
      {
        path: "/dashboard/intimations",
        element: <IntimationsDashboard />
      }
    ]
  },
  // Rota redirecionando de /intimations para /dashboard/intimations
  {
    path: "/intimations",
    element: <Navigate to="/dashboard/intimations" replace />
  }
]);

export default router;
