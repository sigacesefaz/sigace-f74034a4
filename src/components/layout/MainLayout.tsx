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
      <main className="flex-1 pt-16 py-[36px]">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      <DashboardManagerFooter />
    </div>
  );
}