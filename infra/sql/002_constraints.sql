-- ==========================================
-- Constraints (relaciones / cardinalidades)
-- ==========================================

-- ============================
-- CLIENTES
-- ============================
ALTER TABLE clientes
  ADD CONSTRAINT fk_clientes_estado
  FOREIGN KEY (estado_cliente_id)
  REFERENCES estado_cliente(estado_cliente_id);
  
ALTER TABLE clientes
  ADD CONSTRAINT uq_clientes_dni
  UNIQUE (dni_cliente);

-- ============================
-- CLIENTE_DOMICILIO
-- ============================
ALTER TABLE cliente_domicilio
  ADD CONSTRAINT fk_clidom_cliente
  FOREIGN KEY (cliente_id)
  REFERENCES clientes(cliente_id);

ALTER TABLE cliente_domicilio
  ADD CONSTRAINT fk_clidom_domicilio
  FOREIGN KEY (domicilio_id)
  REFERENCES domicilio(domicilio_id);

-- ============================
-- CUENTA
-- ============================
ALTER TABLE cuenta
  ADD CONSTRAINT fk_cuenta_cliente
  FOREIGN KEY (cliente_id)
  REFERENCES clientes(cliente_id);

ALTER TABLE cuenta
  ADD CONSTRAINT uq_cuenta_cliente
  UNIQUE (cliente_id);

ALTER TABLE cuenta
  ADD CONSTRAINT fk_cuenta_estado
  FOREIGN KEY (estado_cuenta_id)
  REFERENCES estado_cuenta(estado_cuenta_id);

-- ============================
-- DETALLE_CUENTA
-- ============================
ALTER TABLE detalle_cuenta
  ADD CONSTRAINT fk_detcuenta_cuenta
  FOREIGN KEY (cuenta_id)
  REFERENCES cuenta(cuenta_id);

ALTER TABLE detalle_cuenta
  ADD CONSTRAINT fk_detcuenta_tipo_mov
  FOREIGN KEY (tipo_mov_det_cuenta_id)
  REFERENCES tipo_movimiento_detalle_cuenta(tipo_mov_det_cuenta_id);

ALTER TABLE detalle_cuenta
  ADD CONSTRAINT fk_detcuenta_factura
  FOREIGN KEY (factura_venta_id)
  REFERENCES facturas_ventas(factura_venta_id);

ALTER TABLE detalle_cuenta
  ADD CONSTRAINT fk_detcuenta_pago
  FOREIGN KEY (pago_id)
  REFERENCES pagos(pago_id);

ALTER TABLE detalle_cuenta
  ADD CONSTRAINT chk_detcuenta_importe_positivo
  CHECK (importe_cuenta > 0);

ALTER TABLE detalle_cuenta
  ADD CONSTRAINT chk_detcuenta_origen
  CHECK (
    (factura_venta_id IS NOT NULL AND pago_id IS NULL)
    OR
    (factura_venta_id IS NULL AND pago_id IS NOT NULL)
    OR
    (factura_venta_id IS NULL AND pago_id IS NULL)
  );

-- ============================
-- TIPO_MOVIMIENTO_DETALLE_CUENTA
-- ============================
ALTER TABLE tipo_movimiento_detalle_cuenta
  ADD CONSTRAINT uq_tmdc_codigo
  UNIQUE (codigo_tipo_mov_det_cuenta);

ALTER TABLE tipo_movimiento_detalle_cuenta
  ADD CONSTRAINT chk_tmdc_signo
  CHECK (signo_tipo_mov_det_cuenta IN ('D','H'));

-- ============================
-- PLANES
-- ============================
ALTER TABLE planes
  ADD CONSTRAINT fk_planes_estado
  FOREIGN KEY (estado_plan_id)
  REFERENCES estado_plan(estado_plan_id);

-- ============================
-- PRECIOS_PLANES
-- ============================
ALTER TABLE precios_planes
  ADD CONSTRAINT fk_pplanes_plan
  FOREIGN KEY (plan_id)
  REFERENCES planes(plan_id);

ALTER TABLE precios_planes
  ADD CONSTRAINT fk_pplanes_promo
  FOREIGN KEY (promocion_id)
  REFERENCES promociones(promocion_id);

