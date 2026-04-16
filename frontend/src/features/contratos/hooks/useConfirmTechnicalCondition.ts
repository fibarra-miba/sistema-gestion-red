import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contratosService } from "../services/contratosService";
import type { ContratoConfirmTechnicalConditionInput } from "../types/contrato";

type Params = {
  contratoId: number;
  payload: ContratoConfirmTechnicalConditionInput;
};

export const useConfirmTechnicalCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contratoId, payload }: Params) =>
      contratosService.confirmTechnicalCondition(contratoId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["contratos"] });
      await queryClient.invalidateQueries({
        queryKey: ["contrato", variables.contratoId],
      });
    },
  });
};