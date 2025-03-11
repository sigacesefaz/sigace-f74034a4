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
import { GavelIcon, BarChart3Icon, Clock4Icon, ShieldCheckIcon, Users2Icon, ArrowRightIcon, CheckCircle2Icon, FileTextIcon, BuildingIcon, ScaleIcon } from "lucide-react";

// Cores institucionais com tonalidades
const colors = {
  primary: "#2e3092",
  secondary: "#ffd700",
};

function LandingHeader() {
  return <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img src="/images/logo_sefaz_estado.png" alt="Governo do Tocantins" style={{
              filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0))"
            }} className="h-12 object-fill" />
            </Link>
            <div className="flex flex-col">
              <span className="font-bold text-[#2e3092] text-base">SIGACE - Sistema de Gestão de Ações Contra o Estado</span>
              <span className="text-xs text-gray-500 font-bold">Secretaria da Fazenda do Tocantins</span>
            </div>
          </div>
          <LoginDropdown />
        </div>
      </div>
    </header>;
}

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />

      <main className="flex-grow mt-16">
      {/* Hero Section */}
      <section className="relative py-32 bg-cover bg-center" style={{
        backgroundImage: `url('/images/imagem_fundo_1.jpeg'), linear-gradient(135deg, rgba(46,48,146,0.95) 0%, rgba(46,48,146,0.85) 100%)`
      }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5
              }} className="inline-flex items-center px-4 py-2 rounded-full text-secondary-800 text-sm font-medium border border-secondary/30 shadow-sm bg-amber-400">
                <span className="flex h-2 w-2 rounded-full bg-secondary mr-2"></span>
                Um Sistema Oficial da SEFAZ-TO
              </motion.div>
              
              <motion.h1 initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.2
              }} className="text-5xl md:text-6xl font-bold text-white leading-tight">
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
              }} className="text-xl text-white/90">
                Sistema Integrado de Gestão de Ações Contra o Estado
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
                  <Link to="/login">
                    <span className="flex items-center gap-2">
                      Acessar Sistema
                      <ArrowRightIcon className="h-5 w-5" />
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <button>
                    Consulta Pública
                  </button>
                </Button>
              </motion.div>
            </div>
            
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
          </div>
        </div>
      </section>

        {/* Seção de Funcionalidades */}
        <section className="py-20 bg-gradient-to-b from-white to-[#f8f9fa]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Funcionalidades Principais</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
        <section className="py-20 bg-gradient-to-b from-[#f8f9fa] to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Sobre a SEFAZ-TO</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Conheça mais sobre a Secretaria da Fazenda do Tocantins e suas principais atribuições
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
                      Promover a gestão fiscal e financeira do Estado, garantindo a arrecadação e aplicação dos recursos públicos com transparência e eficiência.
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
                      Ser referência nacional em gestão fiscal e financeira, contribuindo para o desenvolvimento sustentável do Tocantins.
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
                      <Badge variant="outline" className="text-primary border-primary">
                        Transparência
                      </Badge>
                      <Badge variant="outline" className="text-primary border-primary">
                        Eficiência
                      </Badge>
                      <Badge variant="outline" className="text-primary border-primary">
                        Integridade
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
    </div>
  );
}
