
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { PublicConsultationWizard } from "@/components/public/PublicConsultationWizard";
import PublicSearch from "@/pages/public/PublicSearch";
import EmailVerification from "@/pages/public/EmailVerification";
import ProcessView from "@/pages/public/ProcessView";

export const publicRoutes = [
  {
    path: "/public",
    element: <Navigate to="/public/search" replace />,
  },
  {
    path: "/public/search",
    element: (
      <PublicConsultationWizard>
        <PublicSearch />
      </PublicConsultationWizard>
    ),
  },
  {
    path: "/public/verify",
    element: (
      <PublicConsultationWizard>
        <EmailVerification />
      </PublicConsultationWizard>
    ),
  },
  {
    path: "/public/process-view",
    element: (
      <PublicConsultationWizard>
        <ProcessView />
      </PublicConsultationWizard>
    ),
  },
];
