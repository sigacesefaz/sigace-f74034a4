
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-[#2e3092] text-white py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <img 
            src="/images/logo_sefaz_estado.png" 
            alt="Logo SEFAZ Tocantins"
            className={`${isMobile ? 'h-12' : 'h-16'}`}
          />
          {!isMobile && (
            <h1 className="text-2xl font-bold">Secretaria da Fazenda do Estado do Tocantins</h1>
          )}
          {isMobile && (
            <h1 className="text-sm font-bold">SEFAZ-TO</h1>
          )}
        </div>
      </div>
    </header>
  );
}
