
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "./ProtectedRoute";

// Import pages directly to avoid errors
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Index from "@/pages/Index";
import Dashboard from "@/pages/dashboard/index";
import NotFound from "@/pages/NotFound";
import ProcessListPage from "@/pages/processes/ProcessListPage";
import NewProcess from "@/pages/processes/NewProcess";
import ProcessDetails from "@/pages/processes/ProcessDetails";
import ProcessCardExample from "@/pages/processes/ProcessCardExample";
import IntimationList from "@/pages/intimations/IntimationList";
import NewIntimation from "@/pages/intimations/NewIntimation";
import NotificationList from "@/pages/notifications/NotificationList";
import ReportList from "@/pages/reports/ReportList";

// Import public consultation pages
import PublicSearch from "@/pages/public/PublicSearch";
import EmailVerification from "@/pages/public/EmailVerification";
import ProcessView from "@/pages/public/ProcessView";
import { MainLayout } from "@/components/layout/MainLayout";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/processes" element={<ProtectedRoute><ProcessListPage /></ProtectedRoute>} />
          <Route path="/processes/new" element={<ProtectedRoute><NewProcess /></ProtectedRoute>} />
          <Route path="/processes/:id" element={<ProtectedRoute><ProcessDetails /></ProtectedRoute>} />
          <Route path="/processes/card-example" element={<ProcessCardExample />} />
          <Route path="/intimations" element={<ProtectedRoute><IntimationList /></ProtectedRoute>} />
          <Route path="/intimations/new" element={<ProtectedRoute><NewIntimation /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportList /></ProtectedRoute>} />
          
          {/* Public consultation routes */}
          <Route path="public/search" element={<PublicSearch />} />
          <Route path="public/verify" element={<EmailVerification />} />
          <Route path="public/process-view" element={<ProcessView />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
