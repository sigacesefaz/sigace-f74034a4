import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footer } from "../components/Footer";
import { LoginDropdown } from "@/components/LoginDropdown";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GavelIcon, BarChart3Icon, Clock4Icon, ShieldCheckIcon, Users2Icon, ArrowRightIcon, CheckCircle2Icon, FileTextIcon, BuildingIcon, ScaleIcon, Menu } from "lucide-react";
import { PublicConsultationTerms } from "@/components/process/PublicConsultationTerms";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

// Cores institucionais com tonalidades
const colors = {
  primary: "#6B46C1",
  secondary: "#ffd700",
};

function LandingHeader() {
  const isMobile = useIsMobile();
  
  return (
    <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=64&h=64&fit=crop&auto=format" 
                alt="Logo" 
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

export default function Index() {
  const [showTerms, setShowTerms] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />

      <main className="flex-grow mt-16">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-cover bg-center" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop'), linear-gradient(135deg, rgba(107,70,193,0.95) 0%, rgba(107,70,193,0.85) 100%)`
      }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              
              <motion.h1 initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.2
              }} className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Modernização da <span className="text-secondary">Gestão Processual</span>
              </motion.h1>
              
              <motion.p initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.4
              }} className="text-lg md:text-xl text-white/90">
                Sistema de Gestão de Processos
              </motion.p>
              
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.6
              }} className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-secondary text-gray-900 hover:bg-secondary/90 shadow-lg">
                  <Link to="/register">
                    <span className="flex items-center gap-2">
                      Acessar Sistema
                      <ArrowRightIcon className="h-5 w-5" />
                    </span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => setShowTerms(true)}
                >
                  Consulta Pública
                </Button>
              </motion.div>
            </div>
            
            {!isMobile && (
              <motion.div initial={{
                opacity: 0,
                x: 50
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.8
              }} className="relative">
                <div className="absolute -inset-4 bg-white/10 backdrop-blur-sm rounded-3xl"></div>
                <Card className="p-8 relative bg-white/90 backdrop-blur-sm border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    {[{
                      icon: <BarChart3Icon className="h-8 w-8 text-primary" />,
                      title: "Gestão Eficiente",
                      description: "Acompanhamento em tempo real dos processos"
                    }, {
                      icon: <Clock4Icon className="h-8 w-8 text-primary" />,
                      title: "Controle de Prazos",
                      description: "Gestão automatizada de deadlines"
                    }, {
                      icon: <ShieldCheckIcon className="h-8 w-8 text-primary" />,
                      title: "Segurança",
                      description: "Conformidade com LGPD"
                    }, {
                      icon: <Users2Icon className="h-8 w-8 text-primary" />,
                      title: "Integração",
                      description: "Comunicação entre setores"
                    }].map((item, index) => <motion.div key={index} className="p-6 rounded-xl hover:bg-white transition-colors" whileHover={{
                      y: -5,
                      scale: 1.02
                    }} transition={{
                      type: "spring",
                      stiffness: 300
                    }}>
                        <div className="p-3 bg-primary/10 rounded-lg inline-block shadow-sm">
                          {item.icon}
                        </div>
                        <h3 className="font-semibold text-lg mt-4">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                      </motion.div>)}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

        {/* Seção de Funcionalidades */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#f8f9fa]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Funcionalidades Principais</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Conheça as principais funcionalidades do sistema de gestão de processos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.1
            }} whileHover={{
              y: -10
            }}>
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md">
                        <GavelIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Gestão Processual</h3>
                    </div>
                    <p className="text-gray-600">
                      Controle completo de prazos, recursos e tramitações dos processos
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} whileHover={{
              y: -10
            }}>
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md">
                        <FileTextIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Documentação</h3>
                    </div>
                    <p className="text-gray-600">
                      Armazenamento e organização de documentos relacionados aos processos
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.3
            }} whileHover={{
              y: -10
            }}>
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md">
                        <ScaleIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Transparência</h3>
                    </div>
                    <p className="text-gray-600">
                      Acompanhamento público e relatórios detalhados
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seção Institucional */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-[#f8f9fa] to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Sobre Nossa Organização</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Conheça mais sobre nossa organização e suas principais atribuições
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.1
            }} whileHover={{
              y: -10
            }}>
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md">
                        <BuildingIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Missão</h3>
                    </div>
                    <p className="text-gray-600">
                      Promover a gestão processual, garantindo a tramitação e aplicação dos recursos com transparência e eficiência.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} whileHover={{
              y: -10
            }}>
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md">
                        <BarChart3Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Visão</h3>
                    </div>
                    <p className="text-gray-600">
                      Ser referência em gestão processual, contribuindo para o desenvolvimento sustentável do sistema judiciário.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.3
            }} whileHover={{
              y: -10
            }}>
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md">
                        <ScaleIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Valores</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
    Transparência
</Badge>
<Badge variant="outline" className="text-green-600 border-green-600">
    Eficiência
</Badge>
<Badge variant="outline" className="text-red-600 border-red-600">
    Integridade
</Badge>
<Badge variant="outline" className="text-yellow-600 border-yellow-600">
    Justiça Fiscal
</Badge>
<Badge variant="outline" className="text-purple-600 border-purple-600">
    Inovação
</Badge>
<Badge variant="outline" className="text-pink-600 border-pink-600">
    Respeito ao Contribuinte
</Badge>
<Badge variant="outline" className="text-indigo-600 border-indigo-600">
    Colaboração
</Badge>
<Badge variant="outline" className="text-teal-600 border-teal-600">
    Sustentabilidade
</Badge>
<Badge variant="outline" className="text-orange-600 border-orange-600">
    Ética
</Badge>
<Badge variant="outline" className="text-lime-600 border-lime-600">
    Profissionalismo
</Badge>
<Badge variant="outline" className="text-cyan-600 border-cyan-600">
    Acessibilidade
</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      
      {/* Public consultation terms dialog */}
      <PublicConsultationTerms 
        open={showTerms} 
        onOpenChange={setShowTerms} 
      />
    </div>
  );
}
