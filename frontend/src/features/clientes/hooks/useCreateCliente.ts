import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCliente } from "../../../services/clientesService";

export const useCreateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
};