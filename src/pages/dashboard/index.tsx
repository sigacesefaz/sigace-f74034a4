import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

// Fix interface for DateRangePicker
interface DateRange {
  from: Date;
  to?: Date;
}
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProcessType, setSelectedProcessType] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

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
  const handleDateRangeChange = (range: DateRange) => {
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#2e3092]">Central de Notificações</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <BellIcon className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
            <Button variant="outline" size="sm">
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
                <div className="bg-blue-100 p-2 rounded-full">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Nova intimação recebida</h4>
                    <span className="text-xs text-gray-500">há 2 horas</span>
                  </div>
                  <p className="text-sm text-gray-600">O processo 0123456-78.2022.8.27.2700 recebeu uma nova intimação.</p>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-[#2e3092]">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </div>)}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline">Carregar mais</Button>
          </CardFooter>
        </Card>
      </div>;
  };

  // Render the Reports tab content
  const renderReportsTab = () => {
    const reportType = searchParams.get('type') || 'management';
    return <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#2e3092]">Relatórios</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'management');
            setSearchParams(searchParams);
          }} className={reportType === 'management' ? 'bg-[#2e3092] text-white' : ''}>
              <BarChartIcon className="h-4 w-4 mr-1" />
              Gerenciais
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'statistics');
            setSearchParams(searchParams);
          }} className={reportType === 'statistics' ? 'bg-[#2e3092] text-white' : ''}>
              <PieChartIcon className="h-4 w-4 mr-1" />
              Estatísticos
            </Button>
          </div>
        </div>

        {reportType === 'management' ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <XAxis dataKey="status" />
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
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  }]} cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#2e3092" dataKey="value" label>
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
                      <YAxis dataKey="fase" type="category" />
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#2e3092]">Configurações do Sistema</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'general');
            setSearchParams(searchParams);
          }} className={settingsType === 'general' || !settingsType ? 'bg-[#2e3092] text-white' : ''}>
              <SettingsIcon className="h-4 w-4 mr-1" />
              Geral
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'profile');
            setSearchParams(searchParams);
          }} className={settingsType === 'profile' ? 'bg-[#2e3092] text-white' : ''}>
              <UserCogIcon className="h-4 w-4 mr-1" />
              Perfil
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
            searchParams.set('type', 'notifications');
            setSearchParams(searchParams);
          }} className={settingsType === 'notifications' ? 'bg-[#2e3092] text-white' : ''}>
              <BellIcon className="h-4 w-4 mr-1" />
              Notificações
            </Button>
          </div>
        </div>

        {settingsType === 'general' || !settingsType ? <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Integração com API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_url">URL da API</Label>
                    <Input id="api_url" placeholder="https://api.exemplo.com.br" defaultValue="https://datajud.cnj.jus.br/api" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">Chave de API</Label>
                    <Input id="api_key" type="password" placeholder="Sua chave de API" defaultValue="********" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Configurações de Sistema</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup_auto">Backup Automático</Label>
                      <p className="text-sm text-gray-500">Realizar backup automático dos dados</p>
                    </div>
                    <Switch id="backup_auto" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications_enabled">Notificações por Email</Label>
                      <p className="text-sm text-gray-500">Receber notificações por email</p>
                    </div>
                    <Switch id="notifications_enabled" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark_mode">Modo Escuro</Label>
                      <p className="text-sm text-gray-500">Ativar tema escuro</p>
                    </div>
                    <Switch id="dark_mode" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Informações do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Versão</p>
                    <p className="text-sm text-gray-500">1.0.0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Última Atualização</p>
                    <p className="text-sm text-gray-500">10/05/2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Alterações</Button>
            </CardFooter>
          </Card> : settingsType === 'profile' ? <Card>
            <CardHeader>
              <CardTitle>Configurações de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_name">Nome</Label>
                    <Input id="user_name" placeholder="Seu nome" defaultValue="Usuário Padrão" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_email">Email</Label>
                    <Input id="user_email" type="email" placeholder="seu@email.com" defaultValue="usuario@sefaz.to.gov.br" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_department">Departamento</Label>
                    <Input id="user_department" placeholder="Seu departamento" defaultValue="Jurídico" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_position">Cargo</Label>
                    <Input id="user_position" placeholder="Seu cargo" defaultValue="Analista Jurídico" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Alterar Senha</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Senha Atual</Label>
                    <Input id="current_password" type="password" placeholder="Sua senha atual" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nova Senha</Label>
                    <Input id="new_password" type="password" placeholder="Nova senha" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Senha</Label>
                    <Input id="confirm_password" type="password" placeholder="Confirmar nova senha" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Atualizar Perfil</Button>
            </CardFooter>
          </Card> : <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Preferências de Notificação</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify_new_process">Novos Processos</Label>
                      <p className="text-sm text-gray-500">Receber notificações sobre novos processos</p>
                    </div>
                    <Switch id="notify_new_process" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify_deadlines">Prazos</Label>
                      <p className="text-sm text-gray-500">Receber alertas sobre prazos processuais</p>
                    </div>
                    <Switch id="notify_deadlines" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify_movements">Movimentações</Label>
                      <p className="text-sm text-gray-500">Receber notificações sobre movimentações processuais</p>
                    </div>
                    <Switch id="notify_movements" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify_decisions">Decisões</Label>
                      <p className="text-sm text-gray-500">Receber alertas sobre novas decisões</p>
                    </div>
                    <Switch id="notify_decisions" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Canais de Notificação</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel_email">Email</Label>
                      <p className="text-sm text-gray-500">Receber notificações por email</p>
                    </div>
                    <Switch id="channel_email" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel_system">Sistema</Label>
                      <p className="text-sm text-gray-500">Receber notificações no sistema</p>
                    </div>
                    <Switch id="channel_system" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel_mobile">Dispositivo Móvel</Label>
                      <p className="text-sm text-gray-500">Receber notificações no celular</p>
                    </div>
                    <Switch id="channel_mobile" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Preferências</Button>
            </CardFooter>
          </Card>}
      </div>;
  };

  // Render the main dashboard content
  const renderDashboardTab = () => {
    return <>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#2e3092]">Dashboard Institucional</h1>
          
          {/* Filtros */}
          <div className="flex gap-4">
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} className="w-[300px]" />
            <div className="w-[200px]">
              <select value={selectedRegion} onChange={handleRegionChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all">Todas as Regiões</option>
                <option value="norte">Norte</option>
                <option value="sul">Sul</option>
                <option value="central">Central</option>
              </select>
            </div>
            <div className="w-[200px]">
              <select value={selectedProcessType} onChange={handleProcessTypeChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all">Todos os Tipos</option>
                <option value="judicial">Judicial</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>
            <Button variant="outline">Aplicar Filtros</Button>
          </div>
        </div>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-xl transition-all">
            <CardHeader>
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
            <CardHeader>
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
            <CardHeader>
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
            <CardHeader>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Arrecadação por Período</h2>
            <ResponsiveContainer width="100%" height={400}>
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
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Distribuição por Tipo</h2>
            <ResponsiveContainer width="100%" height={400}>
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
              }]} cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#2e3092" dataKey="value" label>
                  <Cell fill="#2e3092" />
                  <Cell fill="#fec30b" />
                  <Cell fill="#ff7f50" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Status dos Processos</h2>
            <ResponsiveContainer width="100%" height={400}>
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
                <XAxis dataKey="status" />
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
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Tempo Médio por Fase</h2>
            <ResponsiveContainer width="100%" height={400}>
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
                <YAxis dataKey="fase" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="dias" fill="#2e3092" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabela de Processos Críticos */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#2e3092]">Processos Críticos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2e3092]">{processo.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{processo.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${processo.status === 'Urgente' ? 'bg-yellow-100 text-yellow-800' : processo.status === 'Atrasado' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                        {processo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{processo.prazo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{processo.responsavel}</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </>;
  };
  return <MainLayout>
      <div className="space-y-8">
        {/* Tabs para seleção de conteúdo */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          
          
          <TabsContent value="overview" className="mt-6 space-y-8">
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