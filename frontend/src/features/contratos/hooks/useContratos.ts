import { useQuery } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";
import type { Contrato } from "../types/contrato";

interface ContratosFilters {
  cliente_id?: number;
  estado_contrato_id?: number;
  plan_id?: number;
  domicilio_id?: number;
}

export const useContratos = (filters?: ContratosFilters) => {
  return useQuery<Contrato[]>({
    queryKey: ["contratos", filters],
    queryFn: () => contratosService.getAll(filters),
  });
};