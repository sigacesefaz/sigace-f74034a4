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
    <footer className="bg-primary text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sobre */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold mb-4">Sobre o SIGPRO</h3>
            <p className="text-sm text-gray-300">
              Sistema de Gestão de Processos - Uma solução completa para gestão processual
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
                <Link to="/" className="text-sm text-gray-300 hover:text-secondary-light transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    window.scrollTo(0, 0);
                    const consultaButton = document.querySelector('button.bg-white\\/10.text-white') as HTMLButtonElement;
                    if (consultaButton) {
                      consultaButton.click();
                    }
                  }} 
                  className="text-sm text-gray-300 hover:text-secondary-light transition-colors"
                >
                  Consultas Públicas
                </button>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-gray-300 hover:text-secondary-light transition-colors">
                      Sobre o Sistema
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <div className="flex justify-center mb-4">
                        <img
                          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=100&fit=crop&auto=format"
                          alt="SIGPRO Logo"
                          className="h-24 rounded"
                        />
                      </div>
                    </DialogHeader>
                    <div className="space-y-6">
                      <DialogDescription className="text-base leading-relaxed space-y-4">
                        <p className="text-justify">
                          O SIGPRO - Sistema de Gestão de Processos foi desenvolvido para otimizar a gestão de processos jurídicos e administrativos em organizações públicas e privadas.
                        </p>
                        <p className="text-justify">
                          A ferramenta permite o acompanhamento completo de cada etapa dos processos, desde a sua abertura até a conclusão, proporcionando maior eficiência e transparência na tramitação.
                        </p>
                        <p className="text-justify">
                          Com este sistema, buscamos modernizar a gestão processual e oferecer um serviço cada vez mais ágil e eficaz.
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
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-secondary-light transition-colors">
                <MapPinIcon className="h-4 w-4" />
                Cidade - UF, Brasil
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-secondary-light transition-colors">
                <PhoneIcon className="h-4 w-4" />
                (00) 0000-0000
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-secondary-light transition-colors">
                <PhoneIcon className="h-4 w-4" />
                Ouvidoria: 0800 000 0000
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300 hover:text-secondary-light transition-colors">
                <MailIcon className="h-4 w-4" />
                contato@sigpro.org
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
              <a href="#" className="text-gray-300 hover:text-secondary-light transition-colors">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary-light transition-colors">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary-light transition-colors">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary-light transition-colors">
                <LinkedinIcon className="h-6 w-6" />
              </a>
            </div>
          </motion.div>

        </div>

        {/* Rodapé */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300 mb-2">
            {new Date().getFullYear()} SIGPRO - Sistema de Gestão de Processos. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-400">
            Acessibilidade: Conforme Lei nº 13.146/2015
          </p>
        </div>
      </div>
    </footer>
  );
}
