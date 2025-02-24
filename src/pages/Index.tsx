
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  GavelIcon, 
  BarChart3Icon, 
  Clock4Icon, 
  DollarSignIcon, 
  ShieldCheckIcon,
  Users2Icon
} from "lucide-react";

// Dados simulados para os KPIs
const kpiData = {
  processosTotais: 15482,
  valorRecuperado: "R$ 42,5M",
  tempoMedioResposta: "48h",
  taxaSucesso: "94%"
};

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/41d8761a-90fe-4080-9302-a5040d446fb1.png" 
                alt="SEFAZ Tecnologia" 
                className="h-8"
              />
              <span className="text-xl font-semibold text-primary">SIGACE</span>
            </div>
            <Button asChild variant="ghost">
              <Link to="/login" className="text-primary hover:text-primary-dark">
                Acessar Sistema
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow mt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Sistema de Gestão de Ações Contra o Estado
                </h1>
                <p className="text-xl text-gray-600">
                  Portal oficial da Secretaria da Fazenda do Estado do Tocantins para 
                  gestão e acompanhamento de processos judiciais.
                </p>
                <div className="flex gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary-dark">
                    <Link to="/login">Área Restrita</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-primary border-primary hover:bg-primary/10">
                    Consulta Pública
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl" />
                <Card className="relative glass-card p-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <BarChart3Icon className="h-8 w-8 text-primary" />
                      <h3 className="font-semibold">Gestão Eficiente</h3>
                      <p className="text-sm text-gray-600">
                        Acompanhamento em tempo real dos processos
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Clock4Icon className="h-8 w-8 text-primary" />
                      <h3 className="font-semibold">Controle de Prazos</h3>
                      <p className="text-sm text-gray-600">
                        Gestão automatizada de deadlines
                      </p>
                    </div>
                    <div className="space-y-2">
                      <ShieldCheckIcon className="h-8 w-8 text-primary" />
                      <h3 className="font-semibold">Segurança</h3>
                      <p className="text-sm text-gray-600">
                        Conformidade com LGPD
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Users2Icon className="h-8 w-8 text-primary" />
                      <h3 className="font-semibold">Integração</h3>
                      <p className="text-sm text-gray-600">
                        Comunicação entre setores
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs Section */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Indicadores de Desempenho
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <GavelIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.processosTotais}</p>
                    <p className="text-gray-600">Processos em Gestão</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <DollarSignIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.valorRecuperado}</p>
                    <p className="text-gray-600">Recursos Recuperados</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock4Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.tempoMedioResposta}</p>
                    <p className="text-gray-600">Tempo Médio de Resposta</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BarChart3Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.taxaSucesso}</p>
                    <p className="text-gray-600">Taxa de Resolutividade</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start">
              <img 
                src="/lovable-uploads/89bd7950-f4cd-40bd-aa52-fc3560ab0a2c.png" 
                alt="Governo do Tocantins" 
                className="h-16 mb-4"
              />
              <p className="text-primary-100/80">
                Sistema de Gestão de Ações Contra o Estado - Uma iniciativa da 
                Secretaria da Fazenda do Estado do Tocantins para modernização 
                da gestão processual.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-primary-100/80">
                <li><a href="https://www.to.gov.br" className="hover:text-white">Portal do Governo</a></li>
                <li><a href="https://sefaz.to.gov.br" className="hover:text-white">SEFAZ-TO</a></li>
                <li><a href="#" className="hover:text-white">Transparência</a></li>
                <li><a href="#" className="hover:text-white">Ouvidoria</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <address className="text-primary-100/80 not-italic">
                Secretaria da Fazenda do Estado do Tocantins<br />
                Esplanada das Secretarias<br />
                Palmas - TO<br />
                <a href="tel:+556332185555" className="hover:text-white">Tel: (63) 3218-5555</a>
              </address>
            </div>
          </div>
          <div className="border-t border-primary-light/20 mt-8 pt-8 text-center text-primary-100/80">
            <p>© 2024 Governo do Estado do Tocantins. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
