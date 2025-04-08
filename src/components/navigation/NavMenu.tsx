import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Settings, X, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { href: string }
>(({ className, title, children, href, ...props }, ref) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigating to:", href); // Debug log
    navigate(href);
  };

  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          href={href}
          onClick={handleClick}
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
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const handleHome = () => {
    navigate('/dashboard');
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  };

  const navigationItems = [
    
    {
      title: "Processos",
      items: [
        {
          title: "Lista de Processos",
          href: "/processes",
          description: "Visualize e gerencie todos os processos"
        },
        {
          title: "Processos Arquivados",
          href: "/processes/archived",
          description: "Visualize os processos arquivados"
        },
        {
          title: "Novo Processo",
          href: "/processes/new",
          description: "Criar um novo processo"
        }
      ]
    },
    {
      title: "Intimações",
      items: [
        {
          title: "Minhas Intimações",
          href: "/intimations",
          description: "Gerencie suas intimações"
        },
        {
          title: "Nova Intimação",
          href: "/intimations/new",
          description: "Criar nova intimação"
        }
      ]
    },
    {
      title: "Notificações",
      items: [
        {
          title: "Central de Notificações",
          href: "/dashboard?tab=notifications",
          description: "Visualize todas as suas notificações"
        }
      ]
    },
    {
      title: "Relatórios",
      items: [
        {
          title: "Relatórios Gerenciais",
          href: "/dashboard?tab=reports&type=management",
          description: "Visualize relatórios gerenciais"
        },
        {
          title: "Relatórios Estatísticos",
          href: "/dashboard?tab=reports&type=statistics",
          description: "Análise estatística dos processos"
        }
      ]
    },
    {
      title: "Configurações",
      items: [
        {
          title: "Configurações do Sistema",
          href: "/settings",
          description: "Configurações gerais do sistema"
        }
      ]
    }
  ];
  
  // Mobile drawer menu
  const MobileMenu = () => (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-center">Menu</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-2 overflow-y-auto">
          <div className="mb-6">
            <Button 
              variant="ghost"
              size="sm"
              className="w-full justify-start text-lg mb-4 font-medium"
              onClick={() => {
                handleHome();
                setIsDrawerOpen(false);
              }}
            >
              <Home className="h-5 w-5 mr-2" /> Início
            </Button>
          </div>
          {navigationItems.map((category, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="font-medium text-lg mb-2">{category.title}</h3>
              <div className="space-y-3">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="border-b pb-2">
                    <Link
                      to={item.href}
                      className="block py-2 text-sm hover:text-primary"
                      onClick={() => {
                        console.log("Mobile menu navigating to:", item.href); // Debug log
                        setIsDrawerOpen(false);
                      }}
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter className="border-t">
          <Button 
            className="bg-[#fec30b] hover:bg-[#fec30b]/90 text-gray-900 w-full"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
  
  // Desktop navigation menu - original implementation
  const DesktopMenu = () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Button 
            variant="ghost" 
            onClick={handleHome} 
            className="flex items-center px-4 py-2 text-base font-medium"
          >
            <Home className="h-4 w-4 mr-2" /> Início
          </Button>
        </NavigationMenuItem>
        {navigationItems.map((category, idx) => (
          <NavigationMenuItem key={idx}>
            <NavigationMenuTrigger>{category.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className={cn(
                "grid gap-3 p-4",
                category.items.length > 1 ? "md:w-[500px] md:grid-cols-2 lg:w-[600px]" : "w-[400px]"
              )}>
                {category.items.map((item, itemIdx) => (
                  <ListItem
                    key={itemIdx}
                    title={item.title}
                    href={item.href}
                  >
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <div className="flex items-left justify-between space-x-1">
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
      
      {!isMobile && (
        <Button 
          variant="secondary"
          className="bg-[#fec30b] hover:bg-[#fec30b]/90 text-gray-900"
          onClick={handleLogout}
        >
          Sair
        </Button>
      )}
    </div>
  );
}
