import { api } from "./api";

export const getClientes = async (search?: string) => {
  const params: Record<string, string> = {};

  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await api.get("/clientes", { params });
  return response.data;
};

export const createCliente = async (data: any) => {
  const response = await api.post("/clientes", data);
  return response.data;
};

export const updateCliente = async (id: number, data: any) => {
  const response = await api.put(`/clientes/${id}`, data);
  return response.data;
};