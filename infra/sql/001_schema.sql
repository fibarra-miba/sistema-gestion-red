-- RED - Esquema base (según DER v1)
-- PostgreSQL

-- =========================
-- Catálogos / estados
-- =========================
CREATE TABLE IF NOT EXISTS estado_cliente (
  estado_cliente_id BIGSERIAL PRIMARY KEY,
  descripcion       VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_instalacion (
  estado_instalacion_id BIGSERIAL PRIMARY KEY,
  descripcion           VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_plan (
  estado_plan_id BIGSERIAL PRIMARY KEY,
  descripcion    VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_contrato (
  estado_contrato_id BIGSERIAL PRIMARY KEY,
  descripcion        VARCHAR(100) NOT NULL
);

-- =========================
-- Tablas principales
-- =========================
CREATE TABLE IF NOT EXISTS clientes (
  cliente_id        BIGSERIAL PRIMARY KEY,
  nombre            VARCHAR(50)  NOT NULL,
  apellido          VARCHAR(50)  NOT NULL,
  dni               VARCHAR(20)  NOT NULL,
  telefono          VARCHAR(20)  NOT NULL,
  cliente_domicilio_id BIGINT,
  email             VARCHAR(100),
  fecha_alta        TIMESTAMPTZ,
  estado_cliente_id BIGINT NOT NULL,
  observaciones     VARCHAR(100),

  CONSTRAINT uq_clientes_dni UNIQUE (dni),
  CONSTRAINT fk_clientes_estado
    FOREIGN KEY (estado_cliente_id) REFERENCES estado_cliente(estado_cliente_id)
  -- CONSTRAINT fk_cliente_domicilio
  --   FOREIGN KEY (cliente_domicilio_id) REFERENCES cliente_domicilio(cliente_domicilio_id)
);

CREATE TABLE IF NOT EXISTS domicilio (
  domicilio_id BIGSERIAL PRIMARY KEY,
  complejo     VARCHAR(50),
  piso         INTEGER,
  depto        VARCHAR(5),
  calle        VARCHAR(100),
  numero       INTEGER,
  referencias  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS planes (
  plan_id         BIGSERIAL PRIMARY KEY,
  nombre_plan     VARCHAR(50) NOT NULL,
  velocidad_mbps  INTEGER NOT NULL CHECK (velocidad_mbps > 0),
  precio_mensual  NUMERIC(12,2) NOT NULL CHECK (precio_mensual >= 0),
  estado_plan_id  BIGINT NOT NULL,
  descripcion     VARCHAR(100),

  CONSTRAINT fk_planes_estado
    FOREIGN KEY (estado_plan_id) REFERENCES estado_plan(estado_plan_id)
);

CREATE TABLE IF NOT EXISTS instalaciones (
  instalacion_id        BIGSERIAL PRIMARY KEY,
  domicilio_id          BIGINT NOT NULL,
  plan_id               BIGINT NOT NULL,
  fecha_solicitud       TIMESTAMPTZ NOT NULL,
  fecha_programada      TIMESTAMPTZ,
  fecha_instalacion     TIMESTAMPTZ,
  estado_instalacion_id BIGINT NOT NULL,
  tecnico               VARCHAR(50),
  notas                 VARCHAR(100),

  -- Domicilio (1) - (1) Instalaciones: domicilio_id UNIQUE
  CONSTRAINT uq_instalaciones_domicilio UNIQUE (domicilio_id),

  CONSTRAINT fk_instalaciones_domicilio
    FOREIGN KEY (domicilio_id) REFERENCES domicilio(domicilio_id),

  CONSTRAINT fk_instalaciones_plan
    FOREIGN KEY (plan_id) REFERENCES planes(plan_id),

  CONSTRAINT fk_instalaciones_estado
    FOREIGN KEY (estado_instalacion_id) REFERENCES estado_instalacion(estado_instalacion_id)
);

CREATE TABLE IF NOT EXISTS contratos (
  contrato_id       BIGSERIAL PRIMARY KEY,
  instalacion_id    BIGINT NOT NULL,
  cliente_id        BIGINT NOT NULL,
  plan_id           BIGINT NOT NULL,
  fecha_inicio      TIMESTAMPTZ NOT NULL,
  fecha_fin         TIMESTAMPTZ,
  estado_contrato_id BIGINT NOT NULL,

  CONSTRAINT fk_contratos_instalacion
    FOREIGN KEY (instalacion_id) REFERENCES instalaciones(instalacion_id),

  CONSTRAINT fk_contratos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id),

  CONSTRAINT fk_contratos_plan
    FOREIGN KEY (plan_id) REFERENCES planes(plan_id),

  CONSTRAINT fk_contratos_estado
    FOREIGN KEY (estado_contrato_id) REFERENCES estado_contrato(estado_contrato_id)
);

CREATE TABLE IF NOT EXISTS pagos (
  pago_id              BIGSERIAL PRIMARY KEY,
  contrato_id          BIGINT NOT NULL,
  periodo_anio         INTEGER NOT NULL,
  periodo_mes          INTEGER NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  fecha_pago           TIMESTAMPTZ NOT NULL,
  monto                NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
  medio_pago           VARCHAR(20),
  comprobante_path     TEXT,
  comprobante_nombre   VARCHAR(255),
  comprobante_mime     VARCHAR(100),
  comprobante_sha256   CHAR(64),
  comprobante_size     INTEGER CHECK (comprobante_size >= 0),

  CONSTRAINT fk_pagos_contrato
    FOREIGN KEY (contrato_id) REFERENCES contratos(contrato_id)
);

-- =========================
-- Relación histórico cliente-domicilio
-- =========================
CREATE TABLE IF NOT EXISTS cliente_domicilio (
  cliente_domicilio_id BIGSERIAL PRIMARY KEY,
  cliente_id           BIGINT NOT NULL,
  domicilio_id         BIGINT NOT NULL,
  fecha_desde          TIMESTAMPTZ NOT NULL,
  fecha_hasta          TIMESTAMPTZ,

  CONSTRAINT fk_cd_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id),

  CONSTRAINT fk_cd_domicilio
    FOREIGN KEY (domicilio_id) REFERENCES domicilio(domicilio_id)
);

-- Si realmente querés que clientes.cliente_domicilio_id apunte a un registro "actual" de cliente_domicilio:
-- (Esto no estaba del todo claro, pero el DER lo sugiere.)
ALTER TABLE clientes
  ADD CONSTRAINT fk_clientes_cliente_domicilio
  FOREIGN KEY (cliente_domicilio_id) REFERENCES cliente_domicilio(cliente_domicilio_id);

-- =========================
-- Usuarios (sin relaciones por ahora)
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id    BIGSERIAL PRIMARY KEY,
  tipo_usuario  VARCHAR(10) NOT NULL,
  descripcion   VARCHAR(100)
);

-- =========================
-- Índices útiles
-- =========================
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_instalacion_id ON contratos(instalacion_id);
CREATE INDEX IF NOT EXISTS idx_contratos_plan_id ON contratos(plan_id);
CREATE INDEX IF NOT EXISTS idx_pagos_contrato_id ON pagos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_cd_cliente_id ON cliente_domicilio(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cd_domicilio_id ON cliente_domicilio(domicilio_id);
