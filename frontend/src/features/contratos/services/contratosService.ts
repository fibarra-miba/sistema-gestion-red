import { api } from "../../../services/api";
import type {
  Contrato,
  ContratoListResponse,
  ContratoCreateInput,
  ContratoChangePlanInput,
  ContratoConfirmTechnicalConditionInput,
} from "../types/contrato";

export const contratosService = {
  getAll: async (params?: {
    cliente_id?: number;
    estado_contrato_id?: number;
    plan_id?: number;
    domicilio_id?: number;
  }): Promise<Contrato[]> => {
    const { data } = await api.get<ContratoListResponse>("/contratos", {
      params,
    });
    return data.items;
  },

  getById: async (id: number): Promise<Contrato> => {
    const { data } = await api.get<Contrato>(`/contratos/${id}`);
    return data;
  },

  create: async (payload: ContratoCreateInput): Promise<Contrato> => {
    const { data } = await api.post<Contrato>("/contratos", payload);
    return data;
  },

  activate: async (id: number): Promise<void> => {
    await api.post(`/contratos/${id}/activate`);
  },

  suspend: async (id: number): Promise<void> => {
    await api.post(`/contratos/${id}/suspend`);
  },

  resume: async (id: number): Promise<void> => {
    await api.post(`/contratos/${id}/resume`);
  },

  cancel: async (id: number): Promise<void> => {
    await api.post(`/contratos/${id}/cancel`);
  },

  terminate: async (id: number): Promise<void> => {
    await api.post(`/contratos/${id}/terminate`);
  },

  changePlan: async (
    id: number,
    payload: ContratoChangePlanInput
  ): Promise<Contrato> => {
    const { data } = await api.post<Contrato>(
      `/contratos/${id}/change-plan`,
      payload
    );
    return data;
  },

  confirmTechnicalCondition: async (
    id: number,
    payload: ContratoConfirmTechnicalConditionInput
  ) => {
    const { data } = await api.post(
      `/contratos/${id}/confirmar-condicion-tecnica`,
      payload
    );
    return data;
  },
};