import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";
import type { ContratoCreateInput } from "../types/contrato";

export const useCreateContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ContratoCreateInput) => contratosService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contratos"] });
    },
  });
};