-- RED - Seed base (catálogos)

INSERT INTO estado_cliente (descripcion) VALUES
  ('ACTIVO'),
  ('INACTIVO'),
  ('SUSPENDIDO')
ON CONFLICT DO NOTHING;

INSERT INTO estado_instalacion (descripcion) VALUES
  ('SOLICITADA'),
  ('PROGRAMADA'),
  ('INSTALADA'),
  ('CANCELADA')
ON CONFLICT DO NOTHING;

INSERT INTO estado_plan (descripcion) VALUES
  ('ACTIVO'),
  ('INACTIVO')
ON CONFLICT DO NOTHING;

INSERT INTO estado_contrato (descripcion) VALUES
  ('VIGENTE'),
  ('FINALIZADO'),
  ('SUSPENDIDO')
ON CONFLICT DO NOTHING;
