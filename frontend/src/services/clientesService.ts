import { api } from "./api";

/**
 * GET - Obtener todos los clientes
 */
export const getClientes = async () => {
  const response = await api.get("/clientes");
  return response.data;
};

/**
 * POST - Crear cliente
 */
export const createCliente = async (data: any) => {
  const response = await api.post("/clientes", data);
  return response.data;
};