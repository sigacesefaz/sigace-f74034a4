
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
  economiaAnual: "R$ 12,8M",
  taxaSucesso: "94%",
  processosPendentes: 126
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 via-white to-sage-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Sistema de Gestão de Ações Contra o Estado
              </h1>
              <p className="text-xl text-gray-600">
                Transformando a gestão de processos judiciais do Estado do Tocantins com eficiência, 
                transparência e tecnologia.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg">
                  <Link to="/login">Acessar Sistema</Link>
                </Button>
                <Button variant="outline" size="lg">
                  Saiba Mais
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-sage-200/50 to-sage-100/30 rounded-3xl" />
              <Card className="relative glass-card p-8 backdrop-blur">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <BarChart3Icon className="h-8 w-8 text-sage-600" />
                    <h3 className="font-semibold">Análise Avançada</h3>
                    <p className="text-sm text-gray-600">
                      Dashboards e relatórios detalhados para tomada de decisão
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Clock4Icon className="h-8 w-8 text-sage-600" />
                    <h3 className="font-semibold">Gestão de Prazos</h3>
                    <p className="text-sm text-gray-600">
                      Controle eficiente de deadlines e intimações
                    </p>
                  </div>
                  <div className="space-y-2">
                    <ShieldCheckIcon className="h-8 w-8 text-sage-600" />
                    <h3 className="font-semibold">Segurança</h3>
                    <p className="text-sm text-gray-600">
                      Proteção total dos dados e documentos
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Users2Icon className="h-8 w-8 text-sage-600" />
                    <h3 className="font-semibold">Colaboração</h3>
                    <p className="text-sm text-gray-600">
                      Trabalho em equipe simplificado
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs Section */}
      <section className="py-20 bg-gradient-to-r from-sage-50/50 to-sage-100/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Impacto e Resultados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 animate-in glass-card">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sage-100 rounded-lg">
                  <GavelIcon className="h-6 w-6 text-sage-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpiData.processosTotais}</p>
                  <p className="text-gray-600">Processos Gerenciados</p>
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
                  <p className="text-gray-600">Valor Recuperado</p>
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
                  <p className="text-gray-600">Taxa de Sucesso</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funcionalidades Principais
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 glass-card hover:shadow-lg transition-all">
              <GavelIcon className="h-10 w-10 text-sage-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão de Processos</h3>
              <p className="text-gray-600">
                Acompanhamento completo do ciclo de vida dos processos judiciais, 
                desde o cadastro até a conclusão.
              </p>
            </Card>
            <Card className="p-8 glass-card hover:shadow-lg transition-all">
              <Clock4Icon className="h-10 w-10 text-sage-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Controle de Prazos</h3>
              <p className="text-gray-600">
                Sistema inteligente de alertas e notificações para cumprimento 
                de prazos processuais.
              </p>
            </Card>
            <Card className="p-8 glass-card hover:shadow-lg transition-all">
              <BarChart3Icon className="h-10 w-10 text-sage-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Análise e Relatórios</h3>
              <p className="text-gray-600">
                Dashboards personalizados e geração de relatórios detalhados 
                para tomada de decisão.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-sage-50/50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Comece a Otimizar sua Gestão Processual
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se aos órgãos que já transformaram sua gestão de processos 
            judiciais com nossa plataforma.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/login">Acessar Plataforma</Link>
            </Button>
            <Button variant="outline" size="lg">
              Solicitar Demonstração
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
