WITH ids_with_type AS (
  SELECT id, 'project' as type
  FROM projects
  UNION
  SELECT id, 'grammar' as type
  FROM grammars
  UNION
  SELECT id, 'block_language' as type
  FROM block_languages
  UNION
  SELECT id, 'code_resource' as type
  FROM code_resources
)
SELECT *
FROM ids_with_type
WHERE id = '9a60f61b-62ef-4ae6-bc6a-ff8218699f58';