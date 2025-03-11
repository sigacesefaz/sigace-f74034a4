
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function NavMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Aqui você pode adicionar lógica de logout se necessário
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between space-x-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Processos</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem
                  title="Lista de Processos"
                  href="/processes"
                >
                  Visualize e gerencie todos os processos
                </ListItem>
                <ListItem
                  title="Novo Processo"
                  href="/processes/new"
                >
                  Criar um novo processo
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Intimações</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem
                  title="Minhas Intimações"
                  href="/intimations"
                >
                  Gerencie suas intimações
                </ListItem>
                <ListItem
                  title="Nova Intimação"
                  href="/intimations/new"
                >
                  Criar nova intimação
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Notificações</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4">
                <ListItem
                  title="Central de Notificações"
                  href="/dashboard?tab=notifications"
                >
                  Visualize todas as suas notificações
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Relatórios</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem
                  title="Relatórios Gerenciais"
                  href="/dashboard?tab=reports&type=management"
                >
                  Visualize relatórios gerenciais
                </ListItem>
                <ListItem
                  title="Relatórios Estatísticos"
                  href="/dashboard?tab=reports&type=statistics"
                >
                  Análise estatística dos processos
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Configurações</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem
                  title="Configurações do Sistema"
                  href="/dashboard?tab=settings"
                >
                  Configurações gerais do sistema
                </ListItem>
                <ListItem
                  title="Perfil de Usuário"
                  href="/dashboard?tab=settings&type=profile"
                >
                  Edite seu perfil e preferências
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Button 
        variant="secondary"
        className="bg-[#fec30b] hover:bg-[#fec30b]/90 text-gray-900"
        onClick={handleLogout}
      >
        Sair
      </Button>
    </div>
  );
}
