
import React from "react";

export function DashboardFooter() {
  return <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SIGACE - Secretaria da Fazenda do Tocantins
          </p>
        </div>
      </div>
    </footer>;
}
