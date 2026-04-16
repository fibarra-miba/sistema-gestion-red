import { useQuery } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";
import type { Contrato } from "../types/contrato";

export const useContrato = (contratoId?: number) => {
  return useQuery<Contrato>({
    queryKey: ["contrato", contratoId],
    queryFn: () => contratosService.getById(contratoId as number),
    enabled: !!contratoId,
  });
};