-- =========================
-- Índices útiles
-- =========================
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_plan_id ON contratos(plan_id);
CREATE INDEX IF NOT EXISTS idx_pagos_contrato_id ON pagos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contratos_domicilio_id ON contratos(domicilio_id);
CREATE INDEX IF NOT EXISTS idx_pinst_reprog_programacion ON reprogramacion_instalaciones(programacion_id);
CREATE INDEX IF NOT EXISTS idx_dinstalacion_instalacion ON detalle_instalacion(instalacion_id);
CREATE INDEX IF NOT EXISTS idx_instalaciones_contrato ON instalaciones(contrato_id);
CREATE INDEX IF NOT EXISTS idx_instalaciones_programacion ON instalaciones(programacion_id);
CREATE INDEX IF NOT EXISTS idx_pinstalaciones_contrato ON programacion_instalaciones(contrato_id);
CREATE INDEX IF NOT EXISTS idx_pinstalaciones_estado ON programacion_instalaciones(estado_programacion_id);
CREATE INDEX IF NOT EXISTS idx_pinstalaciones_fecha ON programacion_instalaciones(fecha_programacion_pinstalacion);
CREATE INDEX IF NOT EXISTS idx_instalaciones_estado ON instalaciones(estado_instalacion_id);
CREATE INDEX IF NOT EXISTS idx_garantia_contrato ON garantia(contrato_id);
CREATE INDEX IF NOT EXISTS idx_garantia_instalacion ON garantia(instalacion_id);
CREATE INDEX IF NOT EXISTS idx_dinstalacion_producto ON detalle_instalacion(producto_id);

-- Para selector de cobrables (estado + fechas)
CREATE INDEX IF NOT EXISTS idx_contratos_cobrables
  ON contratos (estado_contrato_id, fecha_inicio_contrato, fecha_fin_contrato, contrato_id)
  WHERE estado_contrato_id = 3;
