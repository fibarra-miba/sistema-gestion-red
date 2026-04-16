import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";
import type { ContratoChangePlanInput } from "../types/contrato";

type Params = {
  contratoId: number;
  payload: ContratoChangePlanInput;
};

export const useChangePlanContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contratoId, payload }: Params) =>
      contratosService.changePlan(contratoId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["contratos"] });
      await queryClient.invalidateQueries({
        queryKey: ["contrato", variables.contratoId],
      });
    },
  });
};