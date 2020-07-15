-- Calculates storage sizes for code_resource.
--
-- Example Output:
-- Name                         total   jsonb   cache   jsonb%  cache%
----------------------------------------------------------------------
-- 00 Grammar                   2249    1529    593     0.68    0.26
-- Beitrag mit Kommentaren      1967    1731    115     0.88    0.06
-- Gefangene Typen              1954    1701    142     0.87    0.07
-- Hörspiele pro Jahr           1930    1611    206     0.83    0.11
-- Lösung - Aufgabe 8           1912    850     940     0.44    0.49
SELECT
  name, total_size, jsonb_size, cache_size,
  round(jsonb_size::decimal / total_size, 2)  as "jsonb_size_percent",
  round(cache_size::decimal / total_size, 2)  as "cache_size_percent"
FROM (
SELECT
  name,
  ast,
  compiled,
  pg_column_size(c.*) as "total_size",
  pg_column_size(ast)  as "jsonb_size",
  pg_column_size(compiled)  as "cache_size"
FROM code_resources c
) s
ORDER BY total_size DESC;