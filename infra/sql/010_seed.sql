-- ======================================================
-- 010_seed.sql - Dataset mínimo para testing (Contratos + Pagos)
-- Compatible con 001_schema.sql + 002_constraints.sql (última versión)
-- ======================================================

-- ============================
-- ESTADOS BÁSICOS
-- ============================

INSERT INTO estado_cliente (descripcion) VALUES
  ('ACTIVO'),
  ('INACTIVO');

INSERT INTO estado_plan (descripcion) VALUES
  ('ACTIVO'),
  ('INACTIVO');

INSERT INTO estado_contrato (descripcion) VALUES
  ('BORRADOR'),
  ('PENDIENTE_INSTALACION'),
  ('ACTIVO'),
  ('SUSPENDIDO'),
  ('BAJA'),
  ('CANCELADO');

INSERT INTO estado_domicilio (descripcion_edomicilio) VALUES
  ('VIGENTE'),
  ('HISTORICO');

INSERT INTO estado_cuenta (descripcion_ecuenta) VALUES
  ('AL DIA'),
  ('DEUDOR'),
  ('SUSPENDIDA');

-- ============================
-- CATÁLOGOS MÓDULO PAGOS
-- ============================

INSERT INTO estado_facturas_ventas (descripcion_efventa) VALUES
  ('EMITIDA');

INSERT INTO estado_pago (descripcion_epago) VALUES
  ('PENDIENTE'),
  ('PARCIAL'),
  ('PAGADO');

INSERT INTO tipo_pago (descripcion_tpago) VALUES
  ('PAGO_CLIENTE'),
  ('AJUSTE_MANUAL');

INSERT INTO medios_pagos (descripcion) VALUES
  ('EFECTIVO'),
  ('TRANSFERENCIA'),
  ('TARJETA');

INSERT INTO tipo_promocion (descripcion_tpromo) VALUES
  ('PORCENTAJE'),
  ('DESCUENTO_FIJO');

INSERT INTO tipo_movimiento_detalle_cuenta (
  codigo_tipo_mov_det_cuenta,
  descripcion_tipo_mov_det_cuenta,
  signo_tipo_mov_det_cuenta,
  activo_tipo_mov_det_cuenta
) VALUES
  ('FACTURA',  'Factura del período',                 'D', TRUE),
  ('PAGO',     'Pago aplicado a cuenta corriente',    'H', TRUE),
  ('AJUSTE_D', 'Ajuste manual al Debe',               'D', TRUE),
  ('AJUSTE_H', 'Ajuste manual al Haber',              'H', TRUE);

-- ============================
-- PLANES
-- ============================

INSERT INTO planes (
  nombre_plan,
  velocidad_mbps_plan,
  estado_plan_id,
  descripcion_plan
) VALUES
  ('Plan Básico',      10, 1, 'Plan 10 Mbps'),
  ('Plan Intermedio',  20, 1, 'Plan 20 Mbps'),
  ('Plan Avanzado',    40, 1, 'Plan 40 Mbps');

-- ============================
-- PRECIOS PLANES (pricing)
-- ============================

INSERT INTO precios_planes (
  plan_id,
  precio_mensual_pplanes,
  fecha_desde_pplanes,
  fecha_hasta_pplanes,
  activo_pplanes
) VALUES
  (1, 10000, (CURRENT_DATE - INTERVAL '365 days'), NULL, TRUE),
  (2, 20000, (CURRENT_DATE - INTERVAL '365 days'), NULL, TRUE),
  (3, 40000, (CURRENT_DATE - INTERVAL '365 days'), NULL, TRUE);

-- ============================
-- PROMOCIONES
-- ============================

INSERT INTO promociones (
  nombre_promo,
  descripcion_promo,
  tipo_promo_id,
  porcentaje_descuento,
  monto_descuento,
  fecha_vigencia_desde_promo,
  fecha_vigencia_hasta_promo,
  activo_promo
) VALUES
  (
    'Promo 10% vigente',
    'Descuento porcentual vigente para testing',
    (SELECT tipo_promo_id FROM tipo_promocion WHERE descripcion_tpromo='PORCENTAJE' LIMIT 1),
    10,
    NULL,
    (CURRENT_DATE - INTERVAL '30 days'),
    (CURRENT_DATE + INTERVAL '30 days'),
    TRUE
  );

