import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlan } from "../services/planesService";
import type { PlanUpdateInput } from "../types/plan";

interface UpdatePlanParams {
  planId: number;
  payload: PlanUpdateInput;
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, payload }: UpdatePlanParams) =>
      updatePlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes"] });
    },
  });
}