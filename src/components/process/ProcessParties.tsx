import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

export default function ProcessParties({ processId, parties, onPartiesChange }: ProcessPartiesProps) {
  const [localParties, setLocalParties] = useState(parties || []);

  useEffect(() => {
    setLocalParties(parties || []);
  }, [parties]);

  const handleAddParty = () => {
    setLocalParties([
      ...localParties,
      {
        papel: "",
        nome: "",
        tipoPessoa: "",
        documento: "",
        advogados: [],
      },
    ]);
  };

  const handleRemoveParty = (index: number) => {
    const newParties = [...localParties];
    newParties.splice(index, 1);
    setLocalParties(newParties);
    onPartiesChange?.(newParties);
  };

  const handlePartyChange = (index: number, field: string, value: any) => {
    const newParties = [...localParties];
    newParties[index][field] = value;
    setLocalParties(newParties);
    onPartiesChange?.(newParties);
  };

  const handleAddLawyer = (index: number) => {
    const newParties = [...localParties];
    newParties[index].advogados = [...newParties[index].advogados, { nome: "", inscricao: "" }];
    setLocalParties(newParties);
    onPartiesChange?.(newParties);
  };

  const handleRemoveLawyer = (partyIndex: number, lawyerIndex: number) => {
    const newParties = [...localParties];
    newParties[partyIndex].advogados.splice(lawyerIndex, 1);
    setLocalParties(newParties);
    onPartiesChange?.(newParties);
  };

  const handleLawyerChange = (partyIndex: number, lawyerIndex: number, field: string, value: string) => {
    const newParties = [...localParties];
    newParties[partyIndex].advogados[lawyerIndex][field] = value;
    setLocalParties(newParties);
    onPartiesChange?.(newParties);
  };

  return (
    <div>
      {localParties.map((party, index) => (
        <div key={index} className="mb-4 p-4 border rounded">
          <h4 className="text-lg font-semibold mb-2">Parte {index + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Papel</label>
              <Input
                type="text"
                value={party.papel}
                onChange={(e) => handlePartyChange(index, "papel", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <Input
                type="text"
                value={party.nome}
                onChange={(e) => handlePartyChange(index, "nome", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo Pessoa</label>
              <Input
                type="text"
                value={party.tipoPessoa}
                onChange={(e) => handlePartyChange(index, "tipoPessoa", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Documento</label>
              <Input
                type="text"
                value={party.documento}
                onChange={(e) => handlePartyChange(index, "documento", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4">
            <h5 className="text-md font-semibold mb-2">Advogados</h5>
            {party.advogados.map((lawyer, lawyerIndex) => (
              <div key={lawyerIndex} className="mb-2 p-2 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Advogado</label>
                    <Input
                      type="text"
                      value={lawyer.nome}
                      onChange={(e) => handleLawyerChange(index, lawyerIndex, "nome", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inscrição</label>
                    <Input
                      type="text"
                      value={lawyer.inscricao}
                      onChange={(e) => handleLawyerChange(index, lawyerIndex, "inscricao", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLawyer(index, lawyerIndex)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => handleAddLawyer(index)}>
              Adicionar Advogado
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemoveParty(index)}
            className="mt-4"
          >
            Remover Parte
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={handleAddParty}>
        Adicionar Parte
      </Button>
    </div>
  );
}

export interface ProcessPartiesProps {
  processId: string;
  parties?: any[];
  onPartiesChange?: (parties: any[]) => void;
}
