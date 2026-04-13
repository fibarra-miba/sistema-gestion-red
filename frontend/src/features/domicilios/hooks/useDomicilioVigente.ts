import { useQuery } from "@tanstack/react-query";
import { getDomicilioVigente } from "../services/domiciliosService";

export const useDomicilioVigente = (clienteId?: number) => {
  return useQuery({
    queryKey: ["domicilioVigente", clienteId],
    queryFn: () => getDomicilioVigente(clienteId as number),
    enabled: !!clienteId,
    retry: false,
  });
};