-- ======================================================
-- 010_seed.sql (nuevo) - Dataset mínimo coherente
-- Asume BIGSERIAL arrancando en 1 (ids por orden de INSERT)
-- ======================================================

-- ============================
-- ESTADOS / CATÁLOGOS
-- ============================

INSERT INTO estado_cliente (descripcion) VALUES
  ('ACTIVO'),
  ('INACTIVO');

INSERT INTO estado_plan (descripcion) VALUES
  ('ACTIVO'),
  ('INACTIVO');

INSERT INTO estado_contrato (descripcion) VALUES
  ('VIGENTE'),
  ('SUSPENDIDO'),
  ('FINALIZADO');

INSERT INTO estado_instalacion (descripcion) VALUES
  ('PENDIENTE'),
  ('REALIZADA'),
  ('CANCELADA');

INSERT INTO estado_programacion (descripcion_eprogramacion) VALUES
  ('PENDIENTE'),
  ('ASIGNADA'),
  ('REALIZADA'),
  ('CANCELADA');

INSERT INTO estado_garantia (descripcion_egarantia) VALUES
  ('VIGENTE'),
  ('VENCIDA'),
  ('ANULADA');

INSERT INTO estado_cuenta (descripcion_ecuenta) VALUES
  ('AL DIA'),
  ('DEUDOR'),
  ('SUSPENDIDA');

INSERT INTO estado_proveedor (descripcion_eprov) VALUES
  ('ACTIVO'),
  ('INACTIVO');

INSERT INTO estado_facturas_ventas (descripcion_efventa) VALUES
  ('EMITIDA'),
  ('PAGA'),
  ('VENCIDA'),
  ('ANULADA');

INSERT INTO estado_detalle_facturas_ventas (descripcion_dfventas) VALUES
  ('ACTIVO'),
  ('ANULADO');

INSERT INTO estado_domicilio (descripcion_edomicilio) VALUES
  ('VIGENTE'),
  ('HISTORICO');

INSERT INTO estado_pago (descripcion_epago) VALUES
  ('PENDIENTE'),
  ('PARCIAL'),
  ('PAGADO');

INSERT INTO tipo_pago (descripcion_tpago) VALUES
  ('EFECTIVO'),
  ('TRANSFERENCIA'),
  ('TARJETA');

INSERT INTO tipo_movimiento_stock (descripcion_tmstock) VALUES
  ('COMPRA'),
  ('INSTALACION'),
  ('AJUSTE'),
  ('GARANTIA');

-- ============================
-- TIPO_MOVIMIENTO_DETALLE_CUENTA
-- ============================

INSERT INTO tipo_movimiento_detalle_cuenta (
  codigo_tipo_mov_det_cuenta,
  descripcion_tipo_mov_det_cuenta,
  signo_tipo_mov_det_cuenta
) VALUES
  ('FACTURA', 'Emisión de factura', 'D'),
  ('PAGO', 'Pago del cliente', 'H'),
  ('AJUSTE', 'Ajuste manual', 'H');

-- ============================
-- TIPO_PRODUCTO + PRODUCTOS
-- ============================

INSERT INTO tipo_producto (codigo, descripcion) VALUES
  ('EQUIPO', 'Equipo de red'),
  ('CABLE', 'Cableado'),
  ('CONSUMIBLE', 'Consumible'),
  ('SERVICIO', 'Servicio');

INSERT INTO productos (nombre_producto, tipo_producto_id) VALUES
  ('Router WiFi', 1),
  ('Cable UTP Cat6', 2),
  ('Ficha RJ45', 3),
  ('Instalación Internet', 4);

-- ============================
-- PLANES + PRECIOS
-- ============================

INSERT INTO planes (nombre_plan, velocidad_mbps_plan, estado_plan_id, descripcion_plan) VALUES
  ('Plan Básico', 10, 1, 'Plan 10 Mbps'),
  ('Plan Intermedio', 20, 1, 'Plan 20 Mbps'),
  ('Plan Avanzado', 40, 1, 'Plan 40 Mbps');

