import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlan } from "../services/planesService";
import type { PlanCreateInput } from "../types/plan";

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlanCreateInput) => createPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes"] });
    },
  });
}