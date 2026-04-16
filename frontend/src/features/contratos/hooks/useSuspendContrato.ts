import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";

export const useSuspendContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contratoId: number) => contratosService.suspend(contratoId),
    onSuccess: async (_, contratoId) => {
      await queryClient.invalidateQueries({ queryKey: ["contratos"] });
      await queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
    },
  });
};