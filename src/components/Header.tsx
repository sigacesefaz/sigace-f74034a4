import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-[#2e3092] text-white py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <img 
            src="/images/logo_sefaz_estado.png" 
            alt="Logo SEFAZ Tocantins"
            className="h-16"
          />
          <h1 className="text-2xl font-bold">Secretaria da Fazenda do Estado do Tocantins</h1>
        </div>
      </div>
    </header>
  );
}
