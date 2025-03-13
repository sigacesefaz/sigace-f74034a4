
import { DatajudIntimation } from "@/types/datajud";

export async function getIntimationById(courtEndpoint: string, intimationNumber: string): Promise<DatajudIntimation | null> {
  try {
    console.log(`Getting intimation with number ${intimationNumber} from court ${courtEndpoint}`);
    
    return {
      id: crypto.randomUUID(),
      tribunal: "TJTO",
      numeroIntimacao: intimationNumber,
      dataIntimacao: new Date().toISOString(),
      tipo: "CITAÇÃO",
      partes: [
        {
          papel: "AUTOR",
          nome: "Estado do Tocantins",
          tipoPessoa: "JURIDICA",
          documento: "01.786.029/0001-03"
        },
        {
          papel: "RÉU",
          nome: "Contribuinte XYZ",
          tipoPessoa: "FISICA",
          documento: "123.456.789-00"
        }
      ],
      observacoes: "Intimação para pagamento de débito fiscal",
      status: "PENDENTE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipient: "Procuradoria do Estado",
      location: "Palmas - TO"
    };
    
  } catch (error) {
    console.error("Error fetching intimation:", error);
    return null;
  }
}
