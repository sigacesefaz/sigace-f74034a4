import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filters } from '@/components/ui/filters';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUpIcon, TrendingDownIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon, FileTextIcon, UserIcon, DollarSignIcon, BellIcon, PieChartIcon, BarChartIcon, SettingsIcon, UserCogIcon, DatabaseIcon, GlobeIcon, MailIcon, ShieldIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AutoUpdateConfig } from '@/components/settings/AutoUpdateConfig';
import { ResendConfig } from '@/components/settings/ResendConfig';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';

type DateRangePickerValue = {
  from: Date;
  to: Date;
};

interface DateRange {
  from?: Date;
  to?: Date;
}
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const dateRangePickerValue: DateRangePickerValue = {
    from: dateRange.from || new Date(),
    to: dateRange.to || new Date()
  };
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProcessType, setSelectedProcessType] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();

  // Get tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };
  const handleDateRangeChange = (range: DateRangePickerValue) => {
    setDateRange(range);
  };
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };
  const handleProcessTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProcessType(e.target.value);
  };

  // Render the Notifications tab content
  const renderNotificationsTab = () => {
    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl font-bold text-[#2e3092]">Central de Notificações</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <BellIcon className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <SettingsIcon className="h-4 w-4 mr-1" />
              Configurar notificações
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificações recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map(item => <div key={item} className="flex items-start space-x-4 p-3 border-b last:border-0 hover:bg-gray-50 rounded-md">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0"> {/* min-width para evitar overflow */}
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <h4 className="font-medium">Nova intimação recebida</h4>
                    <span className="text-xs text-gray-500 mt-1 sm:mt-0">há 2 horas</span>
                  </div>
                  <p className="text-sm text-gray-600 break-words">O processo 0123456-78.2022.8.27.2700 recebeu uma nova intimação.</p>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-[#2e3092]">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </div>)}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="w-full sm:w-auto">Carregar mais</Button>
          </CardFooter>
        </Card>
      </div>;
  };

  // Render the Reports tab content
  const renderReportsTab = () => {
    const reportType = searchParams.get('type') || 'management';
    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl font-bold text-[#2e3092]">Relatórios</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'management');
            setSearchParams(searchParams);
          }} className={`${reportType === 'management' ? 'bg-[#2e3092] text-white' : ''} w-full sm:w-auto`}>
              <BarChartIcon className="h-4 w-4 mr-1" />
              Gerenciais
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'statistics');
            setSearchParams(searchParams);
          }} className={`${reportType === 'statistics' ? 'bg-[#2e3092] text-white' : ''} w-full sm:w-auto`}>
              <PieChartIcon className="h-4 w-4 mr-1" />
              Estatísticos
            </Button>
          </div>
        </div>

        {reportType === 'management' ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{
                  status: 'Em Análise',
                  quantidade: 450
                }, {
                  status: 'Aguardando Doc.',
                  quantidade: 280
                }, {
                  status: 'Em Recurso',
                  quantidade: 190
                }, {
                  status: 'Concluídos',
                  quantidade: 890
                }, {
                  status: 'Arquivados',
                  quantidade: 390
                }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" tick={!isMobile} tickFormatter={isMobileOrTablet ? value => value.substring(0, 3) : undefined} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantidade" fill="#2e3092" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Arrecadação Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{
                  name: 'Jan',
                  valor: 4000
                }, {
                  name: 'Fev',
                  valor: 3000
                }, {
                  name: 'Mar',
                  valor: 5000
                }, {
                  name: 'Abr',
                  valor: 2780
                }, {
                  name: 'Mai',
                  valor: 4890
                }, {
                  name: 'Jun',
                  valor: 6390
                }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="valor" stroke="#2e3092" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{
                    name: 'Judicial',
                    value: 850
                  }, {
                    name: 'Administrativo',
                    value: 650
                  }, {
                    name: 'Recursal',
                    value: 347
                  }]} cx="50%" cy="50%" innerRadius={isMobile ? 60 : 80} outerRadius={isMobile ? 90 : 120} fill="#2e3092" dataKey="value" label={!isMobile}>
                        <Cell fill="#2e3092" />
                        <Cell fill="#fec30b" />
                        <Cell fill="#ff7f50" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio por Fase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{
                  fase: 'Análise Inicial',
                  dias: 15
                }, {
                  fase: 'Documentação',
                  dias: 25
                }, {
                  fase: 'Parecer Técnico',
                  dias: 30
                }, {
                  fase: 'Recurso',
                  dias: 45
                }, {
                  fase: 'Decisão Final',
                  dias: 20
                }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="fase" type="category" width={isMobile ? 80 : 120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="dias" fill="#2e3092" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>;
  };

  // Render the Settings tab content
  const renderSettingsTab = () => {
    const settingsType = searchParams.get('type') || 'general';
    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl font-bold text-[#2e3092]">Configurações do Sistema</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="w-full sm:w-auto">
              <SettingsIcon className="h-4 w-4 mr-1" />
              Ir para Configurações
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-gray-500">
              As configurações do sistema foram movidas para uma nova página.
              Clique no botão acima para acessar todas as configurações.
            </p>
          </CardContent>
        </Card>
      </div>;
  };

  // Render the main dashboard content
  const renderDashboardTab = () => {
    return <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-[#2e3092]">Dashboard Institucional</h1>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <DateRangePicker value={dateRangePickerValue} onChange={handleDateRangeChange} className="w-full sm:w-[300px]" />
            <div className="w-full sm:w-[200px]">
              <select value={selectedRegion} onChange={handleRegionChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all">Todas as Regiões</option>
                <option value="norte">Norte</option>
                <option value="sul">Sul</option>
                <option value="central">Central</option>
              </select>
            </div>
            <div className="w-full sm:w-[200px]">
              <select value={selectedProcessType} onChange={handleProcessTypeChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all">Todos os Tipos</option>
                <option value="judicial">Judicial</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Aplicar Filtros</Button>
          </div>
        </div>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#2e3092] flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Arrecadação Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ 12,3M</p>
              <Progress value={85} className="h-2 mt-2 bg-[#2e3092]/20 [&>div]:bg-[#2e3092]" />
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUpIcon className="h-4 w-4" />
                +2.5% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#2e3092] flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" />
                Processos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1.847</p>
              <Progress value={65} className="h-2 mt-2 bg-[#2e3092]/20 [&>div]:bg-[#2e3092]" />
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <TrendingDownIcon className="h-4 w-4" />
                -1.2% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#2e3092] flex items-center gap-2">
                <AlertCircleIcon className="h-5 w-5" />
                Processos Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">127</p>
              <Progress value={45} className="h-2 mt-2 bg-red-200 [&>div]:bg-red-600" />
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircleIcon className="h-4 w-4" />
                15 novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#2e3092] flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Tempo Médio Resolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">45d</p>
              <Progress value={75} className="h-2 mt-2 bg-[#2e3092]/20 [&>div]:bg-[#2e3092]" />
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUpIcon className="h-4 w-4" />
                -5d vs média anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Arrecadação por Período</h2>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{
                name: 'Jan',
                valor: 4000,
                meta: 4500
              }, {
                name: 'Fev',
                valor: 3000,
                meta: 4500
              }, {
                name: 'Mar',
                valor: 5000,
                meta: 4500
              }, {
                name: 'Abr',
                valor: 2780,
                meta: 4500
              }, {
                name: 'Mai',
                valor: 4890,
                meta: 4500
              }, {
                name: 'Jun',
                valor: 6390,
                meta: 4500
              }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#2e3092" strokeWidth={2} />
                  <Line type="monotone" dataKey="meta" stroke="#fec30b" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Distribuição por Tipo</h2>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{
                  name: 'Judicial',
                  value: 850
                }, {
                  name: 'Administrativo',
                  value: 650
                }, {
                  name: 'Recursal',
                  value: 347
                }]} cx="50%" cy="50%" innerRadius={isMobile ? 60 : 80} outerRadius={isMobile ? 90 : 120} fill="#2e3092" dataKey="value" label={!isMobile}>
                    <Cell fill="#2e3092" />
                    <Cell fill="#fec30b" />
                    <Cell fill="#ff7f50" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Status dos Processos</h2>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{
                status: 'Em Análise',
                quantidade: 450
              }, {
                status: 'Aguardando Doc.',
                quantidade: 280
              }, {
                status: 'Em Recurso',
                quantidade: 190
              }, {
                status: 'Concluídos',
                quantidade: 890
              }, {
                status: 'Arquivados',
                quantidade: 390
              }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={!isMobile} tickFormatter={isMobileOrTablet ? value => value.substring(0, 3) : undefined} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#2e3092">
                    {/* Cores diferentes para cada status */}
                    <Cell fill="#2e3092" />
                    <Cell fill="#fec30b" />
                    <Cell fill="#ff7f50" />
                    <Cell fill="#4CAF50" />
                    <Cell fill="#9e9e9e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Tempo Médio por Fase</h2>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={[{
                fase: 'Análise Inicial',
                dias: 15
              }, {
                fase: 'Documentação',
                dias: 25
              }, {
                fase: 'Parecer Técnico',
                dias: 30
              }, {
                fase: 'Recurso',
                dias: 45
              }, {
                fase: 'Decisão Final',
                dias: 20
              }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="fase" type="category" width={isMobile ? 80 : 120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="dias" fill="#2e3092" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Tabela de Processos Críticos */}
        <Card className="p-4 sm:p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Processos Críticos</h2>
          <div className="overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[{
                id: '2024001',
                tipo: 'Judicial',
                status: 'Urgente',
                prazo: '2 dias',
                responsavel: 'Ana Silva'
              }, {
                id: '2024015',
                tipo: 'Administrativo',
                status: 'Atrasado',
                prazo: 'Vencido',
                responsavel: 'João Santos'
              }, {
                id: '2024023',
                tipo: 'Recursal',
                status: 'Crítico',
                prazo: '1 dia',
                responsavel: 'Maria Oliveira'
              }].map((processo, idx) => <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm font-medium text-[#2e3092]">{processo.id}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{processo.tipo}</td>
                    <td className="px-3 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${processo.status === 'Urgente' ? 'bg-yellow-100 text-yellow-800' : processo.status === 'Atrasado' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                        {processo.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">{processo.prazo}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{processo.responsavel}</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </>;
  };
  return <MainLayout>
      <div className="space-y-6 px-2 sm:px-4">
        {/* Tabs para seleção de conteúdo */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            {renderDashboardTab()}
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            {renderNotificationsTab()}
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            {renderReportsTab()}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            {renderSettingsTab()}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>;
}
