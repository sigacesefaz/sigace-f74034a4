
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface PublicConsultationTermsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicConsultationTerms({ open, onOpenChange }: PublicConsultationTermsProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [activeStep, setActiveStep] = useState<string>("terms");
  const [processNumber, setProcessNumber] = useState<string>("");
  const [courtEndpoint, setCourtEndpoint] = useState<string>("");

  const handleStepClick = (step: string) => {
    if (step === "terms" || (step === "search" && accepted) || (step === "result" && processNumber)) {
      setActiveStep(step);
    }
  };

  const handleAcceptTerms = () => {
    if (accepted) {
      setActiveStep("search");
    }
  };

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setProcessNumber(processNumber);
    setCourtEndpoint(courtEndpoint);
    setActiveStep("result");
    return true;
  };

  const handleNavigateToPublicSearch = () => {
    try {
      // Primeiro, feche o diálogo
      onOpenChange(false);
      
      // Notifique o usuário
      toast({
        title: "Processo selecionado",
        description: "Redirecionando para visualização do processo...",
      });
      
      // Armazene as informações do processo selecionado
      sessionStorage.setItem('publicProcessNumber', processNumber);
      sessionStorage.setItem('publicCourtEndpoint', courtEndpoint);
      
      // Use um timeout para garantir que o diálogo feche completamente antes da navegação
      setTimeout(() => {
        // Navegue para a página de visualização do processo
        navigate("/public/process-view");
      }, 300);
    } catch (error) {
      console.error("Erro ao navegar:", error);
      toast({
        title: "Erro de navegação",
        description: "Não foi possível acessar a página de consulta pública.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto" 
      >
        <DialogHeader>
          <DialogTitle>Consulta Pública de Processos</DialogTitle>
          <DialogDescription>
            Acompanhe o andamento de processos judiciais
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Indicador de progresso do wizard */}
          <div className="mb-6">
            <Tabs 
              value={activeStep} 
              onValueChange={handleStepClick}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="terms" 
                  className="flex items-center gap-2"
                  data-state={activeStep === "terms" ? "active" : accepted ? "completed" : ""}
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Termos</span>
                  {accepted && activeStep !== "terms" && (
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="search" 
                  disabled={!accepted}
                  className="flex items-center gap-2"
                  data-state={activeStep === "search" ? "active" : processNumber ? "completed" : ""}
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Pesquisa</span>
                  {processNumber && activeStep !== "search" && (
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="result" 
                  disabled={!processNumber}
                  className="flex items-center gap-2"
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Resultado</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="terms" className="mt-4">
                <div className="space-y-4">
                  <div className="border p-4 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">
                      Esta pesquisa é realizada utilizando a API Pública do DATAJUD. Os dados retornados são 
                      informações públicas de processos judiciais, e podem ou não estar disponíveis dependendo 
                      do tribunal e das configurações de privacidade do processo.
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      A consulta tem finalidade meramente informativa e não substitui a consulta oficial 
                      aos sites dos tribunais. Os dados são fornecidos sem garantia de completude, precisão 
                      ou atualização.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={accepted} 
                      onCheckedChange={(checked) => setAccepted(checked as boolean)} 
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Concordo com os termos de uso da consulta pública
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleAcceptTerms}
                    disabled={!accepted}
                    className="bg-primary text-white"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-4">
                <ProcessSearch 
                  onProcessSelect={handleProcessSelect} 
                  isPublic={true}
                />
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep("terms")}
                  >
                    Voltar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="result" className="mt-4">
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Processo Encontrado</h3>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Número do Processo:</span>
                      <span className="font-medium">{processNumber}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Tribunal:</span>
                      <span className="font-medium">
                        {courtEndpoint.includes("tjto") ? "Tribunal de Justiça do Tocantins" : 
                         courtEndpoint.includes("tjsp") ? "Tribunal de Justiça de São Paulo" : 
                         courtEndpoint}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep("search")}
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    onClick={handleNavigateToPublicSearch}
                    className="bg-primary text-white"
                  >
                    Visualizar Processo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
