
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardManagerFooter } from "@/components/dashboard/DashboardManagerFooter";
import "@/styles/fonts.css";

export function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1">
        <div className="container mx-auto px-3 sm:px-4 py-4 pb-10">
          {children}
        </div>
      </main>
      <DashboardManagerFooter />
    </div>
  );
}
