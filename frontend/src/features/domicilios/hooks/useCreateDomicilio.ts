import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDomicilio } from "../services/domiciliosService";

type CreateDomicilioInput = {
  clienteId: number;
  data: {
    complejo?: string;
    piso?: number | null;
    depto?: string;
    calle?: string;
    numero?: number | null;
    referencias?: string;
    estado_domicilio_id: number;
  };
};

export const useCreateDomicilio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clienteId, data }: CreateDomicilioInput) =>
      createDomicilio(clienteId, data),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["domicilioVigente", variables.clienteId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["domicilios", variables.clienteId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["clientes"],
      });
    },
  });
};