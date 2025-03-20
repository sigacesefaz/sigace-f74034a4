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
                src="/images/logo_sefaz.png" 
                alt="Governo do Tocantins" 
                style={{filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0))"}} 
                className="h-10 md:h-12 object-fill" 
              />
            </Link>
            {!isMobile ? (
              <div className="flex flex-col">
                <span className="font-bold text-[#2e3092] text-base">SIGACE - Sistema de Gestão de Ações Contra o Estado</span>
                <span className="text-gray-500 text-xs font-bold">Superintendência de Assuntos Jurídicos</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="font-bold text-[#2e3092] text-sm">SIGACE</span>
                <span className="text-xs text-gray-500 font-bold">SEFAZ-TO</span>
              </div>
            )}
          </div>
          <LoginDropdown />
        </div>
      </div>
    </header>
  );
} 