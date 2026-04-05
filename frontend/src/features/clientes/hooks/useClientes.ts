import { useQuery } from "@tanstack/react-query";
import { getClientes } from "../../../services/clientesService";
import type { Cliente } from "../types/cliente";

export const useClientes = (search: string = "") => {
  return useQuery<Cliente[]>({
    queryKey: ["clientes", search],
    queryFn: () => getClientes(search),
  });
};