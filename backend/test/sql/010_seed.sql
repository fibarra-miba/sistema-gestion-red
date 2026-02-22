-- ======================================================
-- 010_seed.sql - Dataset mínimo para testing contratos
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
-- PLANES
-- ============================

INSERT INTO planes (
  nombre_plan,
  velocidad_mbps_plan,
  estado_plan_id,
  descripcion_plan
) VALUES
  ('Plan Básico', 10, 1, 'Plan 10 Mbps'),
  ('Plan Intermedio', 20, 1, 'Plan 20 Mbps'),
  ('Plan Avanzado', 40, 1, 'Plan 40 Mbps');

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
  'Testing',
  '12345678',
  '3870000000',
  'cliente.testing@red.local',
  NOW(),
  1,  -- ACTIVO
  'Seed testing contratos'
);

-- ============================
-- DOMICILIO
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
  1,
  'Torre A',
  3,
  'D',
  'Av. Principal',
  123,
  'Puerta azul',
  NOW(),
  NULL,
  1   -- VIGENTE
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
  1   -- AL DIA
);
