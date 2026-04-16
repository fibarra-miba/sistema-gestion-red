import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";

export const useActivateContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contratoId: number) => contratosService.activate(contratoId),
    onSuccess: async (_, contratoId) => {
      await queryClient.invalidateQueries({ queryKey: ["contratos"] });
      await queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
    },
  });
};