import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCliente } from "../../../services/clientesService";

type UpdateClienteInput = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateClienteInput) =>
      updateCliente(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clientes"],
      });
    },
  });
};