-- ============================
-- CONTRATOS
-- ============================
ALTER TABLE contratos
  ADD CONSTRAINT fk_contrato_cliente
  FOREIGN KEY (cliente_id)
  REFERENCES clientes(cliente_id);

ALTER TABLE contratos
  ADD CONSTRAINT fk_contrato_plan
  FOREIGN KEY (plan_id)
  REFERENCES planes(plan_id);

ALTER TABLE contratos
  ADD CONSTRAINT fk_contrato_estado
  FOREIGN KEY (estado_contrato_id)
  REFERENCES estado_contrato(estado_contrato_id);

-- ============================
-- PAGOS
-- ============================
ALTER TABLE pagos
  ADD CONSTRAINT fk_pago_contrato
  FOREIGN KEY (contrato_id)
  REFERENCES contratos(contrato_id);

-- ============================
-- PROGRAMACION_INSTALACIONES
-- ============================
ALTER TABLE programacion_instalaciones
  ADD CONSTRAINT fk_pinstalacion_domicilio
  FOREIGN KEY (domicilio_id)
  REFERENCES domicilio(domicilio_id);

ALTER TABLE programacion_instalaciones
  ADD CONSTRAINT fk_pinstalacion_plan
  FOREIGN KEY (plan_id)
  REFERENCES planes(plan_id);

ALTER TABLE programacion_instalaciones
  ADD CONSTRAINT fk_pinstalacion_estado
  FOREIGN KEY (estado_programacion_id)
  REFERENCES estado_programacion(estado_programacion_id);

-- ============================
-- INSTALACIONES
-- ============================
ALTER TABLE instalaciones
  ADD CONSTRAINT fk_instalacion_programacion
  FOREIGN KEY (programacion_id)
  REFERENCES programacion_instalaciones(programacion_id);

ALTER TABLE instalaciones
  ADD CONSTRAINT fk_instalacion_domicilio
  FOREIGN KEY (domicilio_id)
  REFERENCES domicilio(domicilio_id);

ALTER TABLE instalaciones
  ADD CONSTRAINT fk_instalacion_estado
  FOREIGN KEY (estado_instalacion_id)
  REFERENCES estado_instalacion(estado_instalacion_id);

-- ============================
-- DETALLE_INSTALACION
-- ============================
ALTER TABLE detalle_instalacion
  ADD CONSTRAINT fk_dinstalacion_instalacion
  FOREIGN KEY (instalacion_id)
  REFERENCES instalaciones(instalacion_id);

ALTER TABLE detalle_instalacion
  ADD CONSTRAINT fk_dinstalacion_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

-- ============================
-- GARANTIA
-- ============================
ALTER TABLE garantia
  ADD CONSTRAINT fk_garantia_instalacion
  FOREIGN KEY (instalacion_id)
  REFERENCES instalaciones(instalacion_id);

ALTER TABLE garantia
  ADD CONSTRAINT fk_garantia_contrato
  FOREIGN KEY (contrato_id)
  REFERENCES contratos(contrato_id);

ALTER TABLE garantia
  ADD CONSTRAINT fk_garantia_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

ALTER TABLE garantia
  ADD CONSTRAINT fk_garantia_estado
  FOREIGN KEY (estado_garantia_id)
  REFERENCES estado_garantia(estado_garantia_id);

ALTER TABLE garantia
  ADD CONSTRAINT uq_garantia_instalacion_producto
  UNIQUE (instalacion_id, producto_id);

-- ============================
-- PRODUCTOS
-- ============================
ALTER TABLE productos
  ADD CONSTRAINT fk_producto_tipo
  FOREIGN KEY (tipo_producto_id)
  REFERENCES tipo_producto(tipo_producto_id);

-- ============================
-- PRODUCTO_PRESENTACION
-- ============================
ALTER TABLE producto_presentacion
  ADD CONSTRAINT fk_pp_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

-- ============================
-- PRODUCTO_KIT_DETALLE
-- ============================
ALTER TABLE producto_kit_detalle
  ADD CONSTRAINT fk_kit_producto
  FOREIGN KEY (producto_kit_id)
  REFERENCES productos(producto_id);

ALTER TABLE producto_kit_detalle
  ADD CONSTRAINT fk_kit_componente
  FOREIGN KEY (producto_componente_id)
  REFERENCES productos(producto_id);

