import { api } from "../../../services/api";

export const getDomicilioVigente = async (clienteId: number) => {
  const response = await api.get(`/clientes/${clienteId}/domicilio-vigente`);
  return response.data;
};

export const getDomicilios = async (clienteId: number) => {
  const response = await api.get(`/clientes/${clienteId}/domicilios`);
  return response.data;
};

export const createDomicilio = async (
  clienteId: number,
  data: {
    complejo?: string;
    piso?: number | null;
    depto?: string;
    calle?: string;
    numero?: number | null;
    referencias?: string;
    estado_domicilio_id: number;
  }
) => {
  const response = await api.post(`/clientes/${clienteId}/domicilios`, data);
  return response.data;
};