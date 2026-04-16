import axios from "axios";
import type {
  Plan,
  PlanCreateInput,
  PlanListResponse,
  PlanUpdateInput,
} from "../types/plan";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export async function getPlanes(): Promise<Plan[]> {
  const { data } = await api.get<PlanListResponse>("/planes");
  return data.items;
}

export async function getPlanById(planId: number): Promise<Plan> {
  const { data } = await api.get<Plan>(`/planes/${planId}`);
  return data;
}

export async function createPlan(payload: PlanCreateInput): Promise<Plan> {
  const { data } = await api.post<Plan>("/planes", payload);
  return data;
}

export async function updatePlan(
  planId: number,
  payload: PlanUpdateInput
): Promise<Plan> {
  const { data } = await api.patch<Plan>(`/planes/${planId}`, payload);
  return data;
}

export async function deletePlan(planId: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/planes/${planId}`);
  return data;
}