export interface Plan {
  plan_id: number;
  nombre_plan: string;
  velocidad_mbps_plan: number;
  descripcion_plan?: string | null;
  estado_plan_id: number;
}

export interface PlanCreateInput {
  nombre_plan: string;
  velocidad_mbps_plan: number;
  descripcion_plan?: string;
  estado_plan_id: number;
}

export interface PlanUpdateInput {
  nombre_plan?: string;
  velocidad_mbps_plan?: number;
  descripcion_plan?: string;
  estado_plan_id?: number;
}

export interface PlanListResponse {
  items: Plan[];
}