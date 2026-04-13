export interface Domicilio {
  domicilio_id: number;
  cliente_id: number;
  complejo?: string | null;
  piso?: number | null;
  depto?: string | null;
  calle?: string | null;
  numero?: number | null;
  referencias?: string | null;
  fecha_desde_dom: string;
  fecha_hasta_dom?: string | null;
  estado_domicilio_id: number;
}