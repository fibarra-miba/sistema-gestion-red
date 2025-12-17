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

-- RED - Seed clientes (datos de prueba)

INSERT INTO clientes (
    nombre,
    apellido,
    dni,
    telefono,
    email,
    fecha_alta,
    estado_cliente_id,
    observaciones
) VALUES
(
    'Juan',
    'Pérez',
    '30123456',
    '3874123456',
    'juan.perez@email.com',
    NOW(),
    1,
    'Cliente activo de prueba'
),
(
    'María',
    'Gómez',
    '28987654',
    '3874987654',
    'maria.gomez@email.com',
    NOW(),
    1,
    'Alta reciente'
),
(
    'Carlos',
    'Rodríguez',
    '27111222',
    '3874555666',
    'carlos.rodriguez@email.com',
    NOW(),
    2,
    'Cliente inactivo'
),
(
    'Lucía',
    'Fernández',
    '31999888',
    '3874777888',
    NULL,
    NOW(),
    3,
    'Suspendido por falta de pago'
)
ON CONFLICT (dni) DO NOTHING;

