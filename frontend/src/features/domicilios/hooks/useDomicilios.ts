import { useQuery } from "@tanstack/react-query";
import { getDomicilios } from "../services/domiciliosService";
import type { Domicilio } from "../types/domicilio";

export const useDomicilios = (clienteId?: number) => {
  return useQuery<Domicilio[]>({
    queryKey: ["domicilios", clienteId],
    queryFn: () => getDomicilios(clienteId as number),
    enabled: !!clienteId,
  });
};