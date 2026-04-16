import { useQuery } from "@tanstack/react-query";
import { getDomicilios } from "../../domicilios/services/domiciliosService";
import type { Domicilio } from "../../domicilios/types/domicilio";

export const useDomiciliosByCliente = (clienteId?: number) => {
  return useQuery<Domicilio[]>({
    queryKey: ["domicilios", "cliente", clienteId],
    queryFn: () => getDomicilios(clienteId as number),
    enabled: !!clienteId,
  });
};