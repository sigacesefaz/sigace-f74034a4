
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sage-50 via-white to-sage-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <GavelIcon className="h-8 w-8 text-sage-600" />
              <span className="text-xl font-semibold text-gray-900">SIGACE</span>
            </div>
            <Button asChild variant="ghost">
              <Link to="/login" className="text-sage-600 hover:text-sage-700">
                Acessar Sistema
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
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
                  <Button asChild size="lg">
                    <Link to="/login">Área Restrita</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    Consulta Pública
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-sage-200/50 to-sage-100/30 rounded-3xl" />
                <Card className="relative glass-card p-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <BarChart3Icon className="h-8 w-8 text-sage-600" />
                      <h3 className="font-semibold">Gestão Eficiente</h3>
                      <p className="text-sm text-gray-600">
                        Acompanhamento em tempo real dos processos
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Clock4Icon className="h-8 w-8 text-sage-600" />
                      <h3 className="font-semibold">Controle de Prazos</h3>
                      <p className="text-sm text-gray-600">
                        Gestão automatizada de deadlines
                      </p>
                    </div>
                    <div className="space-y-2">
                      <ShieldCheckIcon className="h-8 w-8 text-sage-600" />
                      <h3 className="font-semibold">Segurança</h3>
                      <p className="text-sm text-gray-600">
                        Conformidade com LGPD
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Users2Icon className="h-8 w-8 text-sage-600" />
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
        <section className="py-16 bg-gradient-to-r from-sage-50/50 to-sage-100/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Indicadores de Desempenho
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <GavelIcon className="h-6 w-6 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.processosTotais}</p>
                    <p className="text-gray-600">Processos em Gestão</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <DollarSignIcon className="h-6 w-6 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.valorRecuperado}</p>
                    <p className="text-gray-600">Recursos Recuperados</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Clock4Icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpiData.tempoMedioResposta}</p>
                    <p className="text-gray-600">Tempo Médio de Resposta</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 animate-in glass-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <BarChart3Icon className="h-6 w-6 text-sage-600" />
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
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre o SIGACE</h3>
              <p className="text-gray-400">
                Sistema de Gestão de Ações Contra o Estado - Uma iniciativa da 
                Secretaria da Fazenda do Estado do Tocantins para modernização 
                da gestão processual.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://www.to.gov.br" className="hover:text-white">Portal do Governo</a></li>
                <li><a href="https://sefaz.to.gov.br" className="hover:text-white">SEFAZ-TO</a></li>
                <li><a href="#" className="hover:text-white">Transparência</a></li>
                <li><a href="#" className="hover:text-white">Ouvidoria</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <address className="text-gray-400 not-italic">
                Secretaria da Fazenda do Estado do Tocantins<br />
                Esplanada das Secretarias<br />
                Palmas - TO<br />
                <a href="tel:+556332185555" className="hover:text-white">Tel: (63) 3218-5555</a>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Governo do Estado do Tocantins. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