-- ============================
-- LISTA_PRECIOS_COMPRA
-- ============================
ALTER TABLE lista_precios_compra
  ADD CONSTRAINT fk_lpc_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

ALTER TABLE lista_precios_compra
  ADD CONSTRAINT fk_lpc_presentacion
  FOREIGN KEY (presentacion_id)
  REFERENCES producto_presentacion(presentacion_id);

ALTER TABLE lista_precios_compra
  ADD CONSTRAINT fk_lpc_proveedor
  FOREIGN KEY (proveedor_id)
  REFERENCES proveedor(proveedor_id);

-- ============================
-- MOVIMIENTO_STOCK_ITEM
-- ============================
ALTER TABLE movimiento_stock_item
  ADD CONSTRAINT fk_msi_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

-- ============================
-- MOVIMIENTO_STOCK
-- ============================
ALTER TABLE movimiento_stock
  ADD CONSTRAINT fk_ms_item
  FOREIGN KEY (mov_stock_item_id)
  REFERENCES movimiento_stock_item(mov_stock_item_id);

ALTER TABLE movimiento_stock
  ADD CONSTRAINT fk_ms_tipo
  FOREIGN KEY (tipo_mov_id)
  REFERENCES tipo_movimiento_stock(tipo_mov_id);

ALTER TABLE movimiento_stock
  ADD CONSTRAINT fk_ms_det_instalacion
  FOREIGN KEY (det_instalacion_id)
  REFERENCES detalle_instalacion(det_instalacion_id);

-- ============================
-- PROVEEDOR
-- ============================
ALTER TABLE proveedor
  ADD CONSTRAINT fk_proveedor_estado
  FOREIGN KEY (estado_proveedor_id)
  REFERENCES estado_proveedor(estado_proveedor_id);

-- ============================
-- FACTURAS_COMPRAS
-- ============================
ALTER TABLE facturas_compras
  ADD CONSTRAINT fk_fcompra_proveedor
  FOREIGN KEY (proveedor_id)
  REFERENCES proveedor(proveedor_id);

-- ============================
-- DETALLE_FACTURAS_COMPRAS
-- ============================
ALTER TABLE detalle_facturas_compras
  ADD CONSTRAINT fk_dfcompra_factura
  FOREIGN KEY (factura_compra_id)
  REFERENCES facturas_compras(factura_compra_id);

ALTER TABLE detalle_facturas_compras
  ADD CONSTRAINT fk_dfcompra_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

-- ============================
-- FACTURAS_VENTAS
-- ============================
ALTER TABLE facturas_ventas
  ADD CONSTRAINT fk_fventa_cliente
  FOREIGN KEY (cliente_id)
  REFERENCES clientes(cliente_id);

ALTER TABLE facturas_ventas
  ADD CONSTRAINT fk_fventa_estado
  FOREIGN KEY (estado_factura_venta_id)
  REFERENCES estado_facturas_ventas(estado_fact_venta_id);

-- ============================
-- DETALLE_FACTURAS_VENTAS
-- ============================
ALTER TABLE detalle_facturas_ventas
  ADD CONSTRAINT fk_dfventa_factura
  FOREIGN KEY (factura_venta_id)
  REFERENCES facturas_ventas(factura_venta_id);

ALTER TABLE detalle_facturas_ventas
  ADD CONSTRAINT fk_dfventa_producto
  FOREIGN KEY (producto_id)
  REFERENCES productos(producto_id);

ALTER TABLE detalle_facturas_ventas
  ADD CONSTRAINT fk_dfventa_estado
  FOREIGN KEY (estado_det_fact_venta_id)
  REFERENCES estado_detalle_facturas_ventas(estado_det_fact_ventas_id);

-- ============================
-- DETALLE_RECIBOS
-- ============================
ALTER TABLE detalle_recibos
  ADD CONSTRAINT fk_drecibo_recibo
  FOREIGN KEY (recibo_id)
  REFERENCES recibos(recibo_id);

ALTER TABLE detalle_recibos
  ADD CONSTRAINT fk_drecibo_factura
  FOREIGN KEY (factura_venta_id)
  REFERENCES facturas_ventas(factura_venta_id);

