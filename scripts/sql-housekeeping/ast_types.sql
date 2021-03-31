WITH node_types AS (
  SELECT  jsonb_path_query_array(visualisations, '$.*.*.type') AS node_type, *
  FROM grammars
)
SELECT *
FROM node_types
WHERE node_type ? 'visualise';