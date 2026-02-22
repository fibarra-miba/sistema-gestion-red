-- RED - Esquema base (según DER v1)
-- PostgreSQL

-- ======================================================
-- 1. CATÁLOGOS / TABLAS DE ESTADO
-- ======================================================
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

CREATE TABLE IF NOT EXISTS estado_garantia (
  estado_garantia_id 	BIGSERIAL PRIMARY KEY,
  descripcion_egarantia	VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estado_proveedor (
  estado_proveedor_id 	BIGSERIAL PRIMARY KEY,
  descripcion_eprov 	VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estado_facturas_ventas (
  estado_fact_venta_id 	BIGSERIAL PRIMARY KEY,
  descripcion_efventa 	VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estado_detalle_facturas_ventas (
  estado_det_fact_ventas_id 	BIGSERIAL PRIMARY KEY,
  descripcion_dfventas 		VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estado_cuenta (
  estado_cuenta_id 	BIGSERIAL PRIMARY KEY,
  descripcion_ecuenta	VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estado_programacion (
  estado_programacion_id 	BIGSERIAL PRIMARY KEY,
  descripcion_eprogramacion	VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estado_domicilio (
  estado_domicilio_id		BIGSERIAL PRIMARY KEY,
  descripcion_edomicilio	VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS estado_pago (
  estado_pago_id	BIGSERIAL PRIMARY KEY,
  descripcion_epago	VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS tipo_pago (
  tipo_pago_id		BIGSERIAL PRIMARY KEY,
  descripcion_tpago	VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS tipo_movimiento_stock (
  tipo_mov_id 		BIGSERIAL PRIMARY KEY,
  descripcion_tmstock 	VARCHAR(100)
);



-- ======================================================
-- 2. TABLAS PRINCIPALES
-- ======================================================
CREATE TABLE IF NOT EXISTS domicilios (
  domicilio_id		BIGSERIAL PRIMARY KEY,
  cliente_id		BIGINT NOT NULL,
  complejo		VARCHAR(50),
  piso			INTEGER,
  depto			VARCHAR(5),
  calle			VARCHAR(100),
  numero		INTEGER,
  referencias		VARCHAR(100),
  fecha_desde_dom	TIMESTAMPTZ NOT NULL,
  fecha_hasta_dom	TIMESTAMPTZ,
  estado_domicilio	BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  cliente_id		BIGSERIAL PRIMARY KEY,
  nombre_cliente	VARCHAR(50)  NOT NULL,
  apellido_cliente	VARCHAR(50)  NOT NULL,
  dni_cliente		VARCHAR(20)  NOT NULL,
  telefono_cliente	VARCHAR(20)  NOT NULL,
  email_cliente		VARCHAR(100),
  fecha_alta_cliente	TIMESTAMPTZ,
  estado_cliente_id	BIGINT NOT NULL,
  observacion_cliente	VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS contratos (
  contrato_id		BIGSERIAL PRIMARY KEY,
  cliente_id		BIGINT NOT NULL,
  plan_id		BIGINT NOT NULL,
  fecha_inicio_contrato	TIMESTAMPTZ NOT NULL,
  fecha_fin_contrato	TIMESTAMPTZ,
  estado_contrato_id	BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS cuenta (
  cuenta_id               BIGSERIAL PRIMARY KEY,
  cliente_id              BIGINT NOT NULL,
  saldo_cuenta            NUMERIC(12,2),
  estado_cuenta_id        BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_cuenta (
  det_cuenta_id			BIGSERIAL PRIMARY KEY,
  cuenta_id			BIGINT NOT NULL,
  fecha_movimiento_cuenta	TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo_mov_det_cuenta_id	BIGINT NOT NULL,
  factura_venta_id		BIGINT,
  pago_id			BIGINT,
  importe_cuenta		NUMERIC(12,2),
  observacion_cuenta		VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS tipo_movimiento_detalle_cuenta (
  tipo_mov_det_cuenta_id		BIGSERIAL PRIMARY KEY,
  codigo_tipo_mov_det_cuenta		VARCHAR(20) NOT NULL,  -- FACTURA, PAGO, AJUSTE
  descripcion_tipo_mov_det_cuenta	VARCHAR(100) NOT NULL,
  signo_tipo_mov_det_cuenta		CHAR(1) NOT NULL,      -- D (debe) | H (haber)
  activo_tipo_mov_det_cuenta		BOOLEAN NOT NULL DEFAULT TRUE
);



-- ======================================================
-- 3. PLANES, PROMOCIONES Y PRECIOS
-- ======================================================
CREATE TABLE IF NOT EXISTS promociones (
  promocion_id 			BIGSERIAL PRIMARY KEY,
  nombre_promo 			VARCHAR(100) NOT NULL,
  descripcion_promo 		VARCHAR(150),
  fecha_vigencia_desde_promo 	TIMESTAMPTZ NOT NULL,
  fecha_vigencia_hasta_promo 	TIMESTAMPTZ,
  activo_promo 			BOOLEAN
);

CREATE TABLE IF NOT EXISTS precios_planes (
  precios_planes_id 		BIGSERIAL PRIMARY KEY NOT NULL,
  plan_id			BIGINT NOT NULL,
  promocion_id 			BIGINT,
  precio_mensual_pplanes 	NUMERIC(12,2) NOT NULL,
  fecha_desde_pplanes 		TIMESTAMPTZ NOT NULL,
  fecha_hasta_pplanes 		TIMESTAMPTZ,
  activo_pplanes 		BOOLEAN
);

CREATE TABLE IF NOT EXISTS planes (
  plan_id 		BIGSERIAL PRIMARY KEY,
  nombre_plan 		VARCHAR(50) NOT NULL,
  velocidad_mbps_plan 	BIGINT NOT NULL,
  estado_plan_id 	BIGINT NOT NULL,
  descripcion_plan 	VARCHAR(100)
);



-- ======================================================
-- 4. INSTALACIONES Y GARANTÍAS
-- ======================================================
CREATE TABLE IF NOT EXISTS instalaciones (
  instalacion_id 	BIGSERIAL PRIMARY KEY,
  programacion_id	BIGINT NOT NULL,
  domicilio_id		BIGINT NOT NULL,
  codigo_instalacion	VARCHAR(20),
  fecha_instalacion 	TIMESTAMPTZ,
  estado_instalacion_id BIGINT NOT NULL,
  motivo_instalacion 	VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS programacion_instalaciones (
  programacion_id        	BIGSERIAL PRIMARY KEY,
  domicilio_id           	BIGINT NOT NULL,
  plan_id                	BIGINT NOT NULL,
  fecha_solicitud_pinstalacion  TIMESTAMPTZ NOT NULL,
  estado_programacion_id 	BIGINT NOT NULL,
  tecnico_pinstalacion          VARCHAR(50),
  notas_pinstalacion            VARCHAR(100),
  fecha_creacion_pinstalacion   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detalle_instalacion (
  det_instalacion_id 		BIGSERIAL PRIMARY KEY,
  instalacion_id     		BIGINT NOT NULL,
  producto_id        		BIGINT NOT NULL,
  descripcion_item   		VARCHAR(150),
  cantidad_dinstalacion         NUMERIC(10,2) NOT NULL,
  unidad_dinstalacion           VARCHAR(10) NOT NULL,
  observacion_dinstalacion      VARCHAR(200),
  fecha_creacion_dinstalacion	TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS garantia (
  garantia_id           	BIGSERIAL PRIMARY KEY,
  instalacion_id        	BIGINT NOT NULL,
  contrato_id           	BIGINT NOT NULL,
  producto_id           	BIGINT NOT NULL,
  fecha_inicio_garantia 	TIMESTAMPTZ NOT NULL,
  fecha_fin_garantia    	TIMESTAMPTZ,
  estado_garantia_id    	BIGINT NOT NULL,
  motivo_garantia               VARCHAR(200),
  resolucion_garantia           TEXT,
  fecha_creacion_garantia       TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- ======================================================
-- 5. PRODUCTOS, STOCK Y COMPRAS
-- ======================================================
CREATE TABLE IF NOT EXISTS producto_presentacion (
  presentacion_id 		BIGSERIAL PRIMARY KEY,
  producto_id			BIGINT NOT NULL,
  nombre_presentacion 		VARCHAR(150) NOT NULL,
  unidad_compra_presentacion 	VARCHAR(15) NOT NULL,
  factor_a_stock 		NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS producto_kit_detalle (
  producto_kit_id 		BIGINT NOT NULL,
  producto_componente_id	BIGINT NOT NULL,
  cantidad_kit	 		NUMERIC(12,2) NOT NULL,

  CONSTRAINT pk_producto_kit_detalle
    PRIMARY KEY (producto_kit_id, producto_componente_id)
);

CREATE TABLE IF NOT EXISTS tipo_producto (
  tipo_producto_id	BIGSERIAL PRIMARY KEY,
  codigo		VARCHAR(20) NOT NULL,
  descripcion		VARCHAR(100) NOT NULL,
  activo		BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS productos (
  producto_id 		BIGSERIAL PRIMARY KEY,
  nombre_producto 	VARCHAR(150) NOT NULL,
  descripcion_producto 	VARCHAR(200),
  marca_producto 	VARCHAR(50),
  modelo_producto 	VARCHAR(50),
  activo_producto 	BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_producto_id	BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS lista_precios_compra (
  precio_compra_id 	BIGSERIAL PRIMARY KEY,
  producto_id 		BIGINT NOT NULL,
  presentacion_id	BIGINT NOT NULL,
  precio_compra 	NUMERIC(12,2) NOT NULL,
  proveedor_id 		BIGINT,
  fecha_pcompra		TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimiento_stock_item (
  mov_stock_item_id 	BIGSERIAL PRIMARY KEY,
  producto_id 		BIGINT NOT NULL,
  observacion_dmstock 	VARCHAR(150),
  factor_b_stock 	NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS movimiento_stock (
  mov_stock_id 		BIGSERIAL PRIMARY KEY,
  mov_stock_item_id 	BIGINT NOT NULL,
  tipo_mov_id 		BIGINT NOT NULL,
  fecha_mstock 		TIMESTAMPTZ NOT NULL,
  det_instalacion_id 	BIGINT
);



-- ======================================================
-- 6. PROVEEDORES Y COMPRAS
-- ======================================================
CREATE TABLE IF NOT EXISTS proveedor (
  proveedor_id 		BIGSERIAL PRIMARY KEY,
  nombre_prov 		VARCHAR(150),
  direccion_prov 	VARCHAR(150),
  descripcion_prov 	VARCHAR(200),
  link_maps_prov 	TEXT,
  telefono_prov 	VARCHAR(30),
  email_prov 		VARCHAR(120),
  web_prov 		VARCHAR(100),
  observacion_prov 	TEXT,
  estado_proveedor_id 	BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS facturas_compras (
  factura_compra_id 	BIGSERIAL PRIMARY KEY,
  proveedor_id 		BIGINT NOT NULL,
  descripcion_fcompras 	VARCHAR(200),
  codigo_fcompras 	VARCHAR(50),
  fecha_fcompras 	TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detalle_facturas_compras (
  det_factura_compra_id BIGSERIAL PRIMARY KEY,
  factura_compra_id	BIGINT NOT NULL,
  producto_id 		BIGINT NOT NULL,
  factor_b_stock 	NUMERIC(12,2) NOT NULL
);



-- ======================================================
-- 7. FACTURACIÓN, PAGOS Y RECIBOS
-- ======================================================
CREATE TABLE IF NOT EXISTS facturas_ventas (
  factura_venta_id 		BIGSERIAL PRIMARY KEY,
  cliente_id 			BIGINT NOT NULL,
  concepto_fventas 		VARCHAR(200),
  estado_factura_venta_id 	BIGINT NOT NULL,
  fecha_emision_fventas 	TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_vencimiento_fventas	TIMESTAMPTZ,
  importe_fventas 		NUMERIC(12,2) NOT NULL,
  bonificacion_fventas 		NUMERIC(12,2) DEFAULT 0,
  importe_total_fventas 	NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_facturas_ventas (
  det_factura_venta_id 		BIGSERIAL PRIMARY KEY,
  factura_venta_id 		BIGINT NOT NULL,
  producto_id 			BIGINT NOT NULL,
  estado_det_fact_venta_id	BIGINT NOT NULL,
  precio_dfventas		NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos (
  pago_id		BIGSERIAL PRIMARY KEY,
  contrato_id		BIGINT NOT NULL,
  factura_ventas_id	BIGINT NOT NULL,
  periodo_anio_pago	INTEGER NOT NULL,
  periodo_mes_pago	INTEGER NOT NULL CHECK (periodo_mes_pago BETWEEN 1 AND 12),
  estado_pago_id	BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos_movimientos (
  pago_mov_id		BIGSERIAL PRIMARY KEY,
  pago_id		BIGINT NOT NULL,
  fecha_pago		TIMESTAMPTZ NOT NULL,
  monto_pago		NUMERIC(12,2) NOT NULL CHECK (monto_pago >= 0),
  medio_pago		VARCHAR(20),
  tipo_pago_id		BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS recibos (
  recibo_id				BIGSERIAL PRIMARY KEY NOT NULL,
  comprobante_transferencia_recibo	VARCHAR(200),
  recepcion_transferencia_recibo	BOOLEAN,
  importe_recibo 			NUMERIC(12,2) NOT NULL,
  fecha_recibo 				TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detalle_recibos (
  det_recibo_id 	BIGSERIAL PRIMARY KEY,
  recibo_id 		BIGINT NOT NULL,
  factura_venta_id	BIGINT NOT NULL
);



-- ======================================================
-- 8. USUARIOS
-- ======================================================
CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id		BIGSERIAL PRIMARY KEY,
  tipo_usuario		VARCHAR(10) NOT NULL,
  descripcion_usuario	VARCHAR(100)
);

