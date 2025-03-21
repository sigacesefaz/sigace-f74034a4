import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-[#2e3092] text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sobre */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold mb-4">Sobre o SIGACE</h3>
            <p className="text-sm text-gray-300">
              Sistema de Gestão de Ações Contra o Estado da Secretaria da Fazenda do Tocantins
            </p>
          </motion.div>

          {/* Links Rápidos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-[#fec30b] transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    // Scroll to top first
                    window.scrollTo(0, 0);
                    // Find the Consulta Pública button in the hero section and click it
                    const consultaButton = document.querySelector('button.bg-white\\/10.text-white') as HTMLButtonElement;
                    if (consultaButton) {
                      consultaButton.click();
                    }
                  }} 
                  className="text-sm text-gray-300 hover:text-[#fec30b] transition-colors"
                >
                  Consultas Públicas
                </button>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-gray-300 hover:text-[#fec30b] transition-colors">
                      Sobre o Sistema
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <div className="flex justify-center mb-4">
                        <img
                          src="/images/logo_to_sefaz.png"
                          alt="SEFAZ TI Logo"
                          className="h-24"
                        />
                      </div>
                    </DialogHeader>
                    <div className="space-y-6">
                      <DialogDescription className="text-base leading-relaxed space-y-4">
                        <p className="text-justify">
                          O SIGACE - Sistema de Gestão de Ações Contra o Estado - Tocantins foi desenvolvido pela Superintendência de Tecnologia e Inovação Fazendária (STIF), através da Diretoria de Inovação, com o objetivo de otimizar a gestão de processos impetrados contra a Secretaria da Fazenda do Estado do Tocantins.
                        </p>
                        <p className="text-justify">
                          A ferramenta permite o acompanhamento completo de cada etapa dos processos, desde a sua abertura até a conclusão, proporcionando maior eficiência e transparência na tramitação. Além disso, o sistema utiliza a API Pública do DataJud (<a href="https://www.cnj.jus.br/sistemas/datajud/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.cnj.jus.br/sistemas/datajud/</a>), órgão ligado ao Conselho Nacional de Justiça (CNJ), para acesso a informações processuais relevantes.
                        </p>
                        <p className="text-justify">
                          Com este sistema, buscamos modernizar a gestão pública e oferecer um serviço cada vez mais ágil e eficaz para os cidadãos e servidores.
                        </p>
                      </DialogDescription>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-gray-300 hover:text-[#fec30b] transition-colors">
                      Sobre o DATAJUD
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <div className="flex justify-center mb-2">
                        <img
                          src="/images/datajud-e-mail-mkt-cabecalho.jpg"
                          alt="DataJud Logo"
                          className="h-16"
                        />
                      </div>
                    </DialogHeader>
                    <div className="space-y-3">
                      <DialogDescription className="text-base leading-relaxed space-y-2">
                        <p className="text-justify text-sm">
                          O DataJud é uma base de dados nacional do Poder Judiciário que
                          concentra informações processuais dos diversos segmentos da Justiça.
                          O sistema foi desenvolvido pelo Conselho Nacional de Justiça (CNJ)
                          para atender à Resolução CNJ nº 331/2020.
                        </p>
                        <p className="text-justify text-sm">
                            Dentre as inovações trazidas pela Resolução, cabe destacar a possibilidade 
                            das informações do DataJud serem disponibilizadas por meio de API pública, 
                            resguardados o sigilo e a confidencialidade das informações, nos termos da 
                            legislação processual e da Lei Geral de Proteção de Dados.
                        </p>
                        <div className="bg-blue-100 p-2 rounded-lg border border-blue-200 my-2">
                          <p className="text-blue-900 font-semibold text-center text-sm">
                            Este sistema usa a API Pública do DATAJUD
                          </p>
                        </div>
                        <p className="text-justify text-sm">
                          O objetivo do DataJud é proporcionar uma visão abrangente e
                          detalhada do funcionamento do Judiciário brasileiro, permitindo:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Gestão eficiente dos processos judiciais</li>
                          <li>Análise estatística do desempenho dos tribunais</li>
                          <li>Transparência das informações processuais</li>
                          <li>Aprimoramento das políticas judiciárias</li>
                        </ul>
                        <p className="text-sm">
                          Para mais informações e acesso ao sistema DataJud, visite o portal
                          oficial do CNJ - DataJud: <a href="https://www.cnj.jus.br/sistemas/datajud/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.cnj.jus.br/sistemas/datajud/</a>
                        </p>
                      </DialogDescription>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </motion.div>

          {/* Contato */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#fec30b] transition-colors">
                <MapPinIcon className="h-4 w-4" />
                Palmas - TO, Brasil
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#fec30b] transition-colors">
                <PhoneIcon className="h-4 w-4" />
                (63) 3218-6000
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#fec30b] transition-colors">
                <PhoneIcon className="h-4 w-4" />
                Ouvidoria: 0800 646 1515
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#fec30b] transition-colors">
                <MailIcon className="h-4 w-4" />
                sigace@sefaz.to.gov.br
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#fec30b] transition-colors">
                <MailIcon className="h-4 w-4" />
                ouvidoria@sefaz.to.gov.br
              </li>
            </ul>
          </motion.div>

          {/* Redes Sociais */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-[#fec30b] transition-colors">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#fec30b] transition-colors">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#fec30b] transition-colors">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#fec30b] transition-colors">
                <LinkedinIcon className="h-6 w-6" />
              </a>
            </div>
          </motion.div>

        </div>

        {/* Rodapé */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300 mb-2">
            {new Date().getFullYear()} Secretaria da Fazenda do Tocantins. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-400">
            Acessibilidade: Conforme Lei nº 13.146/2015
          </p>
        </div>
      </div>
    </footer>
  );
}
