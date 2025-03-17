import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Mail, ExternalLink, Users, FileText, Bell, Database, Shield, Settings } from "lucide-react";

export function DashboardManagerFooter() {
  return (
    <footer className="border-t py-6 md:py-0 bg-white/80 backdrop-blur-sm">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            2025 SIGACE
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 md:justify-end">
          <Link to="/users" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
            <Users className="h-3.5 w-3.5" />
            <span>Usuários</span>
          </Link>
          
          <Link to="/backup" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors">
            <Database className="h-3.5 w-3.5" />
            <span>Backup</span>
          </Link>
          
          <Link to="/notifications" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors">
            <Bell className="h-3.5 w-3.5" />
            <span>Notificações</span>
          </Link>
          
          <Link to="/reports" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors">
            <FileText className="h-3.5 w-3.5" />
            <span>Relatórios</span>
          </Link>
          
          <Link to="/help" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Ajuda</span>
          </Link>
          
          <Link to="/support" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span>Suporte</span>
          </Link>
          
          <Link to="/settings" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações</span>
          </Link>
          
          <Link to="https://www.to.gov.br/sefaz" target="_blank" className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#2e3092] hover:bg-[#2e3092]/10 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>SEFAZ</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
