import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePlan } from "../services/planesService";

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) => deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes"] });
    },
  });
}