-- ============================
-- ESTADOS
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
-- TIPO_PRODUCTO
-- ============================

INSERT INTO tipo_producto (codigo, descripcion) VALUES
  ('EQUIPO', 'Equipo de red'),
  ('CABLE', 'Cableado'),
  ('CONSUMIBLE', 'Consumible'),
  ('SERVICIO', 'Servicio');

-- ============================
-- PRODUCTOS
-- ============================

INSERT INTO productos (nombre_producto, tipo_producto_id) VALUES
  ('Router WiFi', 1),
  ('Cable UTP Cat6', 2),
  ('Ficha RJ45', 3),
  ('Instalación Internet', 4);

-- ============================
-- PLANES
-- ============================

INSERT INTO planes (nombre_plan, velocidad_mbps_plan, estado_plan_id) VALUES
  ('Plan Básico', 10, 1),
  ('Plan Intermedio', 20, 1),
  ('Plan Avanzado', 40, 1);

-- ============================
-- PRECIOS_PLANES
-- ============================

INSERT INTO precios_planes (
  plan_id,
  precio_mensual_pplanes,
  fecha_desde_pplanes,
  activo_pplanes
) VALUES
  (1, 20000, now(), TRUE),
  (2, 30000, now(), TRUE),
  (3, 50000, now(), TRUE);

-- ============================
-- DOMICILIO
-- ============================

INSERT INTO domicilio (complejo, piso, depto, calle, numero)
VALUES ('Torre A', 3, 'D', 'Av. Principal', 123);

-- ============================
-- CLIENTE
-- ============================

INSERT INTO clientes (
  nombre_cliente,
  apellido_cliente,
  dni_cliente,
  telefono_cliente,
  estado_cliente_id
) VALUES (
  'Cliente',
  'Prueba',
  '12345678',
  '3870000000',
  1
);

-- ============================
-- CLIENTE_DOMICILIO
-- ============================

INSERT INTO cliente_domicilio (
  cliente_id,
  domicilio_id,
  fecha_desde_clidom
) VALUES (1, 1, now());

-- ============================
-- CUENTA
-- ============================

INSERT INTO cuenta (
  cliente_id,
  saldo_cuenta,
  estado_cuenta_id
) VALUES (1, 0, 1);

-- ============================
-- CONTRATO
-- ============================

INSERT INTO contratos (
  cliente_id,
  plan_id,
  fecha_inicio_contrato,
  estado_contrato_id
) VALUES (
  1,
  2,
  now(),
  1
);

-- ============================
-- FACTURA
-- ============================

INSERT INTO facturas_ventas (
  cliente_id,
  estado_factura_venta_id,
  importe_fventas,
  importe_total_fventas
) VALUES (
  1,
  1,
  30000,
  30000
);

-- ============================
-- DETALLE_CUENTA (FACTURA)
-- ============================

INSERT INTO detalle_cuenta (
  cuenta_id,
  tipo_mov_det_cuenta_id,
  factura_venta_id,
  importe_cuenta,
  observacion_cuenta
) VALUES (
  1,
  1, -- FACTURA
  1,
  30000,
  'Factura mensual'
);

-- ============================
-- PAGO
-- ============================

INSERT INTO pagos (
  contrato_id,
  periodo_anio_pago,
  periodo_mes_pago,
  fecha_pago,
  monto_pago
) VALUES (
  1,
  2026,
  1,
  now(),
  15000
);

-- ============================
-- DETALLE_CUENTA (PAGO)
-- ============================

INSERT INTO detalle_cuenta (
  cuenta_id,
  tipo_mov_det_cuenta_id,
  pago_id,
  importe_cuenta,
  observacion_cuenta
) VALUES (
  1,
  2, -- PAGO
  1,
  15000,
  'Pago parcial'
);