INSERT INTO promociones (
  nombre_promo,
  descripcion_promo,
  tipo_promo_id,
  porcentaje_descuento,
  monto_descuento,
  fecha_vigencia_desde_promo,
  fecha_vigencia_hasta_promo,
  activo_promo
) VALUES
  (
    'Promo $1000 vencida',
    'Descuento fijo vencido para testing',
    (SELECT tipo_promo_id FROM tipo_promocion WHERE descripcion_tpromo='DESCUENTO_FIJO' LIMIT 1),
    NULL,
    1000,
    (CURRENT_DATE - INTERVAL '90 days'),
    (CURRENT_DATE - INTERVAL '60 days'),
    TRUE
  );

-- ============================
-- CLIENTE 1 (para tests de Contratos)
-- ============================

INSERT INTO clientes (
  nombre_cliente,
  apellido_cliente,
  dni_cliente,
  telefono_cliente,
  email_cliente,
  fecha_alta_cliente,
  estado_cliente_id,
  observacion_cliente
) VALUES (
  'Cliente',
  'Testing',
  '12345678',
  '3870000000',
  'cliente.testing@red.local',
  NOW(),
  1,
  'Seed testing contratos (cliente 1)'
);

INSERT INTO domicilios (
  cliente_id,
  complejo,
  piso,
  depto,
  calle,
  numero,
  referencias,
  fecha_desde_dom,
  fecha_hasta_dom,
  estado_domicilio_id
) VALUES (
  1,
  'Torre A',
  3,
  'D',
  'Av. Principal',
  123,
  'Puerta azul',
  NOW(),
  NULL,
  1
);

INSERT INTO cuenta (
  cliente_id,
  saldo_cuenta,
  estado_cuenta_id
) VALUES (
  1,
  0,
  1
);

-- Cliente 1: contrato BORRADOR para lifecycle
INSERT INTO contratos (
  cliente_id,
  domicilio_id,
  plan_id,
  fecha_inicio_contrato,
  fecha_fin_contrato,
  aplica_promocion,
  promocion_id,
  estado_contrato_id
) VALUES (
  1,
  (SELECT domicilio_id FROM domicilios WHERE cliente_id = 1 ORDER BY domicilio_id ASC LIMIT 1),
  1,
  (CURRENT_DATE - INTERVAL '60 days'),
  NULL,
  FALSE,
  NULL,
  1  -- BORRADOR
);

-- ============================
-- CLIENTE 2 (para tests de Pagos)
-- ============================

INSERT INTO clientes (
  nombre_cliente,
  apellido_cliente,
  dni_cliente,
  telefono_cliente,
  email_cliente,
  fecha_alta_cliente,
  estado_cliente_id,
  observacion_cliente
) VALUES (
  'Cliente',
  'PagosSeed',
  '87654321',
  '3871111111',
  'cliente.pagos@red.local',
  NOW(),
  1,
  'Seed testing pagos (cliente 2)'
);

INSERT INTO domicilios (
  cliente_id,
  complejo,
  piso,
  depto,
  calle,
  numero,
  referencias,
  fecha_desde_dom,
  fecha_hasta_dom,
  estado_domicilio_id
) VALUES (
  2,
  'Torre B',
  2,
  'A',
  'Av. Secundaria',
  456,
  'Puerta roja',
  NOW(),
  NULL,
  1
);

INSERT INTO cuenta (
  cliente_id,
  saldo_cuenta,
  estado_cuenta_id
) VALUES (
  2,
  0,
  1
);

-- Cliente 2: contrato ACTIVO para pagos
INSERT INTO contratos (
  cliente_id,
  domicilio_id,
  plan_id,
  fecha_inicio_contrato,
  fecha_fin_contrato,
  aplica_promocion,
  promocion_id,
  estado_contrato_id
) VALUES (
  2,
  (SELECT domicilio_id FROM domicilios WHERE cliente_id = 2 ORDER BY domicilio_id ASC LIMIT 1),
  1,
  (CURRENT_DATE - INTERVAL '30 days'),
  NULL,
  FALSE,
  NULL,
  3  -- ACTIVO
);
