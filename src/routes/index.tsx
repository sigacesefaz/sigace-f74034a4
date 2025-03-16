
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";

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
import { ProcessReportPage } from "@/pages/processes/ProcessReportPage";
import IntimationList from "@/pages/intimations/IntimationList";
import NewIntimation from "@/pages/intimations/NewIntimation";
import NotificationList from "@/pages/notifications/NotificationList";
import ReportList from "@/pages/reports/ReportList";

// Import public consultation pages
import PublicSearch from "@/pages/public/PublicSearch";
import EmailVerification from "@/pages/public/EmailVerification";
import ProcessView from "@/pages/public/ProcessView";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public consultation routes */}
          <Route path="/public/search" element={<PublicSearch />} />
          <Route path="/public/verify" element={<EmailVerification />} />
          <Route path="/public/process-view" element={<ProcessView />} />
          
          {/* Protected routes with MainLayout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
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
                <MainLayout>
                  <NewIntimation />
                </MainLayout>
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
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
