-- =========================
-- Índices útiles
-- =========================
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_plan_id ON contratos(plan_id);
CREATE INDEX IF NOT EXISTS idx_pagos_contrato_id ON pagos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_cd_cliente_id ON cliente_domicilio(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cd_domicilio_id ON cliente_domicilio(domicilio_id);
