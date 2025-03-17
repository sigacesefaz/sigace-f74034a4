
import { Court, CourtType } from "@/types/datajud";

export const courts: Record<CourtType, Court[]> = {
  SUPERIOR: [
    {
      id: "stf",
      name: "Supremo Tribunal Federal",
      type: "SUPERIOR",
      endpoint: "stf",
    },
    {
      id: "stj",
      name: "Superior Tribunal de Justiça",
      type: "SUPERIOR",
      endpoint: "stj",
    },
    {
      id: "tst",
      name: "Tribunal Superior do Trabalho",
      type: "SUPERIOR",
      endpoint: "tst",
    },
    {
      id: "tse",
      name: "Tribunal Superior Eleitoral",
      type: "SUPERIOR",
      endpoint: "tse",
    },
    {
      id: "stm",
      name: "Superior Tribunal Militar",
      type: "SUPERIOR",
      endpoint: "stm",
    },
  ],
  FEDERAL: [
    {
      id: "trf1",
      name: "Tribunal Regional Federal da 1ª Região",
      type: "FEDERAL",
      endpoint: "trf1",
    },
    {
      id: "trf2",
      name: "Tribunal Regional Federal da 2ª Região",
      type: "FEDERAL",
      endpoint: "trf2",
    },
    {
      id: "trf3",
      name: "Tribunal Regional Federal da 3ª Região",
      type: "FEDERAL",
      endpoint: "trf3",
    },
    {
      id: "trf4",
      name: "Tribunal Regional Federal da 4ª Região",
      type: "FEDERAL",
      endpoint: "trf4",
    },
    {
      id: "trf5",
      name: "Tribunal Regional Federal da 5ª Região",
      type: "FEDERAL",
      endpoint: "trf5",
    },
    {
      id: "trf6",
      name: "Tribunal Regional Federal da 6ª Região",
      type: "FEDERAL",
      endpoint: "trf6",
    },
  ],
  ESTADUAL: [
    {
      id: "tjto",
      name: "Tribunal de Justiça do Tocantins",
      type: "ESTADUAL",
      endpoint: "tjto",
    },
  ],
  TRABALHISTA: [],
  ELEITORAL: [],
  MILITAR: [],
};
