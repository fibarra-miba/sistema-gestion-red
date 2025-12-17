-- RED - Diagnostics (uso manual)
-- Objetivo: consultas de inspección para tablas, columnas, constraints y secuencias.

-- 1) Listar tablas (schema public)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- 2) Ver columnas de una tabla (cambiar 'clientes' por la que quieras)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clientes'
ORDER BY ordinal_position;


-- 3) Ver constraints (PK/UNIQUE/FK/CHECK) de una tabla (cambiar 'clientes')
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name  AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.table_schema = ccu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'clientes'
ORDER BY tc.constraint_type, tc.constraint_name, kcu.column_name;


-- 4) Secuencia asociada a un SERIAL/BIGSERIAL (cambiar tabla/columna)
SELECT pg_get_serial_sequence('clientes', 'cliente_id') AS serial_sequence_name;


-- 5) Estado de una secuencia (reemplazar por el nombre real devuelto por #4)
-- Ejemplo típico: clientes_cliente_id_seq
SELECT last_value, is_called
FROM clientes_cliente_id_seq;


-- 6) Ver índices de una tabla (cambiar 'clientes')
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'clientes'
ORDER BY indexname;


-- 7) (Opcional) Ver definición completa de la tabla (cambiar 'clientes')
-- Nota: requiere psql para \d+ (no es SQL estándar).
-- \d+ clientes


-- 8) (PELIGRO/DEBUG) Consumir próximo valor de secuencia (AVANZA la secuencia)
-- Usar solo para entender comportamiento, no como rutina.
-- SELECT nextval('clientes_cliente_id_seq');

