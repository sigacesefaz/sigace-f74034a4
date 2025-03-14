
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginDropdown() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    
    try {
      const { error } = await signInWithEmail(data.email, data.password);
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
        });
        navigate("/dashboard"); // Redireciona para o dashboard após login
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const LoginForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email</Label>
              <FormControl>
                <Input
                  type="email"
                  id="email"
                  placeholder="seuemail@email.com"
                  disabled={isLoggingIn}
                  className="border-primary/20 focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="********"
                    disabled={isLoggingIn}
                    className="border-primary/20 focus-visible:ring-primary pr-10"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-slate-50"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );

  // Versão mobile usando Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold">
            Entrar
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">Login</h2>
            <div className="p-0">
              <LoginForm />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Versão desktop mantendo o dropdown original
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold">
          Entrar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[32rem] p-0 border-0 shadow-md mt-[13px]" 
        align="end" 
        alignOffset={0}
        sideOffset={0}
      >
        <Card className="border rounded shadow-none">
          <div className="p-8 space-y-6">
            <LoginForm />
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
