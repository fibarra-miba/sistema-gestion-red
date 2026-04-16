export interface Contrato {
  contrato_id: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_apellido: string;
  domicilio_id: number;
  plan_id: number;
  plan_nombre: string;
  fecha_inicio_contrato: string;
  fecha_fin_contrato?: string | null;
  estado_contrato_id: number;
  estado_contrato_descripcion: string;
  aplica_promocion: boolean;
  promocion_id?: number | null;
}

export interface ContratoListResponse {
  items: Contrato[];
}

export interface ContratoCreateInput {
  cliente_id: number;
  domicilio_id: number;
  plan_id: number;
}

export interface ContratoChangePlanInput {
  new_plan_id: number;
}

export interface ContratoConfirmTechnicalConditionInput {
  apto: boolean;
  fecha_programacion_pinstalacion?: string;
  tecnico_pinstalacion?: string;
  notas_pinstalacion?: string;
}