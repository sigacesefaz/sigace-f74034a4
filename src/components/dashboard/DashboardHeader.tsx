import { Link } from "react-router-dom";
import { NavMenu } from "@/components/navigation/NavMenu";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16 relative">
          <div className="absolute left-0 flex items-center space-x-4">
            <Link to="/dashboard">
              <img 
                src="/images/logo_sefaz.png" 
                alt="Governo do Tocantins" 
                className="h-12 object-contain" 
                style={{
                  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0))"
                }} 
              />
            </Link>
            {!isMobile ? (
              <div className="flex flex-col">
                <span className="font-bold text-[#2e3092] text-base">SIGACE - Sefaz - Tocantins</span>
                <span className="text-gray-500 text-xs font-bold">Superintendência de Assuntos Jurídicos</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="font-bold text-[#2e3092] text-sm">SIGACE</span>
                <span className="text-xs text-gray-500 font-bold">SAJ</span>
              </div>
            )}
          </div>
          <div className="absolute right-0">
            <NavMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