INSERT INTO precios_planes (
  plan_id,
  promocion_id,
  precio_mensual_pplanes,
  fecha_desde_pplanes,
  fecha_hasta_pplanes,
  activo_pplanes
) VALUES
  (1, NULL, 20000, NOW(), NULL, TRUE),
  (2, NULL, 30000, NOW(), NULL, TRUE),
  (3, NULL, 50000, NOW(), NULL, TRUE);

-- ============================
-- CLIENTE
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
  'Prueba',
  '12345678',
  '3870000000',
  'cliente.prueba@red.local',
  NOW(),
  1, -- ACTIVO
  'Seed inicial'
);

-- ============================
-- DOMICILIOS (histórico con estado)
-- ============================

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
  estado_domicilio
) VALUES (
  1,                -- cliente_id
  'Torre A',
  3,
  'D',
  'Av. Principal',
  123,
  'Puerta azul',
  NOW(),            -- fecha_desde_dom
  NULL,             -- vigente
  1                 -- estado_domicilio: VIGENTE
);

-- ============================
-- CUENTA
-- ============================

INSERT INTO cuenta (
  cliente_id,
  saldo_cuenta,
  estado_cuenta_id
) VALUES (
  1,
  0,
  1 -- AL DIA
);

-- ============================
-- CONTRATO
-- ============================

INSERT INTO contratos (
  cliente_id,
  plan_id,
  fecha_inicio_contrato,
  fecha_fin_contrato,
  estado_contrato_id
) VALUES (
  1,
  2,      -- Plan Intermedio
  NOW(),
  NULL,
  1       -- VIGENTE
);

-- ============================
-- FACTURA_VENTAS + DETALLE_FACTURA_VENTAS
-- ============================

INSERT INTO facturas_ventas (
  cliente_id,
  concepto_fventas,
  estado_factura_venta_id,
  fecha_emision_fventas,
  fecha_vencimiento_fventas,
  importe_fventas,
  bonificacion_fventas,
  importe_total_fventas
) VALUES (
  1,
  'Servicio Internet - Periodo 2026-02',
  1,                -- EMITIDA
  NOW(),
  NOW() + INTERVAL '10 days',
  30000,
  0,
  30000
);

INSERT INTO detalle_facturas_ventas (
  factura_venta_id,
  producto_id,
  estado_det_fact_venta_id,
  precio_dfventas
) VALUES (
  1,
  4,   -- Instalación Internet (SERVICIO) (podés cambiarlo por un producto "Servicio mensual" si lo agregás)
  1,   -- ACTIVO
  30000
);

-- ============================
-- DETALLE_CUENTA (FACTURA)
-- ============================

INSERT INTO detalle_cuenta (
  cuenta_id,
  tipo_mov_det_cuenta_id,
  factura_venta_id,
  pago_id,
  importe_cuenta,
  observacion_cuenta
) VALUES (
  1,
  1,      -- FACTURA
  1,
  NULL,
  30000,
  'Factura mensual'
);

-- ============================
-- PAGOS (obligación) + PAGOS_MOVIMIENTOS (pagos parciales)
-- ============================

INSERT INTO pagos (
  contrato_id,
  factura_ventas_id,
  periodo_anio_pago,
  periodo_mes_pago,
  estado_pago_id
) VALUES (
  1,
  1,
  2026,
  2,
  2   -- PARCIAL
);

INSERT INTO pagos_movimientos (
  pago_id,
  fecha_pago,
  monto_pago,
  medio_pago,
  tipo_pago_id
) VALUES (
  1,
  NOW(),
  15000,
  'TRANSFERENCIA',
  2   -- TRANSFERENCIA
);

-- ============================
-- DETALLE_CUENTA (PAGO)
-- ============================

INSERT INTO detalle_cuenta (
  cuenta_id,
  tipo_mov_det_cuenta_id,
  factura_venta_id,
  pago_id,
  importe_cuenta,
  observacion_cuenta
) VALUES (
  1,
  2,      -- PAGO
  NULL,
  1,
  15000,
  'Pago parcial'
);

