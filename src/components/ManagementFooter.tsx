import React from 'react';

export function ManagementFooter() {
  return (
    <footer className="bg-[#2e3092] text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Links Úteis */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fec30b]">Links Úteis</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">Suporte</a></li>
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">Políticas</a></li>
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fec30b]">Contato</h3>
            <ul className="space-y-2">
              <li>Email: suporte@sefaz.to.gov.br</li>
              <li>Telefone: (63) 3218-4000</li>
              <li>Horário: 08h às 18h</li>
            </ul>
          </div>

          {/* Acesso Rápido */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fec30b]">Acesso Rápido</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">Processos</a></li>
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">Relatórios</a></li>
              <li><a href="#" className="hover:text-[#fec30b] transition-colors">Configurações</a></li>
            </ul>
          </div>

          {/* Sobre */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fec30b]">Sobre</h3>
            <p className="text-sm">
              Sistema de Gestão Institucional da Secretaria da Fazenda do Estado do Tocantins.
              Versão 1.0.0
            </p>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="border-t border-[#fec30b]/20 mt-8 pt-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} SEFAZ-TO. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
