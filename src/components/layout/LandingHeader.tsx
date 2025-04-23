
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginDropdown } from "@/components/LoginDropdown";

export function LandingHeader() {
  const isMobile = useIsMobile();
  
  return (
    <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=64&h=64&fit=crop&auto=format"
                alt="SIGPRO Logo" 
                className="h-10 md:h-12 object-contain rounded" 
              />
            </Link>
            {!isMobile ? (
              <div className="flex flex-col">
                <span className="font-bold text-primary text-base">SIGPRO - Sistema de Gestão de Processos</span>
                <span className="text-gray-500 text-xs font-bold">Gestão Processual Inteligente</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="font-bold text-primary text-sm">SIGPRO</span>
                <span className="text-xs text-gray-500 font-bold">Gestão</span>
              </div>
            )}
          </div>
          <LoginDropdown />
        </div>
      </div>
    </header>
  );
}
