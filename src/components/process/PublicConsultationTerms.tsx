
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

interface PublicConsultationTermsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicConsultationTerms({ open, onOpenChange }: PublicConsultationTermsProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      navigate("/public/search");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Consulta Pública</DialogTitle>
          <DialogDescription>
            Termos de Uso da Consulta Pública
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Esta pesquisa é realizada utilizando a API Pública do DATAJUD. Os dados retornados são 
            informações públicas de processos judiciais, e podem ou não estar disponíveis dependendo 
            do tribunal e das configurações de privacidade do processo.
          </p>
          
          <p className="text-sm text-gray-600">
            A consulta tem finalidade meramente informativa e não substitui a consulta oficial 
            aos sites dos tribunais. Os dados são fornecidos sem garantia de completude, precisão 
            ou atualização.
          </p>
          
          <div className="flex items-center space-x-2 pt-4">
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
        
        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="bg-primary text-white"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
